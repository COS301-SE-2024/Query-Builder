"use client"
import "../../app/globals.css"
import React, { useState } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Checkbox, Tooltip} from "@nextui-org/react";
import { createClient } from "./../../utils/supabase/client";
import toast from 'react-hot-toast';
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

  // console.log(token)

  return token;
};

export default function AddOrganisationModal(props: AddOrganisationModalProps){

    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [orgName, setOrgName] = useState('');
    const [orgNameBeenFocused, setOrgNameHasBeenFocused] = useState(false);
    const [orgHash, setOrgHash] = useState('');
    const [orgHashBeenFocused, setOrgHashHasBeenFocused] = useState(false);

    const isOrgNameInvalid = React.useMemo(() => {
      if (orgName === "") return true;
  
      return false;
    }, [orgName]);

    const isOrgHashInvalid = React.useMemo(() => {
      if (orgHash === "") return true;
  
      return false;
    }, [orgHash]);

    async function addOrganisation(name: String){

      //call the create-org API endpoint
      let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/create-org`, {
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

      // console.log("CREATE ORG RESPONSE " + JSON.stringify(json));

      props.on_add();

    }

    async function joinOrganisation(hashCode: String){
      setOrgHashHasBeenFocused(false);
      setOrgNameHasBeenFocused(false);
      toast.promise(
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/join-org`, {
          credentials: "include",
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken()
          },
          body: JSON.stringify({
              hash: hashCode,
          }) 
        })
        .then(async (response) => {
          const data = await response.json();
    
          // Check the actual HTTP status code
          if (!response.ok) {
            // If status is not 2xx, throw an error
            throw new Error(data.response?.message || "Failed to join the organization");
          }
          return data;
        })
        .then(() => {
          // Reload the page after success
          window.location.reload();
        }),
        // .then((response) => response.json())
        // .then((data) => {
        //   if (data.statusCode !== 200 && data.statusCode !== 201) { // Check statusCode after resolving JSON
        //     console.log("JOIN ORG RESPONSE EROR" + data.statusCode);

        //     throw new Error(data.response.message || "Failed to join the organization");
        //   }
        // })
        
         {
           loading: 'Joining...',
           success: 'Successfully joined!',
           error: (err) => `${err || "Unexpected error while joining, please try again!"}`,
         }
       );
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
                <ModalHeader className="flex flex-col gap-1">Add a new organisation</ModalHeader>
                <ModalBody>
                  <Input
                    isRequired
                    label="Organisation Name"
                    placeholder="Enter a name for your organisation"
                    variant="bordered"
                    onValueChange={setOrgName}
                    onFocus={() => {setOrgNameHasBeenFocused(true); setOrgHashHasBeenFocused(false);}}
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
                    aria-label="add new organisation button"
                    >
                    Add
                  </Button>
                </ModalFooter>

                <ModalHeader className="flex flex-col gap-1">Join an existing organisation</ModalHeader>
                <ModalBody>
                  <Input
                    isRequired
                    label="Organisation Join Code"
                    placeholder="Enter a join code for the organisation you want to join"
                    variant="bordered"
                    onValueChange={setOrgHash}
                    onFocus={() => {setOrgNameHasBeenFocused(false); setOrgHashHasBeenFocused(true);}}
                    isInvalid={isOrgHashInvalid && orgHashBeenFocused}
                    color={orgHashBeenFocused ? "primary" : isOrgHashInvalid ? "danger" : "success"}
                    errorMessage="Please enter a valid join code for your organisation"
                  />
                </ModalBody>
                <ModalFooter>
                  <Button 
                    color="primary" 
                    // onPress={onClose}  
                    onClick={() => joinOrganisation(orgHash)}
                    isDisabled={isOrgHashInvalid}
                    >
                    Join
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    )

}