from w_sensor import Water_Sensor
from a_sensor import Air_Sensor
from p_sensor import Pressure_Sensor 
from db_config import user_collection, w_sensor_collection, a_sensor_collection, p_sensor_collection, sensor_config_collection
from flask import jsonify
import json
from bson import json_util
import threading
import time
from collections import deque
from app import Flask_App

system_state = {
    "state":"Initial",
    "Sensor Groups":None,
    "Sensor List":[],
    "current readings":[],
    "reading_lock":threading.Lock(),
    "terminate":False,
    "recent readings":deque([])
}

def main():

    # initialize app
    app_thread = threading.Thread(target=app_init())
    app_thread.start()

    # initialize connection with host computer
    # should be the only connection in the setup phase


    # setup
    while True:
        # allow user to connect sensors

        # read connection data from db
        connection_data = list(sensor_config_collection.find())  # This returns a cursor
        for entry in connection_data:
            # create sensor instances
            # i dont actually know how the config data is going to come in so we might have to reformat
            print(entry)
            w_sensor1 = Water_Sensor("COM4", 19200)   # enter the data and make the sensor
            #data = w_sensor1.connect_port()    --- implement at start of run
            a_sensor1 = Air_Sensor("COM5", 19200)
            #data = a_sensor1.connect_port()    --- implement at start of run
            p_sensor1 = Pressure_Sensor("COM6", 19200)
            #data = p_sensor1.connect_port()    --- implement at start of run

        break


    # need some threading action

    # create list of threads for each sensor
    sensor_threads = []
    i = 0
    for sensor in system_state["Sensor List"]:
        sensor_threads.append(threading.Thread(target = detect_sensors, args = (sensor, i,)))
        system_state["current readings"][i] = None
        i += 1

    # begin threads
    for thread in sensor_threads:
        thread.start()


    # main state
    while True:
        # read the data (at preferred time intervals)
        system_state["reading_lock"].acquire()
        local_readings= (system_state["current readings"].copy(), time.time())
        system_state["reading_lock"].release()

        # add to recent readings
        system_state["recent readings"].append(local_readings)

        # deletes entries older than 10 minutes
        while len(system_state["recent readings"]) > 0:
            if time.time() - system_state["recent readings"][0][1] > 600:
                system_state["recent readings"].popleft()
            else:
                break

        # check the data
        # for i in range(len(local_readings)):
        #     system_state["Sensor List"][i].check(local_readings[i])

        # store the data (DATABASE STUFF - inserting an entry into the collection)
        w_sensor_collection.insert_one(local_readings)

        # sleep command to ensure other threads get to run
        time.sleep(0.1)
        
    # end main state while

    #data = w_sensor1.disconnect_port()    --- implement at end of run for sensors

# Somehow detects sensors connected but not implemented
# in code to allow the user to set them up
# implementation unknown
def detect_sensors():
    # Show available sensors
    pass

# creates dictionary breakdown for sensor
def new_sensor(name, unit, etc):
    return {
        "name":name,
        "unit":unit
    }

# Multithread entry point for each sensor
def sensor_proc(sensor, index):
    # will continuously update with the current value of
    # this sensor then sleep, shared storage needs protection

    # read sensor data
    while not system_state["terminate"]:
        system_state["reading_lock"].acquire()
        system_state["current readings"][index] = sensor.read_data()
        system_state["reading_lock"].release()
        time.sleep(0.005)

def app_init():
    Flask_App()

main()