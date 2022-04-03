from flask import Flask, request, jsonify
import os
import requests

APP_TOKEN = os.environ.get("APP_TOKEN")

app = Flask(__name__)

@app.route("/")
def home():
    return "Hello World! I'm using Flask."

@app.route("/city", methods=['GET', 'POST'])
def display_crime_data():
    request_data = request.get_json() #get the json data sent
    lat = request_data.get("latitude")
    long = request_data.get("longitude")

    #url = f"https://data.cityofchicago.org/resource/dfnk-7re6.json?$where=within_circle(location, {lat}, {long}, 1000)&$$app_token={APP_TOKEN}"
    url = f"https://data.cityofchicago.org/resource/ijzp-q8t2.json?$where=date between '2021-01-01T12:00:00' and '2021-12-31T23:59:59' AND within_circle(location, {lat}, {long}, 1000)&arrest=true&$$app_token={APP_TOKEN}"
    response = requests.get(url).json()
    print(len(response))
    return jsonify(response)

