from w_sensor import Water_Sensor
from a_sensor import Air_Sensor
from p_sensor import Pressure_Sensor
from db_config import user_collection, w1_sensor_collection, a1_sensor_collection, p1_sensor_collection, w2_sensor_collection, a2_sensor_collection, p2_sensor_collection, sensor_collection
from flask import jsonify
import json
from bson import json_util
import threading
import time
from collections import deque
from app import Flask_App

system_state = {
    "state_lock":threading.Lock(),
    "state": "Initial",
    "Sensor Groups": 2,
    "raw Sensors": [],
    "Sensor List": {},
    "current readings": [],
    "reading_lock": threading.Lock(),
    "terminate": False,
    "recent readings": deque([]),
    "New User Settings": False
}


def main():
    # initialize app
    app_thread = threading.Thread(target=app_init(), args=system_state)
    app_thread.start()

    # initialize connection with host computer
    # should be the only connection in the setup phase

    # Wait for 6 raw sensors to be added
    while True:
        system_state["state_lock"].acquire()
        if len(system_state["raw Sensors"]) == system_state["Sensor Groups"] * 3:
            system_state["state_lock"].release()
            break

        system_state["state_lock"].release()

        #* begin bulk comment out 1
        #* allow user to connect sensors
        #*
        #* read connection data from db
        #*
        #* For Haley: I want to do this in app. I am feeding the initializing function
        #* system_state. ALL accesses to system_state MUST be in an acquire-release
        #* as demonstrated in the above block. This is to prevent data corruption.
        #* Add the sensor objects to the "raw sensors" list
        #* Format them in a tuple (sensor object, name, highest value, lowest value)
        #* end For Haley
        #*
        #* connection_data = list(sensor_config_collection.find())  # This returns a cursor
        #* for entry in connection_data:
            #* create sensor instances
            #* i dont actually know how the config data is going to come in so we might have to reformat
            #* print(entry)
            #* w_sensor1 = Water_Sensor("COM4", 19200)  # enter the data and make the sensor
            #* data = w_sensor1.connect_port()    --- implement at start of run
            #* a_sensor1 = Air_Sensor("COM5", 19200)
            #* data = a_sensor1.connect_port()    --- implement at start of run
            #* p_sensor1 = Pressure_Sensor("COM6", 19200)
            #* data = p_sensor1.connect_port()    --- implement at start of run

        #* break
        # end bulk comment out 1

    # convert the raw sensor data to sensor wrappers
    system_state["state_lock"].acquire()
    for data_set in system_state["raw Sensors"]:
        system_state["Sensor List"][data_set[1]] = new_sensor_wrapper(*dataset)
    system_state["state_lock"].release()

    # need some threading action

    # create list of threads for each sensor
    system_state["state_lock"].acquire()
    sensor_threads = []
    for sensor in system_state["Sensor List"]:
        sensor_threads.append(threading.Thread(target=sensor_proc, args=sensor))
    system_state["state_lock"].release()

    # begin threads
    for thread in sensor_threads:
        thread.start()

    # main state
    while True:
        system_state["state_lock"].acquire()
        if system_state["New User Settings"]:
            # For Haley, database get the new settings (just high/low rn I think)
            # We should be able to modify high/low with something like this
            # When a new change is sent, flip the system_state["New user settings"] to true
            # for setting in new_settings:
            #    sensor_list[setting["name"]]["high"] = ???
            #    sensor_list[setting["name"]]["low"] = ???
            # end For Haley
            system_state["New User Settings"] = True

        system_state["state_lock"].release()

        # sleep command to ensure other threads get to run
        time.sleep(0.5)

    # end main state while

    # data = w_sensor1.disconnect_port()    --- implement at end of run for sensors


# Somehow detects sensors connected but not implemented
# in code to allow the user to set them up
# implementation unknown
def detect_sensors():
    # Show available sensors
    pass


# creates dictionary breakdown for sensor
def new_sensor_wrapper(sensor, name, high, low):
    return {
        "sensor": sensor,
        "name": name,
        "high": high,
        "low": low,
        "recent readings": deque([])
    }


# Multithread entry point for each sensor
def sensor_proc(sensor_wrapper):
    # will continuously update with the current value of
    # this sensor then sleep, shared storage needs protection

    # read sensor data
    while not system_state["terminate"]:
        system_state["state_lock"].acquire()
        current_reading = {"value":sensor_wrapper["sensor"].read_data(), "time":time.time()}
        sensor_wrapper["recent readings"].append(current_reading)

        high = sensor_wrapper["high"]
        low = sensor_wrapper["low"]

        if current_reading["value"] > high or current_reading < low:
            notification(sensor_wrapper)

        while len(sensor_wrapper["recent readings"]) > 0:
            if time.time() - sensor_wrapper["recent readings"][0]["time"] > 600:
                sensor_wrapper["recent readings"].popleft()
            else:
                break
        system_state["state_lock"].release()

        # For Haley
        # Somehow current_reading needs to be recorded to a sensor
        # specific collection.
        # End For Haley

        time.sleep(0.1)

def notification(sensor):
    print("Sensor value out of range: ")
    print("sensor " + sensor["name"] +" read value " + \
          sensor["recent readings"][-1])
    print("Not with " + sensor["low"] + "-" + sensor["high"] + " range")

def app_init(state):
    Flask_App(state)


main()
