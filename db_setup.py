from pymongo import MongoClient
import os
from urllib import parse
from dotenv import load_dotenv
load_dotenv()

DB_USERNAME = parse.quote_plus((os.environ.get("MONGODB_USERNAME")))
DB_PASSWORD = parse.quote_plus((os.environ.get("MONGODB_PASSWORD")))
CLUSTER_NAME= parse.quote_plus((os.environ.get("CLUSTER_NAME")))

def get_database():
    '''return instance of database'''
    client = MongoClient(f"mongodb+srv://{DB_USERNAME}:{DB_PASSWORD}@{CLUSTER_NAME}.jqwud.mongodb.net/testimonials?retryWrites=true&w=majority")
    db = client.csce315project3
    return db


db = get_database()
testimonials_db = db.testimonials



