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
        self.connect_port()
    
    # read data from sensor
    def read_data(self, measure) -> dict:
        try:
            waiting_for_read = True
            while (waiting_for_read):
                value = self.ser.readline()
                valueInString=str(value, 'UTF-8')
                print(valueInString)
                data_wo_header = valueInString[5:]
                data_entries = data_wo_header.split(",")
                if len(data_entries) == 13:
                    waiting_for_read = False

            # Return 5th entry - the CO2 data
            if measure == "CO2":
                data = float(data_entries[3])
            else:
                data = float(data_entries[8])
            print(data)    
            return data

        except serial.SerialException as e:
            print(f"Error reading data: {e}")

    # connect to port
    def connect_port(self):
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