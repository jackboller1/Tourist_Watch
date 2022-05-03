import os
import requests
from flask import Blueprint, request, jsonify, url_for, redirect, session
from crime_grouping import crime_standardization, crime_type_fields, assoc_list1, assoc_list2, assoc_list3
from city_info import url_group, date_field_group, location_field_group
from db_setup import testimonials_db, users_db
from db_operations import insert_testimonial
#from app import bcrypt


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

@api.route("/city", methods=['GET', 'POST'])
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
        #print(report)
        #only send crimes that fall in one of the 7 categories being tracked
        #print(crime_type_fields[city])
        if crime_type_fields[city] in report: #the response from socrata api has the correct field
            crime_type = report[crime_type_fields[city]] #crime type sent from socrata api
            if crime_type in crime_group[city]: #the crime type is one of the few that we want to track
                incident_dict = {}
                incident_dict["latitude"] = report["latitude"]
                incident_dict["longitude"] = report["longitude"]
                incident_dict["crime_type"] = crime_group[city][crime_type]
                incidents_list.append(incident_dict)

    return jsonify(incidents_list)

@api.route("/create-testimonial", methods=['GET', 'POST'])
def create_testimonial():
    request_data = request.get_json() #get the json data sent
    address = request_data.get("address")
    category = request_data.get("category")
    text = request_data.get("text")

    #get city, lat, long from address
    city, lat, long = address_to_location(address)
    #get the session username
    user_name = session.get("user_name")
    num_upvotes = 0
    testimony = {
        "city" : city,
        "latitude" : lat,
        "longitude" : long,
        "category" : category,
        "text" : text,
        "username" : user_name,
        "num_upvotes" : num_upvotes
    }

    insert_testimonial(testimonials_db, testimony)
    
    return redirect(url_for('testimonial'))


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
        "password" : hashed_password
    }
    insert_result = users_db.insert_one(user_document)
    
    _id = str(insert_result.inserted_id)
    return jsonify({
        "id" : _id,
        "user_name" : user_name
    })


@api.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id")

@api.route("/foo", methods=['GET'])
def foo():
    return session.sid

    

     
