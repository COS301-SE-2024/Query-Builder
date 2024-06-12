"use client"
import "../../app/globals.css"
import React, { useState } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Spacer} from "@nextui-org/react";

// This function gets the token from local storage.
// Supabase stores the token in local storage so we can access it from there.
const getToken = () => {
  const storageKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}-auth-token`;
  const sessionDataString = localStorage.getItem(storageKey);
  const sessionData = JSON.parse(sessionDataString || "null");
  const token = sessionData?.access_token;

  console.log(token)

  return token;
};

export default function DatabaseConnectionModal(){

    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const [databaseConnectionStatus, setDatabaseConnectionStatus] = useState('Not connected to a database');

    const [url, setUrl] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [urlHasBeenFocused, setURLHasBeenFocused] = useState(false);
    const [usernameHasBeenFocused, setUsernameHasBeenFocused] = useState(false);
    const [passwordBeenFocused, setPasswordHasBeenFocused] = useState(false);

    //form validation
    const validateURL = (value: string) => value.match(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$|(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i);

    const isURLInvalid = React.useMemo(() => {
      if (url === "") return true;
  
      return validateURL(url) ? false : true;
    }, [url]);

    const isPasswordInvalid = React.useMemo(() => {
      if (password === "") return true;
  
      return false;
    }, [password]);

    const isUsernameInvalid = React.useMemo(() => {
      if (username === "") return true;
  
      return false;
    }, [username]);

    const connectToDatabase = (host:string, user:string, password:string) => {

      fetch("http://localhost:55555/api/connect", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': getToken()
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
        <Button onPress={onOpen} color="primary">+ Add</Button>
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          placement="top-center"
          className="text-black"
        >
          <ModalContent>
            {(onClose : any) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Connect to a database</ModalHeader>
                <ModalBody>
                  <Input
                    isRequired
                    label="URL or Host"
                    placeholder="Enter the database URL or Host"
                    variant="bordered"
                    onValueChange={setUrl}
                    onFocus={() => setURLHasBeenFocused(true)}
                    isInvalid={isURLInvalid && urlHasBeenFocused}
                    color={!urlHasBeenFocused ? "primary" : isURLInvalid ? "danger" : "success"}
                    errorMessage="Please enter a valid database URL or Host"
                  />
                  <Input
                    isRequired
                    label="Username"
                    placeholder="Enter your username"
                    variant="bordered"
                    onValueChange={setUsername}
                    onFocus={() => setUsernameHasBeenFocused(true)}
                    isInvalid={isUsernameInvalid && usernameHasBeenFocused}
                    color={!usernameHasBeenFocused ? "primary" : isUsernameInvalid ? "danger" : "success"}
                    errorMessage="Please enter a username"
                  />
                  <Input
                    isRequired
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    variant="bordered"
                    onValueChange={setPassword}
                    onFocus={() => setPasswordHasBeenFocused(true)}
                    isInvalid={isPasswordInvalid && passwordBeenFocused}
                    color={!passwordBeenFocused ? "primary" : isPasswordInvalid ? "danger" : "success"}
                    errorMessage="Please enter a password"
                  />
                </ModalBody>
                <ModalFooter>
                  <Button 
                    color="primary" 
                    onPress={onClose}  
                    onClick={() => connectToDatabase(url, username, password)}
                    isDisabled={isURLInvalid || isUsernameInvalid || isPasswordInvalid}
                    >
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