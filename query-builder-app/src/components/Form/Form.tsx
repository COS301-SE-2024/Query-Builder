"use client"
import "../../app/globals.css"
import React, { useState } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Spacer} from "@nextui-org/react";

export default function DatabaseConnectionModal(){

    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const [databaseConnectionStatus, setDatabaseConnectionStatus] = useState('Not connected to a database');

    const [url, setUrl] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const connectToDatabase = (host:string, user:string, password:string) => {

      fetch("http://localhost:55555/api/connect", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          host: host,
          user: user,
          password: password
        })
      }).then(
        function(response){
          if(response.ok){
            return response.json();
          }
          else{
            return ({"success" : false})
          }
        }
      ).then(
        function(response){
          console.log(response)
          if(response.success == true){
            setDatabaseConnectionStatus("Connected to database")
          }
          else{
            setDatabaseConnectionStatus("Not connected to a database")
          }
        }
      )

    }

    return (

        <>
        <h1>{databaseConnectionStatus}</h1>
        <Spacer y={5}/>
        <Button onPress={onOpen} color="primary">Connect to a database</Button>
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          placement="top-center"
        >
          <ModalContent>
            {(onClose : any) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Connect to a database</ModalHeader>
                <ModalBody>
                  <Input
                    autoFocus
                    label="URL"
                    placeholder="Enter the database URL"
                    variant="bordered"
                    onValueChange={setUrl}
                  />
                  <Input
                    autoFocus
                    label="Username"
                    placeholder="Enter your username"
                    variant="bordered"
                    onValueChange={setUsername}
                  />
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    variant="bordered"
                    onValueChange={setPassword}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" onPress={onClose}  onClick={() => connectToDatabase(url, username, password)}>
                    Connect
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    )

}