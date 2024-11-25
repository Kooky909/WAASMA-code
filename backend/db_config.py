from pymongo import MongoClient

client = MongoClient('localhost', 27017)

# This is a Mongodb database
db = client.WAASMA_flaskdb
user_collection = db.user_collection  # Collection names
w1_sensor_collection = db.w1_sensor_collection
a1_sensor_collection = db.a1_sensor_collection
p1_sensor_collection = db.p1_sensor_collection
w2_sensor_collection = db.w2_sensor_collection
a2_sensor_collection = db.a2_sensor_collection
p2_sensor_collection = db.p2_sensor_collection
system_collection = db.system_collection
sensor_collection = db.sensor_collection
sensor_config_collection = db.sensor_config_collection    # one entry in here? just keep modifying it? or collect them? (going w first for now)