"use client"
import "../../app/globals.css"
import React, { useState } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Checkbox, Tooltip} from "@nextui-org/react";
import { createClient } from "./../../utils/supabase/client";

require("dotenv").config();

//interface for the props to DatabaseCredentialsModal

interface DatabaseCredentialsModalProps {

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

    const {isOpen, onOpen, onOpenChange} = useDisclosure();

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

    return (

        <>
        <Button aria-label="add database server button" onPress={onOpen} color="primary">Connect</Button>
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          placement="top-center"
          className="text-black"
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
                    onClick={() => {}}
                    isDisabled={isUsernameInvalid || isPasswordInvalid}
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