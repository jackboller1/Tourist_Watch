import os
import requests
from flask import Blueprint, request, jsonify, url_for, redirect, session
from crime_grouping import crime_standardization, crime_type_fields, assoc_list1, assoc_list2, assoc_list3
from city_info import url_group, date_field_group, location_field_group
from db_setup import testimonials_db, users_db
from db_operations import insert_testimonial
from bson.objectid import ObjectId

APP_TOKEN = os.environ.get("SOCRATA_APP_TOKEN")
POSITION_STACK_KEY = os.environ.get("POSITION_STACK_APIKEY")

#create standardization for crime among different cities
crime_group = {}
crime_standardization(crime_group, "Chicago", assoc_list1)
crime_standardization(crime_group, "Austin", assoc_list2)
crime_standardization(crime_group, "New York", assoc_list3)
crime_standardization(crime_group, "Kansas City", assoc_list2)

#function to return the city, lat, long coordinates given the address
def address_to_location(address):
    #get the response from position stack api
    url_geocode = f"http://api.positionstack.com/v1/forward?access_key={POSITION_STACK_KEY}&query={address}"
    response_geocode = requests.get(url_geocode).json()
    lat = response_geocode["data"][0]["latitude"]
    long = response_geocode["data"][0]["longitude"]
    city = response_geocode["data"][0]["locality"]
    return (city, lat, long)

api = Blueprint('api', __name__)

@api.route("/city", methods=['POST'])
def display_crime_data():
    #get the address sent
    request_data = request.get_json() #get the json data sent
    address = request_data.get("address")

    #get the response from position stack api
    city, lat, long = address_to_location(address)

    #get the filtered set of crimes from socrata api
    city_url = url_group[city]
    date_field = date_field_group[city]
    location_field = location_field_group[city]
    url_crime = f"{city_url}$where={date_field} between '2021-01-01T12:00:00' and '2021-12-31T23:59:59' AND within_circle({location_field}, {lat}, {long}, 2500)&$$app_token={APP_TOKEN}"
    response_crime = requests.get(url_crime).json()

    #create list of crimes that fall into specific categories
    incidents_list = []
    for report in response_crime:
        #only send crimes that fall in one of the 7 categories being tracked
        if crime_type_fields[city] in report: #the response from socrata api has the correct field
            crime_type = report[crime_type_fields[city]] #crime type sent from socrata api
            if crime_type in crime_group[city]: #the crime type is one of the few that we want to track
                incident_dict = {}
                incident_dict["latitude"] = report["latitude"]
                incident_dict["longitude"] = report["longitude"]
                incident_dict["crime_type"] = crime_group[city][crime_type]
                incidents_list.append(incident_dict)

    #create list of testimonials for the city
    user_name = None
    if "user_name" in session:
        user_name = session["user_name"]
    
    testimonials_list = []
    #get all testimonials from the city being searched
    cursor = testimonials_db.find({"city" : city})
    for testimonial in cursor:
        #check if the testimonial has been reviewed by the user
        testimonial_id = testimonial.get("_id")
        #default value if testimonial was not reviewed
        user_num_stars = -1
        if user_name:
            command_cursor = users_db.aggregate([
                {"$unwind" : "$reviews"},
                {"$match" : { "user_name" : user_name, "reviews.testimonial_id" : testimonial_id }},
                {"$project" : { "num_stars":  "$reviews.num_stars", "_id" : 0}}
            ])
            #store how many stars the user gave the testimonial
            for document in command_cursor:
                user_num_stars = document["num_stars"]
            
        testimonial["user_num_stars"] = user_num_stars
        testimonial["_id"] = str(testimonial_id)
        testimonials_list.append(testimonial)
      
    city_list = [incidents_list, testimonials_list]
    return jsonify(city_list)



