"use client"
import React from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Checkbox, Input, Link} from "@nextui-org/react";

export default function DatabaseConnectionModal(){

    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    return (

        <>
        <Button onPress={onOpen} color="primary">Open Modal</Button>
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          placement="top-center"
        >
          <ModalContent>
            {(onClose : any) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Connect to a database</ModalHeader>
                <ModalBody>
                  <Input
                    autoFocus
                    label="URL"
                    placeholder="Enter the database URL"
                    variant="bordered"
                  />
                  <Input
                    autoFocus
                    label="Username"
                    placeholder="Enter your username"
                    variant="bordered"
                  />
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    variant="bordered"
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" onPress={onClose}>
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