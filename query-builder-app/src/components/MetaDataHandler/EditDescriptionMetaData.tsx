"use client"
import "../../app/globals.css"
import React, { useState, useEffect } from "react";
import {Modal, ModalContent, Textarea, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Checkbox, Tooltip} from "@nextui-org/react";
import { createClient } from "../../utils/supabase/client";
import {EditIcon} from "../OrganisationManagement/EditIcon";
import toast from "react-hot-toast";

interface EditDescriptionMetaDataProps {
    description: string;
    type: String,
    on_add: (description:string) => void
}

export default function EditDescriptionMetaData(props: EditDescriptionMetaDataProps){

    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const [metaDataDescription, setMetaDataDescription] = useState("");

    return (

        <>
        {/* <label  className="custom-file-upload bg-white p-1 border-2 border-slate-600 rounded-full">
        </label> */}
        <div>
          <Button variant="bordered" color="primary" onClick={onOpen}>
              Edit
          </Button>                            
        </div>
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          placement="top-center"
          className="text-black"
          aria-label="editMetaDataDescriptionModal"
        >
          <ModalContent>
            {(onClose : any) => (
              <>
                <ModalHeader className="flex justify-between items-center">
                    <h2 className="font-semibold">Edit the description of {props.type}</h2>
                </ModalHeader>
                <ModalBody>
                    <div className="mt-4">
                        <h3 className="text-md font-medium mb-2">Enter New Description</h3>
                        <Textarea
                            placeholder={(props.description == "") ? "Add a new description for this query": props.description}
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
                    onClick={() => {
                      props.on_add(metaDataDescription);
                      onClose();}}
                    data-testid="updateDescriptionButton" 
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
