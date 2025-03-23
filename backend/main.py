from w_sensor import Water_Sensor
from a_sensor import Air_Sensor
from p_sensor import Pressure_Sensor
from db_config import db, user_collection, sensor_config_collection, test_sensor_collection
from flask import jsonify
import json
from bson import json_util
import threading
import time
from datetime import datetime
from collections import deque
from app import Flask_App
from mail_server import mail_server
from sys_state import Sys_State
from random_test_sensor import Random_Test_Sensor
from pymongo import MongoClient

system_state = Sys_State({
    "state": "Initial",
    "Sensor Groups": 2,
    "raw_sensors": [],       # tuple = sensor object, sensor id, sensor name, high, low, db collection
    "Sensor List": {},
    "terminate": False,
    "New User Settings": False,
    "Mail Server": None
})

def main():
    # initialize app
    app_thread = threading.Thread(target=app_init, args=[system_state])
    app_thread.start()

    # initialize mail server
    mail_thread = threading.Thread(target=mail_init, args=[system_state])
    mail_thread.start()

    # initialize connection with host computer
    # should be the only connection in the setup phase
    # Flask takes user data and fills in the sensor collection, system state is updated here

    number = 0
    
    print("Looking for sensors")

    # Loops until six sensors are added
    while not len(system_state.get("raw_sensors")) == system_state.get("Sensor Groups") * 3:
        sensor_config = test_sensor_collection.find()

        # This loops through all the sensors, the while is not needed?
        for sensor in sensor_config:
            # dynamically create a new collection and add to the tuple, this will read from sensor collection
            db_name = f"{sensor["name"]}_collection"
            #db_name = f"Sensor#{number}_collection"
            db_collection = db[db_name]
            db_collection.insert_one({"init": "collection created"})
            system_state.add_to_list("raw_sensors", (Random_Test_Sensor(), sensor["_id"], sensor["name"], 10, 1, db_collection))
            number = number + 1
            #else:      
            #    system_state.add_to_list("raw_sensors", (Air_Sensor("COM5", 19200), "Sensor #" + str(number), 40000, 1, db_list[number]))
            #    number = number + 1

    # End Wait for 6 sensors

    print("six sensors connected")

    # convert the raw sensor data to sensor wrappers
    for data_set in system_state.get("raw_sensors"):
        system_state.add_to_dict("Sensor List", data_set[1], new_sensor_wrapper(*data_set))

    print("sensors wrapped")
    # need some threading action

    # create list of threads for each sensor
    sensor_threads = []
    for sensor in system_state.get("Sensor List").values():
        sensor_threads.append(threading.Thread(target=sensor_proc, args=[sensor]))

    # begin threads
    time.sleep(5)
    for thread in sensor_threads:
        thread.start()

    print("all threads active")
    # main state
    while not system_state.get("terminate"):
        if system_state.get("New User Settings"):
            # 'New User Settings' boolean in system_state tells main to ask the DB
            # for the new settings.

            # There needs to be a DB query here to get new user settings

            # Reset 'New User Settings'
            system_state.set("New User Settings", False)

        # for testing purposes, ends after 10 seconds
        time.sleep(5)
        system_state.set("terminate", True)
        print("time termination")
    # end main state while

    # Join all threads
    app_thread.join()
    mail_thread.join()
    for thread in sensor_threads:
        thread.join()

    print("all threads closed")

    # data = w_sensor1.disconnect_port()    --- implement at end of run for sensors


# Somehow detects sensors connected but not implemented
# in code to allow the user to set them up
# implementation unknown
def detect_sensors():
    # Show available sensors
    pass


# creates dictionary breakdown for sensor
def new_sensor_wrapper(sensor, id, name, high, low, db):
    out = {
        "sensor": sensor,
        "id": id,
        "name": name,
        "high": high,
        "low": low,
        "db": db,
        "current reading": {},
        "recent readings": deque()
    }
    return out


# Multithread entry point for each sensor
def sensor_proc(sensor_wrapper):
    # will continuously update with the current value of
    # this sensor then sleep, shared storage needs protection

    # read sensor data
    while not system_state.get("terminate"):
        current_reading = {"value":sensor_wrapper["sensor"].read_data(), "time": datetime.now().timestamp()}

        system_state.hard_lock()

        try:
            sensor_wrapper["current reading"] = current_reading
            sensor_wrapper["recent readings"].append(current_reading)

            high = sensor_wrapper["high"]
            low = sensor_wrapper["low"]

            # print(sensor_wrapper["sensor"], "   ", current_reading["value"])
            if current_reading["value"] > high or current_reading["value"] < low:
                notification(sensor_wrapper)

            while len(sensor_wrapper["recent readings"]) > 0:
                if time.time() - sensor_wrapper["recent readings"][0]["time"] > 600:
                    sensor_wrapper["recent readings"].popleft()
                else:
                    break

            # Creating a DB entry with the current reading
            sensor_wrapper["db"].insert_one({"value": current_reading["value"], "time": datetime.now(), "sensor_id": sensor_wrapper["id"]})
        except Exception as err:
            print("Error in sensor reading for " + sensor_wrapper["name"])
            print("\n" + str(err))

        system_state.hard_release()

        time.sleep(1.5)

def notification(sensor):
    ms = system_state.parameters["mail server"]
    text = "Subject: Sensor Out of Range\n\n" + \
    "Sensor value out of range: " + \
    "\nsensor " + sensor["name"] +" read value " + str(sensor["recent readings"][-1]["value"]) + \
    "\nNot with " + str(sensor["low"]) + "-" + str(sensor["high"]) + " range"    
    users_cursor = user_collection.find()
    user_list = list(users_cursor)
    emails = []

    for user in user_list:
        print("email sent")
        ms.send_email(user["email"], text)

def app_init(state):
    my_app = Flask_App(state)
    my_app.run_app()
    pass

def mail_init(state):
    ms = mail_server()
    system_state.set("mail server", ms)
    ms.run(state)

try:
    main()
except Exception as err:
    print(err)
    system_state.set("terminate", True)
