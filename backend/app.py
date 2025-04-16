from flask import Flask, request, jsonify, abort
from flask_jwt_extended import create_access_token, JWTManager, verify_jwt_in_request, get_jwt
from functools import wraps
import json
import os
from bson import json_util, ObjectId
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from sys_state import Sys_State
import time
from datetime import datetime, timedelta
from db_config import user_collection, sensor_collection, settings_collection
import jwt
import secrets

class Flask_App():
    # Shared with main
    system_state = None
    SECRET_KEY = secrets.token_hex(32)
    ALGORITHM = 'HS256'

    # constructor
    def __init__(self, state) -> None:
        self.app = Flask(__name__)
        self.socketio = SocketIO(self.app, cors_allowed_origins="*", async_mode='threading')
        #, async_mode='eventlet'
        self.state = state # This is a pointer to the system state object in main
        CORS(self.app, resources={r"/*": {"origins": "http://localhost:5173"}})  # This allows the frontend and backend to connect

        self.app.config["JWT_SECRET_KEY"] = self.SECRET_KEY
        self.app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
        self.app.config["JWT_COOKIE_SECURE"] = True
        self.app.config["JWT_COOKIE_HTTPONLY"] = True
        self.app.config["JWT_COOKIE_SAMESITE"] = "Strict"
        self.jwt = JWTManager(self.app)

        ##############################################################
        #
        #   WORKING ON USER ROLES / PERMS
        #
        ##############################################################

        # Implementation of user roles
        def require_role(roles):
            def decorator(f):
                @wraps(f)  # Preserve function metadata
                def decorated_function(*args, **kwargs):
                    token = request.headers.get("Authorization")
                    if not token:
                        abort(401, description="Token is missing")  # Unauthorized

                    token = token.replace("Bearer ", "")  # Remove the 'Bearer ' part if it's included
                    try:
                        # Decode the token to get the user info (including role)
                        decoded_token = jwt.decode(token, self.app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
                        user_role = decoded_token.get("role")
                        
                        # Check if the role is in the required roles
                        if user_role not in roles:
                            abort(403, description="Forbidden: Insufficient role")  # Forbidden
                        
                    except jwt.ExpiredSignatureError:
                        abort(401, description="Token has expired")  # Token expired
                    except jwt.InvalidTokenError:
                        abort(401, description="Invalid token")  # Invalid token
                    return f(*args, **kwargs)
                return decorated_function
            return decorator
        
        @self.app.route("/login", methods=["POST"])    # frontend calls login with user/password
        def login():
            data = request.json
            email = data.get('userEmail')
            password = data.get('userPassword')  # gets the data 

            user = user_collection.find_one({'email': email})     # looks up the username in the db

            if user and ( password == user['password'] ):    # checks password
                print("im making a token now....")
                token = create_access_token(
                    identity=str(user['_id']), 
                    additional_claims={
                        'role': user['role'],
                        'firstName': user['firstName'],
                        'last_name': user['lastName']
                })   # if successful, create token
                print("i made a token!")
                response = jsonify({'message': 'Login successful'})
                response = jsonify({
                    'message': 'Login successful',
                    'token': token,
                    'userId': str(user['_id']),
                    'role': user['role'],
                    'firstName': user['firstName'],
                    'lastName': user['lastName'],
                })
                return response, 200
            else:
                return jsonify({'message': 'Invalid credentials'}), 401
            

        @self.app.route("/user_authen/", methods=["POST"])
        def user_authen():
            credentials = request.json
            print(credentials.get("userEmail"))
            user = user_collection.find_one({"email": credentials.get("userEmail")})
            if not user:
                return {"success": False, "message": "User does not exist"}
            user["_id"] = str(user["_id"])
            if user["password"] == credentials.get("userPassword"):
                return {"success": True, "message": "Authentication successful", "user": user}
            else:
                return {"success": False, "message": "Invalid password"}
        

        #########################################################################
        #########################################################################

        # This route returns a list of sensors from the sensor collection
        @self.app.route("/sensors", methods=["GET"])
        def get_sensors():
            sensors_cursor = sensor_collection.find()
            # Convert documents to JSON format using bson's json_util
            json_sensors = list(map(lambda x: json.loads(json_util.dumps(x)), sensors_cursor))
            return jsonify({"sensors": json_sensors})
        
        # This route returns a list of the system settings from the settings collection
        @self.app.route("/settings", methods=["GET"])
        def get_settings():
            settings_cursor = settings_collection.find()
            # Convert documents to JSON format using bson's json_util
            json_settings = list(map(lambda x: json.loads(json_util.dumps(x)), settings_cursor))
            print(json_settings)
            return jsonify({"settings": json_settings})
        
        # This route returns the reset settings variable in the system state, determines if the backend has reset and is ready
        @self.app.route("/backend_ready", methods=["GET"])
        def backend_ready():
            reset_sensors = self.state.get("reset sensors")
            return jsonify({"backend_reset": reset_sensors})
        
        @self.app.route("/config_sensors", methods=["PATCH"])
        @require_role(["admin"])
        def config_sensors():
            data = request.json['data']
            print(data)
            if not data:
                return jsonify({"message": "You must include all sensor data"}), 400
            try:
                sensor_collection.delete_many({})  # This removes all documents in the collection
                for tank in data:
                    for sensor in tank['sensors']:
                        sensor['tank'] = tank['tank']
                        sensor_collection.insert_one(sensor)    # make collection additions

                # change system state to running
                settings_collection.update_one(
                    {},  # Empty query to target the first (and only) document
                    {'$set': {'system_state': 'running'}}  # Set 'system_state' to 'running'
                )
                # update start date
                settings_collection.update_one(
                    {},  # Empty query to target the first (and only) document
                    {'$set': {'start_date': datetime.now()}}  # Set 'system_state' to 'running'
                )
            except Exception as e:
                return jsonify({"message": str(e)}), 400
            return jsonify({"message": "Sensors Configured!"}), 201

        # This route updates a high/low range values for a sensor in the sensor collection
        @self.app.route("/change_range/<id>", methods=["PATCH"])
        @require_role(["admin"])
        def change_range(id):
            sensor_id = {"_id": ObjectId(id)}  # Correctly format the sensor_id
            existing_sensor = sensor_collection.find_one(sensor_id) # Check if the sensor exists
            if not existing_sensor:
                return jsonify({"message": "Sensor not found"}), 404

            data = request.json
            updated_data = {
                "measures": {
                    "CO2": {
                        "range_low": data["CO2_range_low"],
                        "range_high": data["CO2_range_high"]
                    },
                    "DO": {
                        "range_low": data["DO_range_low"],
                        "range_high": data["DO_range_high"]
                    }
                }
            }
            try:
                update = {"$set": updated_data}  # Use $set to update the specified fields
                sensor_collection.update_one(sensor_id, update)
                # Flip the flag
                self.state.set("New Settings", True)
                print("flipped flag")
                return jsonify({"message": "Sensor ranges updated."}), 200
            except Exception as e:
                return jsonify({"message": str(e)}), 400
            
        #updates the frequency setting in the database on the provided ID and JSON request.
        @self.app.route("/change_setting/<id>", methods=["PATCH"])
        @require_role(["admin"])
        def change_setting(id):
            try:
                data = request.json   ###### IS THIS RIGHT???
                frequency = data.get("read_frequency")

                if frequency is None:
                    return jsonify({"message": "Frequency is required"}), 400

                # updating the frequency in the db
                setting_id = {"_id": ObjectId(id)}
                update = {"$set": {"read_frequency": int(frequency)}}
                settings_collection.update_one(setting_id, update)
                self.state.set("Read Frequency", int(frequency))
                print("frequency has been updated")

                return jsonify({"message": "Sensor range updated."}), 200
            except Exception as e:
                return jsonify({"message": str(e)}), 400
            

        @self.app.route("/stop_run", methods=["PATCH"])
        @require_role(["admin"])
        def stop_run():
            data = request.json
            setting_id = ObjectId(data.get('setting_id'))
            # change db system state to waiting
            update = {"$set": {"system_state": "waiting"}}
            settings_collection.update_one({"_id": setting_id}, update) #using test sensor collection as an example. change as needed.

            # change state System state to terminate
            self.state.set("terminate", True)

            # increment run number
            current_setting = list(settings_collection.find())
            current_run_number = current_setting[0]['run_number']
            update = {"$set": {"run_number": current_run_number+1}}
            settings_collection.update_one({"_id": setting_id}, update)
            print("run has been stopped")
            print(self.state.get("terminate"))
            return jsonify({"message": "Run has been stopped"}), 200            

        ####################################################################
        #                        ANALYSIS TOOL ROUTES
        ####################################################################

        @self.app.route("/analysis_query/", methods=["POST"])
        def analysis_query():
            filters = request.json     # Get the filters
            tankFilter = filters.get("selectedTank").strip()
            sensorFilter = filters.get("selectedSensor").strip()
            measureFilter = filters.get("selectedMeasure").strip()
            startDateFilter = filters.get("formattedStart").strip()
            endDateFilter = filters.get("formattedEnd").strip()
            print(tankFilter, sensorFilter, startDateFilter, endDateFilter)

            if tankFilter == "all" and sensorFilter == "all":     # Get sensor id list based on filters
                sensor_ids_cursor = sensor_collection.find({}, {"_id": 1})
            elif tankFilter == "all":
                sensor_ids_cursor = sensor_collection.find({"type": filters.get("selectedSensor")}, {"_id": 1})
            elif sensorFilter == "all":
                sensor_ids_cursor = sensor_collection.find({"tank": int(filters.get("selectedTank"))}, {"_id": 1})
            else:
                sensor_ids_cursor = sensor_collection.find({"tank": int(filters.get("selectedTank")), "type": filters.get("selectedSensor")}, {"_id": 1})

            sensor_ids_list = list(sensor_ids_cursor)
            sensor_ids = [sensor['_id'] for sensor in sensor_ids_list]
            print(sensor_ids)

            result_data = {}
            Sensor_List = self.state.get("Sensor List")
            for sensor in sensor_ids:
                for sensor_id, sensor_data in Sensor_List.items():
                    if sensor == sensor_data["id"] and ( measureFilter == "all" or sensor_data["measure"] == measureFilter ):
                        collection = sensor_data["db"]
                        if startDateFilter == "0" and endDateFilter == "0":
                            # Get start data
                            settings = settings_collection.find_one()
                            start_date = settings['start_date']
                            measurements_cursor = collection.find({"time": {"$gte": start_date}})
                        elif endDateFilter == "0":
                            tempEndFilter = startDateFilter[:11] + "23:59:59.999Z"
                            startDate = datetime.strptime(startDateFilter, "%Y-%m-%dT%H:%M:%S.%fZ")
                            tempEnd = datetime.strptime(tempEndFilter, "%Y-%m-%dT%H:%M:%S.%fZ")
                            measurements_cursor = collection.find({"time": {"$gte": startDate, "$lt": tempEnd}})
                        else:
                            startDate = datetime.strptime(startDateFilter, "%Y-%m-%dT%H:%M:%S.%fZ")
                            endDate = datetime.strptime(endDateFilter, "%Y-%m-%dT%H:%M:%S.%fZ")
                            measurements_cursor = collection.find({"time": {"$gte": startDate, "$lt": endDate}})
                        measurements_list = list(measurements_cursor)
                        if measurements_list:
                            result_data[sensor_id] = measurements_list

            json_data = json.loads(json_util.dumps(result_data))
            return jsonify({"sensor_data": json_data})

        ####################################################################
        #                        USER PAGE ROUTES -- talk to user collection
        ####################################################################

        # This route returns a list of users from users collection
        @self.app.route("/users", methods=["GET"])
        def get_users():
            users_cursor = user_collection.find()
            json_users = list(map(lambda x: json.loads(json_util.dumps(x)), users_cursor))
            return jsonify({"users": json_users})

        @self.app.route("/create_user", methods=["POST"])
        def create_user():
            data = request.json
            firstName = data.get("firstName")
            lastName = data.get("lastName")
            email = data.get("email")
            password = data.get("password")
            role = data.get("role")
            notifs = data.get("notifs")
            if not notifs:
                notifs = "no"
            if not email or not password:
                return jsonify({"message": "Missing required fields"}), 400
            if user_collection.find_one({"username": email}):
                return jsonify({"message": "User already exists"}), 400
            user_collection.insert_one({"firstName": firstName, "lastName": lastName, "email": email, "password": password, "role": role, "notifs": notifs})
            return jsonify({"message": "User created successfully"}), 201

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
            user_id = {"_id": ObjectId(id)}
            existing_user = user_collection.find_one(user_id)
            if not existing_user:
                return jsonify({"message": "User not found"}), 404

            result = user_collection.delete_one(user_id)
            return jsonify({"message": "User deleted!"}), 200
        
        # This route returns the settings of a user
        @self.app.route("/user_settings/<id>", methods=["GET"])
        def user_settings(id):
            user_id = {"_id": ObjectId(id)}
            existing_user = user_collection.find_one(user_id)
            if not existing_user:
                return jsonify({"message": "User not found"}), 404

            existing_user["_id"] = str(existing_user["_id"])
            return jsonify({"settings": existing_user}), 200

        #########################################
        #      WEB SOCKET STUFF
        #########################################

        # --- WebSocket Connection ---
        @self.socketio.on('connect')
        def client_connect():
            #print("Client connected via WebSocket")
            client_ip = request.remote_addr
            sid = request.sid
            print(f"🔵 New WebSocket Connection Attempt: {sid} from {client_ip}")

            # Store connected clients if needed (for debugging)
            #if not hasattr(client_connect, "clients"):
            #    client_connect.clients = set()
            #client_connect.clients.add(sid)

            #print(f"Currently connected clients: {len(client_connect.clients)}")

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
                    formatted_readings = []
                    while "recent readings" not in sensor_data or not sensor_data["recent readings"]:
                        print("Waiting for recent readings...")
                        time.sleep(1)  # Wait 1 second before checking again
                    for reading in sensor_data["recent readings"]:
                        formatted_readings.append({
                            "time": reading["time"],
                            "value": reading["value"]
                        })

                    newData[sensor_id] = formatted_readings # Store in the newData w/ sensor name        
                emit('packet_home', {"packet_data": newData}, broadcast=True)
            else:
                all_measurements = {}
                for sensor_name_measure, sensor_data in Sensor_List.items():
                    if str(sensor_data["id"]) == client_request:
                        sensor_name = sensor_data["name"]  # Get the sensor name
                        formatted_readings = []
                        while "recent readings" not in sensor_data or not sensor_data["recent readings"]:
                            print("Waiting for recent readings...")
                            time.sleep(1)  # Wait 1 second before checking again
                        for reading in sensor_data["recent readings"]:
                            formatted_readings.append({
                                "time": reading["time"],
                                "value": reading["value"]
                            })
                        all_measurements[sensor_name_measure] = formatted_readings
                packet = f"packet-{sensor_name}"
                emit(packet, {"packet_data": all_measurements}, broadcast=True)
                  

        @self.socketio.on('update')
        def send_update(data):
            # in system state, in the Sensor List, iterate through the sensors and return the timestamps and data
            Sensor_List = self.state.get("Sensor List")
            newData = {}
            client_request = data.get("request")

            if client_request == "home":
                for sensor_id, sensor_data in Sensor_List.items():
                    sensor_name = sensor_data["name"]  # Get the sensor name
                    while "current reading" not in sensor_data or not sensor_data["current reading"]:
                        print("Waiting for current reading...")
                        time.sleep(1)  # Delay to avoid tight loop
                    reading = sensor_data["current reading"]
                    newData[sensor_id] = ({
                        "time": reading["time"],
                        "value": reading["value"]
                    }) # Store in the newData w/ sensor name
                emit('update_home', {"update_data": newData}, broadcast=True)
            else:
                all_readings = {}
                for sensor_name_measure, sensor_data in Sensor_List.items():
                    if str(sensor_data["id"]) == client_request:
                        sensor_name = sensor_data["name"]  # Get the sensor name
                        while "current reading" not in sensor_data or not sensor_data["current reading"]:
                            print("Waiting for current reading...")
                            time.sleep(1)  # Delay to avoid tight loop
                        all_readings[sensor_name_measure] = sensor_data["current reading"]
                update = f"update-{sensor_name}"
                print("update name:", update)
                emit(update, {"update_data": all_readings}, broadcast=True)

        @self.socketio.on('disconnect')
        def client_disconnect():
            #print("Client disconnected from WebSocket")
            sid = request.sid
            print(f"🔴 Client disconnected: {sid}")

            # Remove client from set
            #if hasattr(client_connect, "clients"):
            #    client_connect.clients.discard(sid)

            #print(f"Remaining clients: {len(client_connect.clients)}")


        # Method to shutdown the server
        @self.app.route('/shutdown', methods=['POST'])
        def shutdown():
            def stop_server():
                print("Server is shutting down...")
                os._exit(0)  # Forcefully terminate the process

            self.socketio.start_background_task(stop_server)
            return 'Server shutting down...', 200

    # Method to run the app - used in main
    def run_app(self):
        self.socketio.run(self.app, debug=False) 


# Code to run the app - without main
if __name__ == '__main__':
   state = 1
   my_app = Flask_App(state)
   my_app.run_app()