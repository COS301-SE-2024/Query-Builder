"use client"
import "../../app/globals.css"
import React, { useState } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Checkbox, Tooltip} from "@nextui-org/react";
import { createClient } from "./../../utils/supabase/client";
import { navigateToForm } from "../../app/serverActions";
import { EyeFilledIcon } from "../Authentication/EyeFilledIcon";
import { EyeSlashFilledIcon } from "../Authentication/EyeSlashFilledIcon";
import toast from "react-hot-toast";
import { navigateToAuth } from "../../app/authentication/actions";

require("dotenv").config();

//interface for the props to DatabaseCredentialsModal

interface DatabaseCredentialsModalProps {
  dbServerID: string
  databaseName?: string,
  disclosure: any
  onConnected: () => void
}

// This function gets the token from local storage.
// Supabase stores the token in local storage so we can access it from there.
const getToken = async () => {

  const supabase = createClient();
  const token = (await supabase.auth.getSession()).data.session?.access_token

  return token;
};

export default function DatabaseCredentialsModal(props: DatabaseCredentialsModalProps){

    const {isOpen, onOpen, onOpenChange} = props.disclosure;

    //React hook to store whether the user wants QBee to remember their database credentials or not
    const [rememberDatabaseCredentials, setRememberDatabaseCredentials] = useState(false);

    //React hook for visibility of the password
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [usernameHasBeenFocused, setUsernameHasBeenFocused] = useState(false);
    const [passwordBeenFocused, setPasswordHasBeenFocused] = useState(false);

    const isUsernameInvalid = React.useMemo(() => {
      if (username === "") return true;
  
      return false;
    }, [username]);

    async function connectToDatabaseServer(user:string, password:string){

      //connect to the database, and navigate to the form if the connection is successful

      //call the api/connect endpoint, and include databaseServerCredentials
      let connectionResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connect`, {
        credentials: "include",
        method: "PUT",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + await getToken()
        },
        body: JSON.stringify({
            databaseServerID: props.dbServerID,
            databaseName: props.databaseName,
            databaseServerCredentials: {
              username: user,
              password: password
            }
        })
      });

      let json = await connectionResponse.json();

      //if connection was successful, save credentials if necessary, and then navigate to the form
      if(connectionResponse.ok === true && json.success === true){

        //if rememberDatabaseCredentials is set, save the db_secrets
        if(rememberDatabaseCredentials){

          //create a db_secrets object
          const db_secrets = {
            user: user,
            password: password
          }

          //stringify the db_secrets
          const db_secrets_string = JSON.stringify(db_secrets);   

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
          });

          let json = await response.json();

          if(!response.ok && json.response && json.response.message == 'You do not have a backend session'){
            navigateToAuth();
          }

        }

        props.onConnected();

      }
      //if the connection was not successful, display an appropriate error message
      else if(connectionResponse.ok === false && json.response && json.response.message){
        toast.error(json.response.message);
      }
      else{
        toast.error("Something went wrong. Please try again");
      }

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
                    type={isPasswordVisible ? "text" : "password"}
                    variant="bordered"
                    onValueChange={setPassword}
                    onFocus={() => setPasswordHasBeenFocused(true)}
                    color={!passwordBeenFocused ? "primary" : "success"}
                    errorMessage="Please enter a password"
                    endContent={
                      <button 
                        className="focus:outline-none" 
                        type="button" 
                        onClick={() => {setIsPasswordVisible(!isPasswordVisible)}} 
                        aria-label="toggle password visibility">
                        {isPasswordVisible ? (
                          <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                          <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        )}
                      </button>
                    }
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
                    isDisabled={isUsernameInvalid}
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