@api.route("/rate-testimonial", methods=['POST'])
def rate_testimonial():
    #do not allow the user to rate a testimonial if they are not logged in
    if "user_name" not in session:
        return jsonify({
            "status" : False,
            "message" : "User must be logged in to rate a testimonial."
        })

    #get json data in request
    request_data = request.get_json()
    testimonial_id = request_data.get("testimonial_id")
    num_stars = int(request_data.get("num_stars"))

    user_name = session["user_name"]
    user_review = users_db.find_one({
        "$and" : [
            {"user_name" : user_name}, 
            {"reviews.testimonial_id" : ObjectId(testimonial_id)}
        ]
    })
    
    #user has not made a review for this testimonial
    if not user_review:
        #increment number of reviews and add the number of stars associated with the testimonial id
        #add the entry to reviews
        users_db.update_one(
            {"user_name" : user_name},
            {
                "$push" : {
                    "reviews" : {
                        "testimonial_id" : ObjectId(testimonial_id),
                        "num_stars" : num_stars
                    }
                }
            })
        #update total stars and num reviews
        testimonials_db.update_one(
            {"_id" : ObjectId(testimonial_id)},
            {"$inc" : {"num_reviews" : 1, "total_stars" : num_stars}}
        )

        return jsonify({
            "status" : True,
            "message" : "Review successfully created."
        })

    #user already made a review for this testimonial
    #find the prev number of stars the user gave the review
    command_cursor = users_db.aggregate([
                {"$unwind" : "$reviews"},
                {"$match" : { "user_name" : user_name, "reviews.testimonial_id" : ObjectId(testimonial_id) }},
                {"$project" : { "num_stars":  "$reviews.num_stars", "_id" : 0}}
            ])
    #store how many stars the user gave the testimonial
    for document in command_cursor:
        prev_stars = document["num_stars"]
    #update the new number of stars in user reviews
    users_db.update_one({
        "$and" : [
            {"user_name" : user_name}, 
            {"reviews.testimonial_id" : ObjectId(testimonial_id)}
        ]},
        {"$set" : {"reviews.$.num_stars" : num_stars}}
    )

    #update total number of stars for the testimonial
    testimonials_db.update_one(
            {"_id" : ObjectId(testimonial_id)},
            {"$inc" : {"total_stars" : num_stars-prev_stars}}
        )

    return jsonify({
        "status" : True,
        "message" : "Review successfully updated"
    })



    

@api.route("/create-testimonial", methods=['POST'])
def create_testimonial():
    #do not allow the user to create a testimonial if they are not logged in
    if "user_name" not in session:
        return jsonify({
            "status" : False,
            "message" : "User must be logged in to create a testimonial."
        })
    
    request_data = request.get_json() #get the json data sent
    address = request_data.get("address")
    category = request_data.get("category")
    text = request_data.get("text")

    #get city, lat, long from address
    city, lat, long = address_to_location(address)
    #get the session username
    user_name = session.get("user_name")
    num_reviews = 0
    total_stars = 0
    testimony = {
        "city" : city,
        "latitude" : lat,
        "longitude" : long,
        "category" : category,
        "text" : text,
        "username" : user_name,
        "num_reviews" : num_reviews,
        "total_stars" : total_stars
    }

    insert_testimonial(testimonials_db, testimony)
    
    return jsonify({
        "status" : True,
        "message" : "Testimonial successfully created."
    })


@api.route("/login", methods=['POST'])
def login():
    from app import bcrypt
    #get username and password
    request_data = request.get_json()
    user_name = request_data.get("user_name")
    password = request_data.get("password")

    #check if username exists
    user_match = users_db.find_one({"user_name" : user_name})

    if not user_match:
        return jsonify({
            "status" : False,
            "message" : "User name does not exist. Please create an account."
        })

    #incorrect password
    if not bcrypt.check_password_hash(user_match["password"], password):
        return jsonify({
            "status" : False,
            "message" : "Incorrect password"
        })

    #update session username
    session["user_name"] = user_name

    return jsonify({
        "status" : True,
        "message" : "Successfully logged in"
    })

    

@api.route("/sign-up", methods=['POST'])
def sign_up():
    from app import bcrypt
    #if user is logged in to another account, log them out
    session.pop("user_name", None)
    #get username and password
    request_data = request.get_json()
    user_name = request_data.get("user_name")
    password = request_data.get("password")
    hashed_password = bcrypt.generate_password_hash(password)
    #check if username exists
    user_match = users_db.find_one({"user_name" : user_name})

    #username already exists
    if user_match:
        return jsonify({
            "status" : False,
            "message" : "User name already exists"
        })

    session["user_name"] = user_name
    #insert the username and passwords into the users db
    user_document = {
        "user_name" : user_name,
        "password" : hashed_password,
        "reviews" : []
    }
    users_db.insert_one(user_document)
    
    #_id = str(insert_result.inserted_id)
    return jsonify({
        "user_name" : user_name
    })


@api.route("/logout", methods=["POST"])
def logout():
    #remove the user_name from the session if it exists
    session.pop("user_name", None)
    return jsonify({
        "status" : True,
        "message" : "Successfully logged out."
    })


    

     
