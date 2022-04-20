from pymongo import MongoClient
import os
from urllib import parse
from dotenv import load_dotenv
load_dotenv()

DB_USERNAME = parse.quote_plus((os.environ.get("MONGODB_USERNAME")))
DB_PASSWORD = parse.quote_plus((os.environ.get("MONGODB_PASSWORD")))
CLUSTER_NAME= parse.quote_plus((os.environ.get("CLUSTER_NAME")))

test_document = {
    "name" : "J",
    "city" : "Fort Worth",
    "text" : "test"
}

def get_database():
    #client = MongoClient(f"mongodb+srv://{DB_USERNAME}:{DB_PASSWORD}@csce315project3.jqwud.mongodb.net/testimonials?retryWrites=true&w=majority")
    client = MongoClient(f"mongodb+srv://{DB_USERNAME}:{DB_PASSWORD}@{CLUSTER_NAME}.jqwud.mongodb.net/testimonials?retryWrites=true&w=majority")
    db = client.csce315project3
    return db

def insert_testimonial(test_collection, testimonial):
    '''Insert user's testimonial into the testimonial collection'''
    test_collection.insert_one(testimonial)

db = get_database()
testimonials = db.testimonials

testimonials.insert_one(test_document)
print(testimonials.find_one())

