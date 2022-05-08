from flask import Flask, render_template, session, redirect, url_for
from flask_cors import CORS
import os, glob
from flask_session import Session
from flask_bcrypt import Bcrypt

from api import api
from pymongo import MongoClient

if not os.path.isdir('flask_session'):
    os.mkdir("flask_session")

dir = 'flask_session/'
filelist = glob.glob(os.path.join(dir, "*"))
for f in filelist:
    os.remove(f)

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

@app.route("/logout", methods=["GET"])
def logout():
    #remove the user_name from the session if it exists
    session.pop("user_name", None)
    return render_template("index.html")

@app.route("/register", methods=['GET'])
def register():
    return render_template("register.html")

@app.route("/submit-testimonial", methods=['GET'])
def testimonial():
    print(session)
    if "user_name" not in session:
        return redirect(url_for('home'))
    
    return render_template("testimonial.html")

@app.route("/testimonial/<testimonial_id>", methods=['GET'])
def get_testimonial(testimonial_id):
    return render_template("view_testimonial.html")



