import smtplib
import threading
import time
from collections import deque

class mail_server:
	sender = None
	server = None
	outbox = deque()

	def __init__(self):
		self.sender = 'fitaqualabnotification@gmail.com'

	def run(self, state):
		while(True):
			if (len(self.outbox) == 0):
				if(state.get("terminate")):
					break

				time.sleep(1)
				continue

			self._connect_()
			while len(self.outbox) > 0:
				message = self.outbox.popleft()
				self.server.sendmail(self.sender, message["reciever"], message["text"])
			self.server.quit()
		return

	def send_email(self, address, text):
		self.outbox.append({"reciever": address, "text": text})

	def _connect_(self):
		self.server = smtplib.SMTP("smtp.gmail.com", 587)
		self.server.starttls()
		self.server.login(self.sender, "imiqzepqgyrnzzod")

