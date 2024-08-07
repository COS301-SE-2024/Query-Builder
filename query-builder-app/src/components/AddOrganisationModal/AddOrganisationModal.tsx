"use client"
import "../../app/globals.css"
import React, { useState } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Checkbox, Tooltip} from "@nextui-org/react";
import { createClient } from "./../../utils/supabase/client";
import jwt from "jsonwebtoken"

require("dotenv").config();

//interface for the props to AddOrganisationModal

interface AddOrganisationModalProps {
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

export default function AddOrganisationModal(props: AddOrganisationModalProps){

    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [orgName, setOrgName] = useState('');
    const [orgNameBeenFocused, setOrgNameHasBeenFocused] = useState(false);

    const isOrgNameInvalid = React.useMemo(() => {
      if (orgName === "") return true;
  
      return false;
    }, [orgName]);

    async function addOrganisation(name: String){

      //call the create-org API endpoint
      let response = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/create-org`, {
        credentials: "include",
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + await getToken()
        },
        body: JSON.stringify({
            name: name,
        })
      })

      let json = await response.json();

      console.log("CREATE ORG RESPONSE " + JSON.stringify(json));

      props.on_add();

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
                <ModalHeader className="flex flex-col gap-1">Add a new organisation</ModalHeader>
                <ModalBody>
                  <Input
                    isRequired
                    label="Organisation Name"
                    placeholder="Enter a name for your organisation"
                    variant="bordered"
                    onValueChange={setOrgName}
                    onFocus={() => setOrgNameHasBeenFocused(true)}
                    isInvalid={isOrgNameInvalid && orgNameBeenFocused}
                    color={orgNameBeenFocused ? "primary" : isOrgNameInvalid ? "danger" : "success"}
                    errorMessage="Please enter a name for your organisation"
                  />
                </ModalBody>
                <ModalFooter>
                  <Button 
                    color="primary" 
                    onPress={onClose}  
                    onClick={() => addOrganisation(orgName)}
                    isDisabled={isOrgNameInvalid}
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