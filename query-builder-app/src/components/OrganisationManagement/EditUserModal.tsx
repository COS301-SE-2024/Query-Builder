"use client"
import "../../app/globals.css"
import React, { useState } from "react";
import {Modal, ModalContent, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Checkbox, Tooltip} from "@nextui-org/react";
import { createClient } from "./../../utils/supabase/client";
import {EditIcon} from "./EditIcon";

interface EditUserModalProps {
    org_id: String,
    on_add: () => void
}

interface Role {
    role: string,
}

const getToken = async () => {

    const supabase = createClient();
    const token = (await supabase.auth.getSession()).data.session?.access_token
  
    console.log(token)
  
    return token;
};

export default function EditUserModal(props: EditUserModalProps){

    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const [roles, setRoles] = useState<Role[]>([{role: "Admin"}]);

    // set roles
    setRoles([{role: "Admin"}, {role: "Member"}]);

    const [selectedRole, setSelectedRole] = useState(new Set(["Select a role"]));
    const selectedRoleValue = React.useMemo(
        () => Array.from(selectedRole).join(", "),
        [selectedRole]
    );

    const handleRoleSelection = (keys:any) => {
        if (keys.size === 0) {
            setSelectedRole(new Set(["Select a role"])); // Reset to default
        } else {
            setSelectedRole(keys);
        }
    };

    return (

        <>
        <Button onPress={onOpen} color="primary"><EditIcon/></Button>
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          placement="top-center"
          className="text-black"
        >
          <ModalContent>
            {(onClose : any) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Edit the member</ModalHeader>
                <ModalBody>
                    <Dropdown className="text-black">
                        <DropdownTrigger>
                            <Button 
                            variant="bordered" 
                            className="capitalize"
                            >
                            {selectedRoleValue}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu 
                            className="max-h-[50vh] overflow-y-auto"
                            aria-label="Dynamic Actions" 
                            items={roles} 
                            variant="flat"
                            selectionMode="single"
                            selectedKeys={selectedRole}
                            onSelectionChange={handleRoleSelection}
                        >
                            {(item:any) => (
                            <DropdownItem
                                key={item.role}
                            >
                                {item.role}
                            </DropdownItem>
                            )}
                        </DropdownMenu>
                    </Dropdown>
                </ModalBody>
                <ModalFooter>
                  <Button 
                    color="primary" 
                    onPress={onClose}  
                    // onClick={() => addDatabase(dbName, url, username, password)}
                    // isDisabled={isURLInvalid || isUsernameInvalid || isPasswordInvalid || isDbNameInvalid}
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