"use client"
import "../../app/globals.css"
import React, { useState } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Checkbox, Tooltip} from "@nextui-org/react";
import { createClient } from "./../../utils/supabase/client";

require("dotenv").config();

//interface for the props to DatabaseCredentialsModal

interface DatabaseCredentialsModalProps {
  dbServerID: String
  disclosure: any
  onConnected: () => void
}

// This function gets the token from local storage.
// Supabase stores the token in local storage so we can access it from there.
const getToken = async () => {

  const supabase = createClient();
  const token = (await supabase.auth.getSession()).data.session?.access_token

  console.log(token)

  return token;
};

export default function DatabaseCredentialsModal(props: DatabaseCredentialsModalProps){

    const {isOpen, onOpen, onOpenChange} = props.disclosure;

    //React hook to store whether the user wants QBee to remember their database credentials or not
    const [rememberDatabaseCredentials, setRememberDatabaseCredentials] = useState(false);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [usernameHasBeenFocused, setUsernameHasBeenFocused] = useState(false);
    const [passwordBeenFocused, setPasswordHasBeenFocused] = useState(false);

    //form validation
    const isPasswordInvalid = React.useMemo(() => {
      if (password === "") return true;
  
      return false;
    }, [password]);

    const isUsernameInvalid = React.useMemo(() => {
      if (username === "") return true;
  
      return false;
    }, [username]);

    async function connectToDatabaseServer(user:String, password:String){

      //if rememberDatabaseCredentials is set, save the db_secrets
      if(rememberDatabaseCredentials){

        //create a db_secrets object
        const db_secrets = {
          user: user,
          password: password
        }

        //stringify the db_secrets
        const db_secrets_string = JSON.stringify(db_secrets);   

        //log request body
        console.log("BODY OF REQUEST: " + JSON.stringify({
          db_id: props.dbServerID,
          db_secrets: db_secrets_string
        }))

        //call the save-db-secrets API endpoint
        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/save-db-secrets`, {
          credentials: "include",
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken()
          },
          body: JSON.stringify({
              db_id: props.dbServerID,
              db_secrets: db_secrets_string
          })
        })

        //log response body
        let json = await response.json();
        console.log("SAVE DB SECRETS RESPONSE " + JSON.stringify(json));

      }

      //connect to the database, and navigate to the form if the connection is successful

      //call the api/connect endpoint

    }

    return (

        <Modal 
          isOpen={isOpen} 
          placement="top-center"
          className="text-black"
          onOpenChange={onOpenChange}
        >
          <ModalContent>
            {(onClose : any) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Connect to your database server</ModalHeader>
                <ModalBody>
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
                  <Checkbox
                    isSelected={rememberDatabaseCredentials}
                    onValueChange={setRememberDatabaseCredentials}
                    classNames={{
                      label: "text-small",
                    }}
                  >
                    Remember my database credentials
                  </Checkbox>
                </ModalBody>
                <ModalFooter>
                  <Button 
                    aria-label="connect new database button"
                    color="primary" 
                    onPress={onClose}  
                    onClick={() => {connectToDatabaseServer(username, password)}}
                    isDisabled={isUsernameInvalid || isPasswordInvalid}
                    >
                    Connect
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
    )

}