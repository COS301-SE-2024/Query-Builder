import mysql.connector
from mysql.connector import errorcode
from pydantic import BaseModel

class DatabaseConnectionStatus(BaseModel):
  success: bool
  message: str

def connectToDatabase(host, user, password):

  try:
    mydb = mysql.connector.connect(host=host, user=user, password=password)
    return DatabaseConnectionStatus(success=True, message="Successfully connected to database")
  except mysql.connector.Error as err:
    if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
      return DatabaseConnectionStatus(success=False, message="Something is wrong with your username or password")
    else:
      return DatabaseConnectionStatus(success=False, message=str(err))