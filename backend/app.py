from flask import Flask, request, jsonify
import json, random
from bson import json_util, ObjectId
from flask_cors import CORS
from datetime import datetime, timedelta
from db_config import user_collection, w1_sensor_collection, a1_sensor_collection, p1_sensor_collection, w2_sensor_collection, a2_sensor_collection, p2_sensor_collection, sensor_collection

sensor_measurement_array = [w1_sensor_collection, a1_sensor_collection, p1_sensor_collection, w2_sensor_collection, a2_sensor_collection, p2_sensor_collection]

class Flask_App:
    # Shared with main
    system_state=None

    # constructor
    def __init__(self) -> None:

        self.app = Flask(__name__)
        #CORS(app)
        CORS(self.app, resources={r"/*": {"origins": "http://localhost:5173"}})

        @self.app.route('/')
        def hello_world():
            return 'Hello, World!'

        @self.app.route("/sensors", methods=["GET"])
        def get_sensors():
            sensors_cursor = sensor_collection.find()
            # Convert documents to JSON format using bson's json_util
            json_sensors = list(map(lambda x: json.loads(json_util.dumps(x)), sensors_cursor))
            return jsonify({"sensors": json_sensors})
        
        #@self.app.route("/config_sensors", methods=["POST"])
        #def config_sensors():
        #    data = request.json
        #    if not data:
        #        return (
        #            jsonify({"message": "You must include all sensor data"}),
        #            400,
        #        )   
        #    try:
        #        sensor_collection.insert_one(data)
        #    except Exception as e:
        #        return jsonify({"message": str(e)}), 400
        #    return jsonify({"message": "Sensors Configured!"}), 201
        
        @self.app.route("/config_sensors", methods=["PATCH"])
        def config_sensors():
            data = request.json
            if not data:
                return (
                    jsonify({"message": "You must include all sensor data"}),
                    400,
                )   
            try:
                # Define the update operation
                update = {"$set": data}
                # Update all users since no filter is provided
                result = user_collection.update_many({}, update)
            except Exception as e:
                return jsonify({"message": str(e)}), 400
            return jsonify({"message": "Sensors Configured!"}), 201


        @self.app.route("/change_range/<id>", methods=["PATCH"])
        def change_range(id):
            print(id)
            sensor_id = {"_id": ObjectId(id)}  # Correctly format the sensor_id
            
            # Check if the sensor exists
            existing_sensor = sensor_collection.find_one(sensor_id)
            if not existing_sensor:
                return jsonify({"message": "Sensor not found"}), 404

            data = request.json
            print(data)
            # Define the update operation
            update = {"$set": data}  # Use $set to update the specified fields
            sensor_collection.update_one(sensor_id, update)

            return jsonify({"message": "Sensor range updated."}), 200

        @self.app.route("/users", methods=["GET"])
        def get_users():
            users_cursor = user_collection.find()
            # Convert documents to JSON format using bson's json_util
            json_users = list(map(lambda x: json.loads(json_util.dumps(x)), users_cursor))
            return jsonify({"users": json_users})


        @self.app.route("/create_user", methods=["POST"])
        def create_user():
            data = request.json
            if not data:
                return (
                    jsonify({"message": "You must include a first name, last name and email"}),
                    400,
                )
        
            try:
                user_collection.insert_one(data)
            except Exception as e:
                return jsonify({"message": str(e)}), 400

            return jsonify({"message": "User created!"}), 201


        @self.app.route("/update_user/<id>", methods=["PATCH"])
        def update_user(id):
            user_id = {"_id": ObjectId(id)}  # Correctly format the user_id
            
            # Check if the user exists
            existing_user = user_collection.find_one(user_id)
            if not existing_user:
                return jsonify({"message": "User not found"}), 404

            data = request.json
            # Define the update operation
            update = {"$set": data}  # Use $set to update the specified fields
            user_collection.update_one(user_id, update)

            return jsonify({"message": "User updated."}), 200


        @self.app.route("/delete_user/<id>", methods=["DELETE"])
        def delete_user(id):
            user_id = {"_id": ObjectId(id)}  # Correctly format the user_id
            
            # Check if the user exists
            existing_user = user_collection.find_one(user_id)
            if not existing_user:
                return jsonify({"message": "User not found"}), 404

            result = user_collection.delete_one(user_id)
            return jsonify({"message": "User deleted!"}), 200
        
        @self.app.route("/user_settings/<id>", methods=["GET"])
        def user_settings(id):
            print(id)
            user_id = {"_id": ObjectId(id)}  # Correctly format the user_id
            
            # Check if the user exists
            existing_user = user_collection.find_one(user_id)
            if not existing_user:
                return jsonify({"message": "User not found"}), 404
            
            # Convert ObjectId to string for JSON serialization
            existing_user["_id"] = str(existing_user["_id"])

            return jsonify({"settings": existing_user}), 200

        @self.app.route("/current_sensor_data/", methods=["GET"])
        def current_sensor_data():
            # get the current measurement for the sensor from main
            
            #sensor_id = {"_id": ObjectId(id)}  # Correctly format the sensor_id   
            # Check if the sensor exists
            #sensor = sensor_collection.find_one(sensor_id)
            #if not sensor:
            #    return jsonify({"message": "Sensor not found"}), 404   
            # Convert ObjectId to string for JSON serialization
            #existing_user["_id"] = str(existing_user["_id"])
            #return jsonify({"settings": sensor_measurement}), 200
            sensor_measurement = random.randint(1,20)
            return jsonify({"current-measurement": sensor_measurement}), 200
        
        @self.app.route("/past_sensor_data/", methods=["GET"])
        def past_sensor_data():
            # get the past measurements for the sensor from main
            
            #sensor_id = {"_id": ObjectId(id)}  # Correctly format the sensor_id   
            # Check if the sensor exists
            #sensor = sensor_collection.find_one(sensor_id)
            #if not sensor:
            #    return jsonify({"message": "Sensor not found"}), 404   
            # Convert ObjectId to string for JSON serialization
            #existing_user["_id"] = str(existing_user["_id"])
            #return jsonify({"settings": sensor_measurement}), 200
            sensor_measurements = list(range(20))
            return jsonify({"past-measurements": sensor_measurements}), 200
        
        @self.app.route("/analysis_query/", methods=["POST"])
        def analysis_query():
            filters = request.json
            print(filters.get("selectedTank"))

            # Use filters to query and return data
            sensor_ids_cursor = sensor_collection.find(
                {"tank": filters.get("selectedTank"), "type": filters.get("selectedSensor")},
                {"_id": 1}  # Only get the sensor ID
            )
            print(list(sensor_ids_cursor))

            # Extract the sensor IDs from the query result
            sensor_ids = [sensor['_id'] for sensor in sensor_ids_cursor]

            # Query measurements for the last hour using the sensor IDs
            one_hour_ago = datetime.now() - timedelta(hours=1)

            # Query the measurements collections
            result_data = []
            #for collection in sensor_measurement_array:
            #    measurements_cursor = collection.find(
            #        {
            #            "sensor_id": {"$in": sensor_ids},  # Match sensor IDs
            #            "timestamp": {"$gte": one_hour_ago}  # Match measurements from the last hour
            #        }
            #    )
            #    if len(list(measurements_cursor)) > 0:
            #        result_data.append(list(measurements_cursor))

            # Convert documents to JSON format using bson's json_util
            json_data = list(map(lambda x: json.loads(json_util.dumps(x)), result_data))

            # Return the result data as a JSON response
            return jsonify({"sensor_data": json_data})
        
        @self.app.route("/user_authen/", methods=["POST"])
        def user_authen():
            credentials = request.json
            print(credentials.get("userEmail"))

            # Query user by email
            user = user_collection.find_one({"email": credentials.get("userEmail")})
            user["_id"] = str(user["_id"]) # Convert ObjectId to string

            if not user:
                return {"success": False, "message": "User does not exist"}

            # Check if password matches
            if user["password"] == credentials.get("userPassword"):
                return {"success": True, "message": "Authentication successful", "user": user}
                #return {"success": True, "message": "Authentication successful", "user": user}
            else:
                return {"success": False, "message": "Invalid password"}

    #def run_app(self):
        self.app.run(debug=True)

#if __name__ == '__main__':
#my_app = Flask_App()
#my_app.run_app()