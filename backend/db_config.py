from pymongo import MongoClient

client = MongoClient('localhost', 27017)

# This is a Mongodb database
db = client.WAASMA_flaskdb
user_collection = db.user_collection  # Collection names
settings_collection = db.settings_collection

sensor_collection = db.sensor_collection
test_sensor_collection = db.test_sensor_collection
sensor_config_collection = db.sensor_config_collection