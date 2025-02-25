import serial

###################
#  ARDUINO to USB  
###################

class Air_Sensor:

    # constructor
    def __init__(self, com_port, baud_rate) -> None:
        self.com_port = com_port        #ex 'COM5'
        self.baud_rate = baud_rate        #ex 19200
        self.ser = ""
        self.connect_port()
    
    # read data from sensor
    def read_data(self) -> int:
        try:
            value = self.ser.readline()
            valueInString=str(value, 'UTF-8')
            if valueInString:
                return(int(valueInString))
            else:
                return 600

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