import serial

###################
#  RS232 to USB   --- maybe its actually sensor BNC->meter->RS232->USB or something
###################

class Water_Sensor:

    # constructor
    def __init__(self, com_port, baud_rate) -> None:
        self.com_port = com_port        #ex 'COM5'
        self.baud_rate = baud_rate        #ex 19200
        self.ser = ""
    
    # read data from sensor
    def read_data(self) -> dict:
        try:
            #value = self.ser.readliner()
            #valueInString=str(value, 'UTF-8')
            #print(valueInString)
            data = {
                "CO2": 102,
                "numbers": 3
            }
            # obviously the sensors would return more then just an int,
            # I dont know what the data input will look like so there will be more here later
            return data

        except serial.SerialException as e:
            print(f"Error reading data: {e}")

    # connect to port
    def connect_port(self) -> None:
        try:
            # Open the serial port
            self.ser = serial.Serial(self.com_port, self.baud_rate, timeout=1)
            print("connected to: " + self.ser.portstr)

        except serial.SerialException as e:
            print(f"Error opening port: {e}")

    # disconnect from port
    def disconnect_port(self) -> None:
        try:
            # Close the serial port
            self.ser.close()
            print("port successfully closed")

        except serial.SerialException as e:
            print(f"Error: {e}")