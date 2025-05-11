import socket
import os
import datetime
import threading
import time
import logging
import csv
from threading import Event
import requests
# Configure logging
logging.basicConfig(level=logging.WARNING, filename='errors.log', format='%(asctime)s - %(message)s')

# Input server IP
HostName_server = input("Enter the server IP:")
Target_ID = input("Donnez un nom a ce convoie:")
# Path setup
path_dir = os.path.dirname(os.path.abspath(__file__))
path_file = os.path.join(path_dir, "cor_SRV.txt")

# Clear the content of cor_SRV.txt
with open(path_file, "a+") as file:
  file.truncate(0)

# Mission file setup
format_time = datetime.datetime.now()
mission_name = format_time.strftime("%Y-%m-%d_%H%M%S")
path_file_mission = os.path.join(path_dir, "Mission", f"{mission_name}.txt")

# Stop event for threads
stop_event = Event()

#############################################################################

def mission(data, time):
  """
  Write mission data to a CSV file.
  """
  if data != '':
    data = data + str(time)
    row = data.split(',')
    with open(path_file_mission, "a", newline='') as file:
      writer = csv.writer(file)
      writer.writerow(row)

##############################################################################

def cor_client_txt(data):
  """
  Append received data to cor_SRV.txt.
  """
  if data != '':
    with open(path_file, "a") as file:
      file.write(data + '\n')

#############################################################################

port = 2024

def connect():
  """
  Establish a UDP server connection and handle incoming data.
  """
  while not stop_event.is_set():
    try:
      print('I am in connect function')
      s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
      s.bind((HostName_server, port))

      while not stop_event.is_set():
        
          data, addr = s.recvfrom(1024)
          data = data.decode()
          format_time = datetime.datetime.now()
          time_rcv = format_time  # Store timestamp format

          cor_client_txt(data)
          mission(data, time_rcv)
          # Here you can add the HTTP request to send data to localhost:3000
          response = requests.post('http://localhost:3000/target-locations', data={'target': Target_ID,'data': data, 'time': time_rcv})
          # Print the received data
          print(response.status_code)

          if not data:
            break

          print('+' * 60 + '\n')
          print(' ' * 10 + f"data received from <<{addr}>>: \n")
          print(' ' * 10 + f"{data} ---- in: {time_rcv} \n")
      s.close()
    except Exception as error:
      print(error)
      print('I quit the connect function')
      logging.error(f"{error}", exc_info=True)
      s.close()
      if not stop_event.is_set():
        connect()

#########################################################################

# Start threads
th1 = threading.Thread(target=connect)

try:
  th1.start()
  th1.join()
except KeyboardInterrupt:
  print("\nStopping server...")
  stop_event.set()
  th1.join()
  print("Server stopped.")
