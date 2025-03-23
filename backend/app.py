from flask import Flask, request, jsonify, abort
import json
from bson import json_util, ObjectId
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from sys_state import Sys_State
from datetime import datetime, timedelta
from db_config import user_collection, sensor_collection, test_sensor_collection, w1_sensor_collection, a1_sensor_collection, p1_sensor_collection, w2_sensor_collection, a2_sensor_collection, p2_sensor_collection

class Flask_App():
    # Shared with main
    system_state = None

    # constructor
    def __init__(self, state) -> None:
        self.app = Flask(__name__)
        self.socketio = SocketIO(self.app, cors_allowed_origins="*", async_mode='threading')
        self.state = state
        CORS(self.app, resources={r"/*": {"origins": "http://localhost:5173"}})

        def require_role(roles):
            def decorator(f):
                def decorated_function(*args, **kwargs):
                    user_role = request.headers.get("Role")
                    if user_role not in roles:
                        abort(403)  # Forbidden
                    return f(*args, **kwargs)
                return decorated_function
            return decorator

        # This route returns a list of sensors from the sensor collection
        @self.app.route("/sensors", methods=["GET"])
        def get_sensors():
            sensors_cursor = test_sensor_collection.find()
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
        @require_role(["admin", "operator"])
        def config_sensors():
            data = request.json
            if not data:
                return jsonify({"message": "You must include all sensor data"}), 400
            try:
                update = {"$set": data}
                result = test_sensor_collection.update_many({}, update)
            except Exception as e:
                return jsonify({"message": str(e)}), 400
            return jsonify({"message": "Sensors Configured!"}), 201

        # This route updates a high/low range values for a sensor in the sensor collection
        @self.app.route("/change_range", methods=["PATCH"])
        @require_role(["admin", "operator"])
        def change_range():
            data = request.json['data']
            try:
                for tank in data:
                    tank_id = tank['tankId']
                    for sensor in tank['sensors']:
                        sensor_type = sensor['type']
                        coms = sensor['coms']
                        low = sensor['low']
                        high = sensor['high']

                        # Update sensor configuration based on tankId and sensor type
                        filter_query = {"tank": f"Tank {tank_id}", "type": sensor_type}
                        update_query = {"$set": {"coms": coms, "low": low, "high": high}}

                        result = test_sensor_collection.update_one(filter_query, update_query)

                        if result.matched_count == 0:
                            return jsonify({"message": f"Sensor {sensor_type} in Tank {tank_id} not found."}), 404
                return jsonify({"message": "Sensor ranges updated."}), 200
            except Exception as e:
                return jsonify({"message": str(e)}), 400
            
        #updates the frequency setting in the database on the provided ID and JSON request.
        @self.app.route("/change_setting/<id>", methods=["PATCH"])
        def change_setting(id):
            try:
                data = request.json
                frequency = data.get("frequency")

                if frequency is None:
                    return jsonify({"message": "Frequency is required"}), 400

                # Assuming you have a collection to store settings
                # and that you want to update the frequency field
                setting_id = {"_id": ObjectId(id)}
                update = {"$set": {"frequency": int(frequency)}}
                result = test_sensor_collection.update_one(setting_id, update) #using test sensor collection as an example. change as needed.

                return jsonify({"message": "Sensor range updated."}), 200
            except Exception as e:
                return jsonify({"message": str(e)}), 400
        ####################################################################
        #                        ANALYSIS TOOL ROUTES
        ####################################################################

        @self.app.route("/analysis_query/", methods=["POST"])
        def analysis_query():
            filters = request.json
            tankFilter = filters.get("selectedTank").strip()
            sensorFilter = filters.get("selectedSensor").strip()
            startDateFilter = filters.get("formattedStart").strip()
            endDateFilter = filters.get("formattedEnd").strip()

            print(tankFilter, sensorFilter, startDateFilter, endDateFilter)

            if tankFilter == "all" and sensorFilter == "all":
                sensor_ids_cursor = test_sensor_collection.find({}, {"_id": 1})
            elif tankFilter == "all":
                sensor_ids_cursor = test_sensor_collection.find({"type": filters.get("selectedSensor")}, {"_id": 1})
            elif sensorFilter == "all":
                sensor_ids_cursor = test_sensor_collection.find({"tank": filters.get("selectedTank")}, {"_id": 1})
            else:
                sensor_ids_cursor = test_sensor_collection.find({"tank": filters.get("selectedTank"), "type": filters.get("selectedSensor")}, {"_id": 1})

            sensor_ids_list = list(sensor_ids_cursor)
            sensor_ids = [sensor['_id'] for sensor in sensor_ids_list]

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
                            measurements_cursor = collection.find({"time": {"$gte": startDate, "$lt": tempEnd}})
                        else:
                            startDate = datetime.strptime(startDateFilter, "%Y-%m-%dT%H:%M:%S.%fZ")
                            endDate = datetime.strptime(endDateFilter, "%Y-%m-%dT%H:%M:%S.%fZ")
                            measurements_cursor = collection.find({"time": {"$gte": startDate, "$lt": endDate}})
                        measurements_list = list(measurements_cursor)
                        if measurements_list:
                            result_data[sensor_data["name"]] = measurements_list

            json_data = json.loads(json_util.dumps(result_data))
            return jsonify({"sensor_data": json_data})

        ####################################################################
        #                        USER PAGE ROUTES -- talk to user collection
        ####################################################################

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

        @self.app.route("/users", methods=["GET"])
        @require_role(["admin", "operator"])
        def get_users():
            users_cursor = user_collection.find()
            json_users = list(map(lambda x: json.loads(json_util.dumps(x)), users_cursor))
            return jsonify({"users": json_users})

        @self.app.route("/create_user", methods=["POST"])
        @require_role(["admin"])
        def create_user():
            data = request.json
            user_role = request.headers.get("Role")
            if user_role != "admin":
                return jsonify({"message": "Unauthorized access"}), 403
            username = data.get("username")
            password = data.get("password")
            role = data.get("role", "observer")
            if not username or not password:
                return jsonify({"message: Missing required fields"}), 400
            if user_collection.find_one({"username": username}):
                return jsonify({"message:" "User already exists"}), 400
            user_collection.insert_one({"username": username, "password": password, "role": role})
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
        @require_role(["admin", "operator"])
        def delete_user(id):
            user_id = {"_id": ObjectId(id)}
            existing_user = user_collection.find_one(user_id)
            if not existing_user:
                return jsonify({"message": "User not found"}), 404

            result = user_collection.delete_one(user_id)
            return jsonify({"message": "User deleted!"}), 200
        
        # This route returns the settings of a user
        @self.app.route("/user_settings/<id>", methods=["GET"])
        @require_role(["admin", "operator"])
        def user_settings(id):
            user_id = {"_id": ObjectId(id)}
            existing_user = user_collection.find_one(user_id)
            if not existing_user:
                return jsonify({"message": "User not found"}), 404

            existing_user["_id"] = str(existing_user["_id"])
            return jsonify({"settings": existing_user}), 200
        
        ####################################################################
        #         USER ROLES
        ####################################################################
        # Commented out because it now exists above
        # @self.app.route("/user_authen/", methods = ["POST"])
        # def user_authen():
        #     data = request.json
        #     username = data.get("username")
        #     password = data.get("password")

        #     if not username or not password:
        #         return jsonify({"success": False, "message": "Missing credentials"}), 400
            
        #     user = user_collection.find_one({"username": username})
        #     if not user or user.get("password") != password:
        #         return jsonify({"success": False, "message": "Invalid username or password"}), 401
            
        #     role = user.get("role", "observer")
        #     return jsonify({"success": True, "message": "Login successful", "role": role}), 200

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