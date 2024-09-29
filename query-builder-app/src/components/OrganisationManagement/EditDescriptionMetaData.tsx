"use client"
import "../../app/globals.css"
import React, { useState, useEffect } from "react";
import {Modal, ModalContent, Textarea, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Checkbox, Tooltip} from "@nextui-org/react";
import { createClient } from "./../../utils/supabase/client";
import {EditIcon} from "./EditIcon";
import toast from "react-hot-toast";

const getToken = async () => {
    const supabase = createClient();
    const token = (await supabase.auth.getSession()).data.session?.access_token
  
    console.log(token)
  
    return token;
};

interface EditDescriptionMetaDataProps {
    org_id: String,
    db_id: String,
    type: String,
    on_add: () => void
}

export default function EditDescriptionMetaData(props: EditDescriptionMetaDataProps){

    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const orgId = props.org_id;
    const dbID = props.db_id;

    const [metaDataDescription, setMetaDataDescription] = useState("");

    async function updateMetaData(org_id: string, db_id: string) {
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
            toast.error("Error updating metadata. Please try again later.");
        }
        else {
            toast.success("Metadata updated successfully!");
        }
    
        let json = (await response.json()).data;
        return response;
    }

    return (

        <>
        {/* <label  className="custom-file-upload bg-white p-1 border-2 border-slate-600 rounded-full">
        </label> */}
        <div>
          <EditIcon data-testid="editUserIcon" onClick={onOpen}/>                              
        </div>
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
                    <h2 className="font-semibold">Edit {props.type}</h2>
                </ModalHeader>
                <ModalBody>
                    <div className="mt-4">
                        <h3 className="text-md font-medium mb-2">Enter New Description</h3>
                        <Textarea
                            placeholder="Add a new description for this query"
                            className="w-full"
                            minRows={3}
                            maxRows={5}
                            maxLength={190} // Limit the number of characters
                            onChange={(e) => {
                                if (e.target.value.length <= 190) {
                                    setMetaDataDescription(e.target.value);
                                }
                            }}
                        />
                    </div>
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
