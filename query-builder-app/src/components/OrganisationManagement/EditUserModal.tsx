"use client"
import "../../app/globals.css"
import React, { useState, useEffect } from "react";
import {Modal, ModalContent, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Checkbox, Tooltip} from "@nextui-org/react";
import { createClient } from "./../../utils/supabase/client";
import {EditIcon} from "./EditIcon";
import { resolve } from "path";

interface EditUserModalProps {
    org_id: String,
    user_id: String,
    on_add: () => void
}

interface updateRole {
    org_id: String
    user_id: String
    user_role: String,
    role_permissions?:{
        add_dbs?: boolean;
        update_dbs?: boolean;
        remove_dbs?: boolean;
        invite_users?: boolean;
        remove_users?: boolean;
        update_user_roles?: boolean;
        view_all_dbs?: boolean;
        view_all_users?: boolean;
        update_db_access?: boolean;
    }
}

interface Role {
  role: string;
}

const getToken = async () => {
    const supabase = createClient();
    const token = (await supabase.auth.getSession()).data.session?.access_token
  
    // console.log(token)
  
    return token;
};

export default function EditUserModal(props: EditUserModalProps){

    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const [roles, setRoles] = useState<Role[]>([]);
    const orgId = props.org_id;
    const userId = props.user_id;

    // set roles
    useEffect(() => {
      setRoles([{role: "Admin"}, {role: "Member"}]);
    }, []);

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

    const updateRole = async () => {

      if((selectedRoleValue != "member") && (selectedRoleValue != "admin")) {
        // console.log("error");
        return;
      }

      let updatedDetails:updateRole = {
        org_id: orgId,
        user_id: userId,
        user_role: selectedRoleValue
      };

      // console.log(updatedDetails);

      let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/update-member`, {
          method: "PATCH",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken()
          },
          body: JSON.stringify(updatedDetails)
      })
      // console.log(response);
      props.on_add();
    }

    const isRoleInvalid = React.useMemo(() => {
      if ((selectedRoleValue === "") || (selectedRoleValue != "admin" && selectedRoleValue != "member")) return true;
  
      return false;
    }, [selectedRoleValue]);

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
                <ModalHeader className="flex flex-col gap-1">Edit the member</ModalHeader>
                <ModalBody>
                    <Dropdown className="text-black">
                        <DropdownTrigger>
                            <Button 
                            variant="bordered" 
                            className="capitalize"
                            data-testid="roleDropdown"
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
                                key={item.role.toLowerCase()}
                                data-testid={item.role.toLowerCase() + 'Role'}
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
                    // onPress={() => onClose}  
                    onClick={() => {onClose(); updateRole();}}
                    isDisabled={isRoleInvalid}
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