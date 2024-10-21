from app import AHHHHHHHHH
import threading

system_state = {
    "state":"Initial",
    "Sensor Groups":None,
    "Sensor List":[],
    "current readings":[],
    "reading_lock":threading.Lock()
}

def main():


    # initialize connection with host computer
    # should be the only connection in the setup phase


    # setup
    while True:
        # allow user to connect sensors
        pass


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
        local_readings=system_state["current readings"].copy()
        system_state["reading_lock"].release()

        # check the data
        for i in range(len(local_readings)):
            system_state["Sensor List"][i].check(local_readings[i])

        # store the data
        # database stuff ig
    # end main state while

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
    pass

main()