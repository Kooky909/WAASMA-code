import time
import random

class Random_Test_Sensor:
	def __init__(self):
		self.flag = True
		pass

	def read_data(self):
		time.sleep(1)
		data_from_read = "#DATA: 07/26/24,15:12:15,0.0,21.93,7.42,27.2,-2.76,104.6,8.91,4983.4,0.6,163.3,-18.8"
		data_wo_header = data_from_read[5:]
		data_entries = data_wo_header.split(",")
		# Return 5th entry - the CO2 data
		if self.flag:
			self.flag = False
			return float(data_entries[4])
		else:
			self.flag = True
			return 5.75
