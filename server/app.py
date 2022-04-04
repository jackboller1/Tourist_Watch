from flask import Flask, request, jsonify
import os
import requests

APP_TOKEN = os.environ.get("SOCRATA_APP_TOKEN")
POSITION_STACK_KEY = os.environ.get("POSITION_STACK_KEY")

app = Flask(__name__)

@app.route("/")
def home():
    return "Hello World! I'm using Flask."

@app.route("/city", methods=['GET', 'POST'])
def display_crime_data():
    #get the address sent
    request_data = request.get_json() #get the json data sent
    address = request_data.get("address")

    #get the response from position stack api
    url_geocode = f"http://api.positionstack.com/v1/forward?access_key={POSITION_STACK_KEY}&query={address}"
    response_geocode = requests.get(url_geocode).json()
    lat = response_geocode["data"][0]["latitude"]
    long = response_geocode["data"][0]["longitude"]
    
    # lat = request_data.get("latitude")
    # long = request_data.get("longitude")

    #url = f"https://data.cityofchicago.org/resource/dfnk-7re6.json?$where=within_circle(location, {lat}, {long}, 1000)&$$app_token={APP_TOKEN}"
    url_crime = f"https://data.cityofchicago.org/resource/ijzp-q8t2.json?$where=date between '2021-01-01T12:00:00' and '2021-12-31T23:59:59' AND within_circle(location, {lat}, {long}, 1000)&arrest=true&$$app_token={APP_TOKEN}"
    response_crime = requests.get(url_crime).json()
    print(len(response_crime))

    coordinates_list = []
    for report in response_crime:
        lat_long_dict = {}
        lat_long_dict["latitude"] = report["latitude"]
        lat_long_dict["longitude"] = report["longitude"]
        coordinates_list.append(lat_long_dict)

    return jsonify(coordinates_list)

