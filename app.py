from flask import Flask, render_template, session
from flask_cors import CORS
import os
from flask_session import Session

from api import api
from pymongo import MongoClient


app = Flask(__name__, template_folder="templates")

app.secret_key = os.environ.get("SECRET_KEY")
app.config['SESSION_TYPE'] = 'filesystem'
app.config["SESSION_PERMANENT"] = False
Session(app)

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



