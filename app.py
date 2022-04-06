from flask import Flask, render_template
from flask_cors import CORS

from api import api

app = Flask(__name__, template_folder="templates")
CORS(app)

app.register_blueprint(api)


@app.route("/", methods=['GET'])
def home():
    return render_template("index.html")


