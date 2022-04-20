from pymongo import MongoClient
from db_setup import db, testimonials

#proposed db schema
{
    "_id" : "auto generated",
    "username" : "string",
    "password" : "hashed string",
    "my_testimonials" : "list of testimonial ids (optional)"
}

{
    "_id" : "auto generated",
    "city" : "string",
    " (maybe?) location_provided" : "boolean",
    "latitude" : "float (optional)",
    "longitude" : "float (optional)",
    "category" : " string (crime, attraction, etc)",
    "text" : "string (user's testimonial)",
    "username" : "string (who created the testimonial)",
    "number of upvotes" : "int"
}


def insert_testimonial(test_collection, testimonial):
    '''Insert user's testimonial into the testimonial collection'''
    test_collection.insert_one(testimonial)
