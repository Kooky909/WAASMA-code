from flask import Flask, request, jsonify
import json, random
from bson import json_util, ObjectId
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from sys_state import Sys_State
from datetime import datetime, timedelta
from db_config import user_collection, sensor_collection, test_sensor_collection, w1_sensor_collection, a1_sensor_collection, p1_sensor_collection, w2_sensor_collection, a2_sensor_collection, p2_sensor_collection

class Flask_App():
    # Shared with main
    system_state=None

    # constructor
    def __init__(self, state) -> None:

        self.app = Flask(__name__)
        self.socketio = SocketIO(self.app, cors_allowed_origins="*", async_mode='threading')
        #, async_mode='eventlet'

        # This is a pointer to the system state object in main
        self.state = state
        #CORS(app)
        # This allows the frontend and backend to connect
        CORS(self.app, resources={r"/*": {"origins": "http://localhost:5173"}})

        # This is a test route ------- should prob delete
        @self.app.route('/')
        def hello_world():
            return 'Hello, World!'

        # This route returns a list of sensors from the sensor collection
        @self.app.route("/sensors", methods=["GET"])
        def get_sensors():
            sensors_cursor = test_sensor_collection.find()
            # Convert documents to JSON format using bson's json_util
            json_sensors = list(map(lambda x: json.loads(json_util.dumps(x)), sensors_cursor))
            return jsonify({"sensors": json_sensors})
        
        # This route updates the sensor configuration collection ?????
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

        # This route updates a high/low range values for a sensor in the sensor collection
        @self.app.route("/change_range/<id>", methods=["PATCH"])
        def change_range(id):
            print(id)
            sensor_id = {"_id": ObjectId(id)}  # Correctly format the sensor_id
            
            # Check if the sensor exists
            existing_sensor = test_sensor_collection.find_one(sensor_id)
            if not existing_sensor:
                return jsonify({"message": "Sensor not found"}), 404

            data = request.json
            print(data)
            # Define the update operation
            update = {"$set": data}  # Use $set to update the specified fields
            test_sensor_collection.update_one(sensor_id, update)

            return jsonify({"message": "Sensor range updated."}), 200
        
        ####################################################################
        #         ANALYSIS TOOL ROUTES
        ####################################################################

        @self.app.route("/analysis_query/", methods=["POST"])
        def analysis_query():
            filters = request.json
            tankFilter = filters.get("selectedTank").strip()
            sensorFilter = filters.get("selectedSensor").strip()
            startDateFilter = filters.get("formattedStart").strip()
            endDateFilter = filters.get("formattedEnd").strip()

            print(tankFilter, sensorFilter, startDateFilter, endDateFilter)

            # Use sensor_collection to find needed sensors from needed tanks
            ###### not sure, could also query both individually and compare cursors or something

            if tankFilter == "all" and sensorFilter == "all":     # if all tanks and all sensors, grab everything
                sensor_ids_cursor = test_sensor_collection.find({}, {"_id": 1})    # Only get the sensor ID
            elif tankFilter == "all":     # if all tanks, only query sensors
                sensor_ids_cursor = test_sensor_collection.find(
                    {"type": filters.get("selectedSensor")},
                    {"_id": 1}  # Only get the sensor ID
                )
            elif sensorFilter == "all":     # if all sensors, only query tanks
                sensor_ids_cursor = test_sensor_collection.find(
                    {"tank": filters.get("selectedTank")},
                    {"_id": 1}  # Only get the sensor ID
                )
            else:      # if no all, query everything
                sensor_ids_cursor = test_sensor_collection.find(
                    {"tank": filters.get("selectedTank"), "type": filters.get("selectedSensor")},
                    {"_id": 1}  # Only get the sensor ID
                )
            sensor_ids_list = list(sensor_ids_cursor)
            sensor_ids = []

            # Get the sensor IDs from the query result
            for sensor in sensor_ids_list:
                sensor_ids.append(sensor['_id'])

            # Query the measurements collections --- sensor_measurement_array would have to be from sys_state
            result_data = {}
            Sensor_List = self.state.get("Sensor List")
            for sensor in sensor_ids:
                for sensor_id, sensor_data in Sensor_List.items():
                    if sensor == sensor_id:
                        collection = sensor_data["db"]
                        if startDateFilter == "0" and endDateFilter == "0":
                            tempDateFilter = datetime.strptime("2025-03-17T04:00:00.000Z", "%Y-%m-%dT%H:%M:%S.%fZ")
                            measurements_cursor = collection.find({"time": {"$gte": tempDateFilter}})
                        elif endDateFilter == "0":
                            tempEndFilter = startDateFilter[:11] + "23:59:59.999Z"
                            startDate = datetime.strptime(startDateFilter, "%Y-%m-%dT%H:%M:%S.%fZ")
                            tempEnd = datetime.strptime(tempEndFilter, "%Y-%m-%dT%H:%M:%S.%fZ")
                            measurements_cursor = collection.find({
                                "time": {"$gte": startDate, "$lt": tempEnd}
                            })
                        else:
                            startDate = datetime.strptime(startDateFilter, "%Y-%m-%dT%H:%M:%S.%fZ")
                            endDate = datetime.strptime(endDateFilter, "%Y-%m-%dT%H:%M:%S.%fZ")
                            measurements_cursor = collection.find({
                                "time": {"$gte": startDate, "$lt": endDate}
                            })
                        measurements_list = list(measurements_cursor)
                        if measurements_list:  # Check if the list is not empty
                            result_data[sensor_data["name"]] = measurements_list

            # Convert documents to JSON format using bson's json_util
            #json_data = list(map(lambda x: json.loads(json_util.dumps(x)), result_data))
            # Return the result data as a JSON response
            json_data = json.loads(json_util.dumps(result_data))
            return jsonify({"sensor_data": json_data})
        

        ####################################################################
        #         USER PAGE ROUTES  -- talk to user colelction
        ####################################################################
        
        # This route checks if the user entered the correct password
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

        # This route returns a list of users
        @self.app.route("/users", methods=["GET"])
        def get_users():
            users_cursor = user_collection.find()
            # Convert documents to JSON format using bson's json_util
            json_users = list(map(lambda x: json.loads(json_util.dumps(x)), users_cursor))
            return jsonify({"users": json_users})

        # This route creates a user
        @self.app.route("/create_user", methods=["POST"])
        def create_user():
            data = request.json
            if not data:
                return ( jsonify({"message": "You must include a first name, last name and email"}), 400)
        
            try:
                user_collection.insert_one(data)
            except Exception as e:
                return jsonify({"message": str(e)}), 400

            return jsonify({"message": "User created!"}), 201

        # This route updates the data of a user
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

        # This route deletes a user
        @self.app.route("/delete_user/<id>", methods=["DELETE"])
        def delete_user(id):
            user_id = {"_id": ObjectId(id)}  # Correctly format the user_id
            
            # Check if the user exists
            existing_user = user_collection.find_one(user_id)
            if not existing_user:
                return jsonify({"message": "User not found"}), 404

            result = user_collection.delete_one(user_id)
            return jsonify({"message": "User deleted!"}), 200
        
        # This route returns the settings of a user
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
        

        #########################################
        #      WEB SOCKET STUFF
        #########################################

        # --- WebSocket Connection ---
        @self.socketio.on('connect')
        def client_connect():
            print("Client connected via WebSocket")
            client_ip = request.remote_addr
            sid = request.sid
            print(f"🔵 New WebSocket Connection Attempt: {sid} from {client_ip}")

            # Store connected clients if needed (for debugging)
            if not hasattr(client_connect, "clients"):
                client_connect.clients = set()
            client_connect.clients.add(sid)

            print(f"Currently connected clients: {len(client_connect.clients)}")

        @self.socketio.on('message')
        def client_message(data):
            print(f"Received WebSocket message: {data}")
            emit('response', {"message": "Hello from WebSocket!"}, broadcast=True)  # Send a response

        @self.socketio.on('packet')
        def send_packet(data):

            # in system state, in the Sensor List, iterate through the sensors and return the timestamps and data
            Sensor_List = self.state.get("Sensor List")
            newData = {}
            client_request = data.get("request")

            if client_request == "home":
                for sensor_id, sensor_data in Sensor_List.items():
                    sensor_name = sensor_data["name"]  # Get the sensor name
                    formatted_readings = []
                    for reading in sensor_data["recent readings"]:
                        formatted_readings.append({
                            "time": reading["time"],
                            "value": reading["value"]
                        })

                    newData[sensor_name] = formatted_readings # Store in the newData w/ sensor name
                emit('packet_home', {"packet_data": newData}, broadcast=True)
            else:
                for sensor_id, sensor_data in Sensor_List.items():
                    if str(sensor_id) == client_request:
                        sensor_name = sensor_data["name"]  # Get the sensor name
                        formatted_readings = []
                        for reading in sensor_data["recent readings"]:
                            formatted_readings.append({
                                "time": reading["time"],
                                "value": reading["value"]
                            })
                        emit('packet', {"packet_data": formatted_readings}, broadcast=True)
                    #newData[sensor_name] = formatted_readings # Store in the newData w/ sensor name
                  

        @self.socketio.on('update')
        def send_update(data):
            # in system state, in the Sensor List, iterate through the sensors and return the timestamps and data
            Sensor_List = self.state.get("Sensor List")
            newData = {}
            client_request = data.get("request")

            if client_request == "home":
                for sensor_id, sensor_data in Sensor_List.items():
                    sensor_name = sensor_data["name"]  # Get the sensor name
                    reading = sensor_data["current reading"]
                    newData[sensor_name] = ({
                        "time": reading["time"],
                        "value": reading["value"]
                    }) # Store in the newData w/ sensor name
                emit('update_home', {"update_data": newData}, broadcast=True)
            else:
                for sensor_id, sensor_data in Sensor_List.items():
                    if str(sensor_id) == client_request:
                        sensor_name = sensor_data["name"]  # Get the sensor name
                        reading = sensor_data["current reading"]
                        emit('update', {"update_data": reading}, broadcast=True)

        @self.socketio.on('disconnect')
        def client_disconnect():
            print("Client disconnected from WebSocket")
            sid = request.sid
            print(f"🔴 Client disconnected: {sid}")

            # Remove client from set
            if hasattr(client_connect, "clients"):
                client_connect.clients.discard(sid)

            print(f"Remaining clients: {len(client_connect.clients)}")

    # Method to run the app - used in main
    def run_app(self):
        self.socketio.run(self.app, debug=False) 


# Code to run the app - without main
if __name__ == '__main__':
   state = 1
   my_app = Flask_App(state)
   my_app.run_app()