from fastapi import FastAPI
from pydantic import BaseModel
from ConnectionManager import connectToDatabase

app = FastAPI()

class DatabaseCredentials(BaseModel):
    host: str
    user: str
    password: str

@app.post("/api/connect")
def connect(databaseCredentials: DatabaseCredentials):
    return connectToDatabase(databaseCredentials.host, databaseCredentials.user, databaseCredentials.password)