"use client"
import "../../app/globals.css"
import React, { useState, useEffect } from "react";
import {Modal, ModalContent, Textarea, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Checkbox, Tooltip} from "@nextui-org/react";
import { createClient } from "../../utils/supabase/client";
// import {EditDescriptionMetaData} from "./EditDescriptionMetaData";
import toast from "react-hot-toast";

const getToken = async () => {
    const supabase = createClient();
    const token = (await supabase.auth.getSession()).data.session?.access_token
  
    console.log(token)
  
    return token;
};


interface MetaDataHandlerProps {
    org_id: String,
    db_id: String,
    language: String,
    on_add: () => void
}

export default function MetaDataHandler(props: MetaDataHandlerProps){

    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const orgId = props.org_id;
    const dbID = props.db_id;

    async function getMetaData(org_id: string, db_id: string) {
        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/query-management/share-query`, {
            credentials: "include",
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify({ })
        });
    
        if (!response.ok) {
            // throw new Error(`HTTP error! Status: ${response.status}`);
            toast.error("Error retrieving metadata. Please try again later.");
        }
    
        let json = (await response.json()).data;
        return response;
    }

    return (

        <>
        {/* <label  className="custom-file-upload bg-white p-1 border-2 border-slate-600 rounded-full">
        </label> */}
        {/* <div>
          <EditIcon data-testid="editUserIcon" onClick={onOpen}/>                              
        </div> */}
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          placement="top-center"
          className="text-black"
          aria-label="editUserModal"
        >
          <ModalContent>
            {(onClose : any) => (
              <>
                <ModalHeader className="flex justify-between items-center">
                    <h2 className="font-semibold">Edit metadata for the database server</h2>
                </ModalHeader>
                <ModalBody>
                    
                </ModalBody>
                <ModalFooter>
                  <Button 
                    color="primary" 
                    // onPress={() => onClose}  
                    onClick={() => {onClose();}}
                    data-testid="updateRoleButton" 
                    >
                    Update
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    )

}