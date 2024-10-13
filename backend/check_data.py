
# class for checking incoming data measurements
class Check_Data:

    # constructor
    def __init__(self, input) -> None:
        self.data = ""
    
    # grab range from db?
    def get_range(self, sensor) -> None:
        self.data = sensor

    # check data with range
    def check_data(self, measurement) -> bool:
        if self.data:
            return True
        else:
            return False