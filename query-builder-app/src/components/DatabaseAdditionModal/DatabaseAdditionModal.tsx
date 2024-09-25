"use client"
import "../../app/globals.css"
import React, { useState } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Checkbox, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Spacer} from "@nextui-org/react";
import { createClient } from "../../utils/supabase/client";

require("dotenv").config();

//map of database vendors to their default ports
const portMap = new Map<string, string>([
  ["mysql", "3306"],
  ["postgresql", "5432"]
]);

//interface for the props to DatabaseAdditionModal
interface DatabaseAdditionModalProps {
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

export default function DatabaseAdditionModal(props: DatabaseAdditionModalProps){

    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const [dbName, setDbName] = useState('');
    const [type, setType] = useState('mysql');
    const [url, setUrl] = useState('');
    const [port, setPort] = useState('3306');

    const [dbNameBeenFocused, setDbNameHasBeenFocused] = useState(false);
    const [urlHasBeenFocused, setURLHasBeenFocused] = useState(false);
    const [portHasBeenFocused, setPortHasBeenFocused] = useState(false);

    //form validation
    const validateURL = (value: string) => value.match(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$|(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i);

    const isDbNameInvalid = React.useMemo(() => {
      if (dbName === "") return true;
  
      return false;
    }, [dbName]);

    const isURLInvalid = React.useMemo(() => {
      if (url === "") return true;
  
      return validateURL(url) ? false : true;
    }, [url]);

    const isPortInvalid = React.useMemo(() => {
      if (port === "") return true;

      const portNumber = Number(port);

      if (isNaN(portNumber)){
        return true;
      }else{
        return (portNumber < 0 || portNumber > 65535);
      }

    }, [port]);

    async function addDatabase(name: string, type: string, host:string, port: number){

      //log request body
      console.log("BODY OF REQUEST: " + JSON.stringify({
        org_id: props.org_id,
        name: name,
        type: type,
        host: host,
        port: port
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
            type: type,
            host: host,
            port: port
        })
      })

      //log response body
      let addDBResponse = await response.json();
      console.log("ADD DB RESPONSE " + JSON.stringify(addDBResponse));

      //call the on_add callback so parent component can refetch the modified databases
      props.on_add();

    }

    return (

        <>
        <Button onPress={onOpen} color="primary" className="text-md">+ Add</Button>
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          placement="top-center"
          className="text-black"
        >
          <ModalContent>
            {(onClose : any) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Add a new database server to your organisation</ModalHeader>
                <ModalBody>
                  <h3>Database Vendor:</h3>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                      >
                        {type}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      disallowEmptySelection
                      selectionMode="single"
                      selectedKeys={type}
                      onSelectionChange={(keys) => {
                        const key = Array.from(keys)[0];
                        setPort(portMap.get(key.toString())!);
                        setType(key.toString());
                      }}
                    >
                      <DropdownItem key="mysql">mysql</DropdownItem>
                      <DropdownItem key="postgresql">postgresql</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  <Spacer y={0.5}></Spacer>
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
                    label="Port (Default autofills)"
                    placeholder="Enter the database server port number"
                    variant="bordered"
                    value={port}
                    onValueChange={setPort}
                    onFocus={() => setPortHasBeenFocused(true)}
                    isInvalid={isPortInvalid && portHasBeenFocused}
                    color={!portHasBeenFocused ? "primary" : isPortInvalid ? "danger" : "success"}
                    errorMessage="Please enter a valid database server port number"
                  />
                </ModalBody>
                <ModalFooter>
                  <Button 
                    color="primary" 
                    onPress={onClose}  
                    onClick={() => addDatabase(dbName, type, url, parseInt(port))}
                    isDisabled={isURLInvalid || isDbNameInvalid}
                    >
                    Add
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    )

}