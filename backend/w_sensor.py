import serial

###################
#  RS232 to USB
###################

class Water_Sensor:

    # constructor
    def __init__(self, input) -> None:
        self.COMport = ""         #ex 'COM5'
        self.baudrate = ""        #ex 19200
        self.tank = ""
    
    # read data from sensor
    def get_range(self, sensor) -> None:
        try:
            # Open the serial port
            ser = serial.Serial(self.com_port, self.baud_rate, timeout=1)
            print("connected to: " + ser.portstr)

            while True:

                value = ser.readliner()
                valueInString=str(value, 'UTF-8')
                print(valueInString)
                # store data to db

        except serial.SerialException as e:
            print(f"Error: {e}")

        finally:
            # Close the serial port
            ser.close()


    # store data to db
    def store_data(self, data) -> None:
        user_collection.insert_one(data)