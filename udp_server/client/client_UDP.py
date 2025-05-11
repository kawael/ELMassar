import socket
import os
import time
import datetime
import logging
import keyboard

logging.basicConfig(level=logging.WARNING, filename='errors.log', format='%(asctime)s - %(message)s')

HOST_IP = input("Enter the IP server:")
pause_min = int(input("Enter the pause time: "))
format_time = datetime.datetime.now()  # here we take the current time
mission_name = format_time.strftime("%Y-%m-%d_%H%M%S")
path_dir_mission = os.path.dirname(os.path.abspath(__file__))
path_file_mission = path_dir_mission + "\\Mission\\" + mission_name + ".txt" # we name the file of the mission by the current time


#############################################################################

def mission(data, time): # the function that create the mission file
  
  with open(path_file_mission, "a") as file:
       file.write(f"{data} >===== in {time}'\n")  

###########################################################################################

def get_cordinate(): # the function that get the cordinates from the track file
 global pause_min
 break_time = pause_min
 try:
     path_dir = os.path.dirname(os.path.abspath(__file__))

     path_file = path_dir + "\\mission.txt"

     txt_file = open(path_file, "r") # open the track file "mission.txt" to read from it
     last_line = ' '
     while True:   # the while loop is looking for the last line in the track file
          x = txt_file.readline().strip(' \n')
          if len(x) < 40:
             txt_file.close()
             break
          last_line = x 
     if len(last_line) > 40: 
      gps_data = last_line.split(',')
      cor_X = gps_data[0]
      cor_X = cor_X[:9]
      cor_Y = gps_data[1]
      cor_Y = cor_Y[:9]
      orient = gps_data[5]

      gps_data_send = f"{cor_X},{cor_Y},{orient},{gps_data[2]},{gps_data[4]}"

      connect(gps_data_send) # send the last line in the track file to connect function
     if sended == True:
       x = 1
       print(f"resending in {pause_min} seconds:\n")
       while x <= break_time:
         if keyboard.is_pressed('shift+p'):
            pause_min = break_time = int(input("Enter the new pause time: "))
         print(f"{x}s", end="\r")
         x += 1
         time.sleep(1)
 except Exception as err:
    print(err)
    logging.error(f'{err}', exc_info=True)

###########################################################################################

def connect(gps_data_send):
 HOST = HOST_IP 
 PORT = 2024 
 global sended 

 client_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
 try:
    # s.connect((HOST, PORT))
    client_socket.sendto(gps_data_send.encode(),(HOST, PORT))  # here we send the data recovered from the track file to the server
    format_time = datetime.datetime.now()
    time_send = format_time.strftime("%d-%m-%Y_%H:%M:%S")
    mission(gps_data_send, time_send)
    print('+' * 60 + '\n')
    print(' ' * 10 + f"data sended to  <<{HOST}>>: \n")
    print(' ' * 10 + f"{gps_data_send} ---- in: {time_send} \n")
    client_socket.close()
    sended = True
 except socket.error as err:
     logging.error(f"{err}", exc_info=True)
     print('+' * 60 + '\n')
     print(' ' * 25 + str(err) + '\n')
     print('reconnecting....>')
     for i in range(1 , 61):
         time.sleep(1)
         print(i, end="\r")
     client_socket.close
    #  get_cordinate()
     sended = False

############################################################################################

while True:
    get_cordinate()
    
