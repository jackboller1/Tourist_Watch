from flask import Flask, render_template, session, redirect, url_for
from flask_cors import CORS
import os
from flask_session import Session
from flask_bcrypt import Bcrypt

from api import api
from pymongo import MongoClient


app = Flask(__name__, template_folder="templates")

app.secret_key = os.environ.get("SECRET_KEY")
app.config['SESSION_TYPE'] = 'filesystem'
app.config["SESSION_PERMANENT"] = False
app.register_blueprint(api)
bcrypt = Bcrypt(app)
Session(app)
CORS(app)



@app.route("/", methods=['GET'])
def home():
    return render_template("index.html")

@app.route("/login", methods=['GET'])
def login():
    return render_template("login.html")

@app.route("/register", methods=['GET'])
def register():
    return render_template("register.html")

@app.route("/submit-testimonial", methods=['GET'])
def testimonial():
    if "user_name" not in session:
        return redirect(url_for('home'))
    
    return render_template("testimonial.html")



