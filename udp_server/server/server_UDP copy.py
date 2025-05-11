import socket
import os
import datetime
import serial
import threading
import time
import logging
import csv
logging.basicConfig(level=logging.WARNING, filename='errors.log', format='%(asctime)s - %(message)s')
HostName_server = input("Enter the server IP:")
# ser_2 = serial.Serial('COM4', 4800, writeTimeout=0)
path_dir = os.path.dirname(os.path.abspath(__file__))

path_file = path_dir + "\\cor_SRV.txt"
with open(path_file, "a+") as file:
    file.truncate(0)


format_time = datetime.datetime.now()
mission_name = format_time.strftime("%Y-%m-%d_%H%M%S")
path_dir_mission = os.path.dirname(os.path.abspath(__file__))
path_file_mission = path_dir_mission + "\\Mission\\" + mission_name + ".txt"

#############################################################################

def mission(data, time):
  if data != '':
    #  use a csv write library
     with open(path_file_mission, "a", newline='') as file:
        writer = csv.writer(file)
        writer.writerow([data, time])
    
    #  with open(path_file_mission, "a") as file:
    #    file.write(f"{data},{time}'\n") 
##############################################################################

def cor_client_txt(data):
    if data != '':
    

      path_dir = os.path.dirname(os.path.abspath(__file__))

      path_file = path_dir + "\\cor_SRV.txt"


      with open(path_file, "a") as file:
          file.write(data + '\n') 


#############################################################################

# def cor_client_NMEA():
#   try:
#     print('I am in serial port function')
#     while True:
#       if os.path.exists(path_file_mission):
#         time.sleep(1)
#         txt_file = open(path_file_mission, "r")
        
#         while True:
#             line = txt_file.readline().strip(' \n')
#             if len(line) < 14:
#                 break
#             last_line = line
#         if len(last_line) > 14:
#           cordinate_rcv = last_line.split(',')
#           cor_X = cordinate_rcv[0]
#           cor_Y = cordinate_rcv[1]
#           orient = cordinate_rcv[2]
#           if cor_Y[0] == '-':
#                 y = 'S'
#                 cor_Y = cor_Y[1:]
#           else:
#                 y = 'N'
#           if cor_X[0] == '-':
#                       x = 'W'
#                       cor_X = cor_X[1:]
#           else:
#                       x = 'E'


#           # x1 = 2.694018
#           # y1 = 31.919096
#           # orient1 = 8.9

#           GPRMC_1 = f'$GPRMC,161407,A,{cor_Y},{y},{cor_X},{x},0.1,{orient},05062022,0.0,E,D*??'
    

          
          
#           ser_2.write(GPRMC_1.encode('utf-8'))
#           txt_file.close()
                    
             
#   except Exception as err:
#         print(err)
#         logging.error(f"{err}", exc_info=True)
#         print("I quite the serial port function")
#         time.sleep(3)
#         cor_client_NMEA()
    
#############################################################################

port = 2024


def connect():
  while True:
    try:
      print('I am in connect function')
      s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
      s.bind((HostName_server, port))
  #  s.listen()

  #  con, addr = s.accept()



      while True:
                
                data, addr = s.recvfrom(1024)
                data = data.decode()
                format_time = datetime.datetime.now()
                # make time_rcv store timestamp format
                
                time_rcv = format_time
                print(time_rcv)
                cor_client_txt(data)
                #cor_client_NMEA(data)
                mission(data, time_rcv)
            
                if not data:
                   break
                print('+' * 60 + '\n')
                print(' ' * 10 + f"data received from <<{addr}>>: \n")
                print(' ' * 10 + f"{data} ---- in: {time_rcv} \n")
                #cor_client_NMEA(data)
           
 
      con.close()
    except Exception as error:
           print(error)
           print('I quite the connect function')
           logging.error(f"{error}", exc_info=True)
           s.close()
           connect()
 




#########################################################################


th1 = threading.Thread(target=connect)
# th2 = threading.Thread(target=cor_client_NMEA)

th1.start()
# th2.start()

th1.join()
# th2.join()