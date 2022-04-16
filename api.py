import os
import requests
from flask import Blueprint, request, jsonify
from crime_grouping import crime_standardization, crime_type_fields, assoc_list1, assoc_list2
from city_info import url_group, date_field_group

APP_TOKEN = os.environ.get("SOCRATA_APP_TOKEN")
POSITION_STACK_KEY = os.environ.get("POSITION_STACK_APIKEY")

#create standardization for crime among different cities
crime_group = {}
crime_standardization(crime_group, "Chicago", assoc_list1)
crime_standardization(crime_group, "Austin", assoc_list2)

api = Blueprint('api', __name__)

@api.route("/city", methods=['GET', 'POST'])
def display_crime_data():
    #get the address sent
    request_data = request.get_json() #get the json data sent
    address = request_data.get("address")

    #get the response from position stack api
    url_geocode = f"http://api.positionstack.com/v1/forward?access_key={POSITION_STACK_KEY}&query={address}"
    response_geocode = requests.get(url_geocode).json()
    lat = response_geocode["data"][0]["latitude"]
    long = response_geocode["data"][0]["longitude"]
    city = response_geocode["data"][0]["locality"]

    #get the filtered set of crimes from socrata api
    city_url = url_group[city]
    date_field = date_field_group[city]
    url_crime = f"{city_url}$where={date_field} between '2021-01-01T12:00:00' and '2021-12-31T23:59:59' AND within_circle(location, {lat}, {long}, 1000)&$$app_token={APP_TOKEN}"
    response_crime = requests.get(url_crime).json()

    #create list of crimes that fall into specific categories
    incidents_list = []
    for report in response_crime:
        #print(report)
        #only send crimes that fall in one of the 7 categories being tracked
        if crime_type_fields[city] in report: #the response from socrata api has the correct field
            crime_type = report[crime_type_fields[city]] #crime type sent from socrata api
            if crime_type in crime_group[city]: #the crime type is one of the few that we want to track
                incident_dict = {}
                incident_dict["latitude"] = report["latitude"]
                incident_dict["longitude"] = report["longitude"]
                incident_dict["crime_type"] = crime_group[city][crime_type]
                incidents_list.append(incident_dict)

    return jsonify(incidents_list)
