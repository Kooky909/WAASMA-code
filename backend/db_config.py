from pymongo import MongoClient

client = MongoClient('localhost', 27017)

# This is a Mongodb database
db = client.WAASMA_flaskdb
user_collection = db.user_collection  # Collection names
w_sensor_collection = db.w_sensor_collection
a_sensor_collection = db.a_sensor_collection
p_sensor_collection = db.p_sensor_collection
system_collection = db.system_collection
sensor_config_collection = db.sensor_config_collection    # one entry in here? just keep modifying it? or collect them? (going w first for now)