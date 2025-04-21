import smtplib
import threading
import time
from collections import deque

# system for sending emails to users.
# emails are recieved in the outbox deque
# when the deque is not empty, connects to gmail and sends emails
# until it is empty.
# disconnects and repeats until terminate flag is set
class mail_server:
	sender = None
	server = None
	outbox = deque()

	def __init__(self):
		self.sender = 'fitaqualabnotification@gmail.com'

	def run(self, state):
		while(True):
			if (len(self.outbox) == 0):
				# terminate escape
				if(state.get("terminate")):
					break

				# if no emails, do nothing
				time.sleep(1)
				continue

			# connect and send emails
			self._connect_()
			while len(self.outbox) > 0:
				#try:
				message = self.outbox.popleft()
				self.server.sendmail(self.sender, message["reciever"], message["text"])

			# disconnect
			self.server.quit()

		return

	# adds email to outbox
	def send_email(self, address, text):
		self.outbox.append({"reciever": address, "text": text})

	# connects to gmail and logs in
	def _connect_(self):
		self.server = smtplib.SMTP("smtp.gmail.com", 587)
		self.server.starttls()
		self.server.login(self.sender, "imiqzepqgyrnzzod")

