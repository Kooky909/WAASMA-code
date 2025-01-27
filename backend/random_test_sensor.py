import time
import random

class Random_Test_Sensor:
	def __init__(self):
		pass

	def read_data(self):
		time.sleep(1)
		return random.randint(1, 10)
