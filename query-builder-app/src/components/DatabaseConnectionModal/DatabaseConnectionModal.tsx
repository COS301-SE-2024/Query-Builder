"use client"
import "../../app/globals.css"
import React, { useState } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Checkbox, Tooltip} from "@nextui-org/react";
import { createClient } from "./../../utils/supabase/client";
import jwt from "jsonwebtoken"

require("dotenv").config();

//interface for the props to DatabaseConnectionModal

interface DatabaseConnectionModalProps {
  org_id: String,
  on_add: () => void
}

// This function gets the token from local storage.
// Supabase stores the token in local storage so we can access it from there.
const getToken = async () => {

  const supabase = createClient();
  const token = (await supabase.auth.getSession()).data.session?.access_token

  console.log(token)

  return token;
};

export default function DatabaseConnectionModal(props: DatabaseConnectionModalProps){

    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const [databaseConnectionStatus, setDatabaseConnectionStatus] = useState('Not connected to a database');

    //React hook to store whether the user wants QBee to remember their database credentials or not
    const [rememberDatabaseCredentials, setRememberDatabaseCredentials] = useState(false);

    const [url, setUrl] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [dbName, setDbName] = useState('');

    const [urlHasBeenFocused, setURLHasBeenFocused] = useState(false);
    const [usernameHasBeenFocused, setUsernameHasBeenFocused] = useState(false);
    const [passwordBeenFocused, setPasswordHasBeenFocused] = useState(false);
    const [dbNameBeenFocused, setDbNameHasBeenFocused] = useState(false);

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

    const isDbNameInvalid = React.useMemo(() => {
      if (dbName === "") return true;
  
      return false;
    }, [dbName]);

    async function addDatabase(name: String, host:String, user:String, password:String){

      //log request body
      console.log("BODY OF REQUEST: " + JSON.stringify({
        org_id: props.org_id,
        name: name,
        type: "mysql",
        host: host
      }))

      //call the add-db API endpoint
      let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/add-db`, {
        credentials: "include",
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + await getToken()
        },
        body: JSON.stringify({
            org_id: props.org_id,
            name: name,
            type: "mysql",
            host: host
        })
      })

      //log response body
      let addDBResponse = await response.json();
      console.log("ADD DB RESPONSE " + JSON.stringify(addDBResponse));

      //call the on_add callback so parent component can refetch the modified databases
      props.on_add();

      //if rememberDatabaseCredentials is set, save the db_secrets
      //change this later - for now always save
      if(true){

        //create a db_secrets object
        const db_secrets = {
          user: user,
          password: password
        }

        //stringify the db_secrets
        const db_secrets_string = JSON.stringify(db_secrets);   

        //log request body
        console.log("BODY OF REQUEST: " + JSON.stringify({
          db_id: addDBResponse.data[0].db_id,
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
              db_id: addDBResponse.data[0].db_id,
              db_secrets: db_secrets_string
          })
        })

        //log response body
        let json = await response.json();
        console.log("ADD DB RESPONSE " + JSON.stringify(json));

      }

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
                <ModalHeader className="flex flex-col gap-1">Connect a new database server</ModalHeader>
                <ModalBody>
                  <Input
                    isRequired
                    label="Database Server Name"
                    placeholder="Enter a name to remember your database server by"
                    variant="bordered"
                    onValueChange={setDbName}
                    onFocus={() => setDbNameHasBeenFocused(true)}
                    isInvalid={isDbNameInvalid && dbNameBeenFocused}
                    color={!dbNameBeenFocused ? "primary" : isDbNameInvalid ? "danger" : "success"}
                    errorMessage="Please enter a name for your database server"
                  />
                  <Input
                    isRequired
                    label="URL or Host"
                    placeholder="Enter the database server URL or Host"
                    variant="bordered"
                    onValueChange={setUrl}
                    onFocus={() => setURLHasBeenFocused(true)}
                    isInvalid={isURLInvalid && urlHasBeenFocused}
                    color={!urlHasBeenFocused ? "primary" : isURLInvalid ? "danger" : "success"}
                    errorMessage="Please enter a valid database server URL or Host"
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
                    color="primary" 
                    onPress={onClose}  
                    onClick={() => addDatabase(dbName, url, username, password)}
                    isDisabled={isURLInvalid || isUsernameInvalid || isPasswordInvalid || isDbNameInvalid}
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