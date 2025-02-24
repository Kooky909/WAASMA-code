from pymongo import MongoClient

client = MongoClient('localhost', 27017)

# This is a Mongodb database
db = client.WAASMA_flaskdb
user_collection = db.user_collection  # Collection names
system_collection = db.system_collection

w1_sensor_collection = db.w1_sensor_collection
a1_sensor_collection = db.a1_sensor_collection
p1_sensor_collection = db.p1_sensor_collection
w2_sensor_collection = db.w2_sensor_collection
a2_sensor_collection = db.a2_sensor_collection
p2_sensor_collection = db.p2_sensor_collection

Water1_collection = db.Water1_collection
Air1_collection = db.Air1_collection
Pressure1_collection = db.Pressure1_collection
Water2_collection = db.Water2_collection
Air2_collection = db.Air2_collection
Pressure2_collection = db.Pressure2_collection

sensor_collection = db.sensor_collection
test_sensor_collection = db.test_sensor_collection
sensor_config_collection = db.sensor_config_collection