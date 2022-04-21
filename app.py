from flask import Flask, render_template
from flask_cors import CORS

from api import api

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


