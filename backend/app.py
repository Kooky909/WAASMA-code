from flask import Flask, request, jsonify
import json
from bson import json_util, ObjectId
from flask_cors import CORS
from db_config import user_collection, sensor_collection

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
        
        @self.app.route("/config_sensors", methods=["POST"])
        def config_sensors():
            data = request.json

            if not data:
                return (
                    jsonify({"message": "You must include all sensor data"}),
                    400,
                )
            
            try:
                sensor_collection.insert_one(data)
            except Exception as e:
                return jsonify({"message": str(e)}), 400

            return jsonify({"message": "Sensors Configured!"}), 201
        

        @self.app.route("/change_range/<id>", methods=["PATCH"])
        def change_range(id):
            print(id)
            sensor_id = {"_id": ObjectId(id)}  # Correctly format the sensor_id
            
            # Check if the user exists
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

    def run_app(self):
        self.app.run(debug=True)


if __name__ == '__main__':
    my_app = Flask_App()
    my_app.run_app()