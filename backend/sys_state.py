import threading
import copy

class Sys_State:
	lock = None
	parameters = None

	def __init__(self, default_dict):
		self.lock = threading.Lock()
		self.parameters = default_dict

	def get(self, target):
		self.lock.acquire()
		out = copy.copy(self.parameters[target])
		self.lock.release()
		return out

	def set(self, target, new_value):
		self.lock.acquire()
		self.parameters[target] = new_value
		self.lock.release()

	def add_to_dict(self, target, key, value):
		self.lock.acquire()
		self.parameters[target][key] = value
		self.lock.release()

	def add_to_list(self, target, value):
		self.lock.acquire()
		self.parameters[target].append(value)
		self.lock.release()

	def hard_lock(self):
		self.lock.acquire()

	def hard_release(self):
		self.lock.release()
