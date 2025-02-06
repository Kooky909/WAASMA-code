from w_sensor import Water_Sensor
from a_sensor import Air_Sensor
from p_sensor import Pressure_Sensor
from db_config import user_collection, w1_sensor_collection, a1_sensor_collection, p1_sensor_collection, \
    sensor_config_collection
from flask import jsonify
import json
from bson import json_util
import threading
import time
from collections import deque
#from app import Flask_App
from sys_state import Sys_State
from random_test_sensor import Random_Test_Sensor

system_state = Sys_State({
    "state": "Initial",
    "Sensor Groups": 2,
    "raw_sensors": [],
    "Sensor List": {},
    "terminate": False,
    "New User Settings": False
})


def main():
    # initialize app
    app_thread = threading.Thread(target=app_init, args=[system_state])
    app_thread.start()

    # initialize connection with host computer
    # should be the only connection in the setup phase

    number = 0

    # Wait for 6 raw_sensors to be added
    while True:
        if len(system_state.get("raw_sensors")) == system_state.get("Sensor Groups") * 3: # waiting for 6
            break
        
        if number == 0:
           raw_list = system_state.get("raw_sensors")
           raw_list.append((Air_Sensor("COM5", 19200), "Sensor #" + str(len(raw_list) + 1), 40000, 1))
           system_state.set("raw_sensors", raw_list)
           number = 1
        else:         
           raw_list = system_state.get("raw_sensors")
           raw_list.append((Random_Test_Sensor(), "Sensor #" + str(len(raw_list) + 1), 10, 1))
           system_state.set("raw_sensors", raw_list)


           # remove weird temp buffer

        #* begin bulk comment out 1
        #* allow user to connect sensors
        #*
        #* read connection data from db
        #*
        #* For Haley: I want to do this in app. I am feeding the initializing function
        #* system_state. 
        #* Add the sensor objects to the "raw_sensors" list
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
            # For Haley, database get the new settings (just high/low rn I think)
            # We should be able to modify high/low with something like this
            # When a new change is sent, flip the system_state["New user settings"] to true
            # for setting in new_settings:
            #    sensor_list[setting["name"]]["high"] = ???
            #    sensor_list[setting["name"]]["low"] = ???
            # end For Haley
            system_state.set("New User Settings", False)

        # sleep command to ensure other threads get to run
        time.sleep(10)
        system_state.set("terminate", True)
    # end main state while

    app_thread.join()
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
def new_sensor_wrapper(sensor, name, high, low):
    out = {
        "sensor": sensor,
        "name": name,
        "high": high,
        "low": low,
        "recent readings": deque()
    }
    return out


# Multithread entry point for each sensor
def sensor_proc(sensor_wrapper):
    # will continuously update with the current value of
    # this sensor then sleep, shared storage needs protection

    # read sensor data
    while not system_state.get("terminate"):
        current_reading = {"value":sensor_wrapper["sensor"].read_data(), "time":time.time()}

        system_state.hard_lock()
        sensor_wrapper["recent readings"].append(current_reading)

        high = sensor_wrapper["high"]
        low = sensor_wrapper["low"]

        print(sensor_wrapper["sensor"], "   ", current_reading["value"])
        if current_reading["value"] > high or current_reading["value"] < low:
            notification(sensor_wrapper)

        while len(sensor_wrapper["recent readings"]) > 0:
            if time.time() - sensor_wrapper["recent readings"][0]["time"] > 600:
                sensor_wrapper["recent readings"].popleft()
            else:
                break

        # For Haley
        # Somehow current_reading needs to be recorded to a sensor
        # specific collection.
        # End For Haley

        system_state.hard_release()

        time.sleep(0.1)
    #system_state.hard_lock()
    #print(sensor_wrapper["name"] + ": " + str(sensor_wrapper["recent readings"]))
    #system_state.hard_release()

def notification(sensor):
    print("Sensor value out of range: ")
    print("sensor " + sensor["name"] +" read value " + \
          sensor["recent readings"][-1])
    print("Not with " + sensor["low"] + "-" + sensor["high"] + " range")

def app_init(state):
    #Flask_App(state)
    pass


main()
