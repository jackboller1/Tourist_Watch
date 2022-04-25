from flask import Flask, render_template
from flask_cors import CORS

from api import api
from pymongo import MongoClient

client = MongoClient("mongodb+srv://csce315project3:QZjSTK19VbNkxgWW@csce315project3.jqwud.mongodb.net/testimonials?retryWrites=true&w=majority")
db = client.csce315project3
testimonials = db.testimonials
test_document = {
    "name" : "Jack",
    "city" : "Chicago",
    "text" : "testtest"
}
testimonials.insert_one(test_document)
testimonials.find_one()

app = Flask(__name__, template_folder="templates")
CORS(app)

app.register_blueprint(api)


@app.route("/", methods=['GET'])
def home():
    return render_template("index.html")

@app.route("/register", methods=['GET'])
def register():
    return render_template("register.html")

@app.route("/submit-testimonial", methods=['GET'])
def testimonial():
    return render_template("testimonial.html")


