"use client"
import "../../app/globals.css"
import React, { useState } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input} from "@nextui-org/react";
import { createClient } from "./../../utils/supabase/client";
import { Query } from "@/interfaces/intermediateJSON";
import reload from "../ContextMenu/ContextMenu"

require("dotenv").config();

//interface for the props to SaveQueryModal

interface SaveQueryModalProps {
  query: Query
}

// This function gets the token from local storage.
// Supabase stores the token in local storage so we can access it from there.
const getToken = async () => {

  const supabase = createClient();
  const token = (await supabase.auth.getSession()).data.session?.access_token

  console.log(token)

  return token;
};

export default function SaveQueryModal(props: SaveQueryModalProps){

    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [queryTitle, setQueryTitle] = useState('');
    const [queryTitleBeenFocused, setQueryTitleHasBeenFocused] = useState(false);

    const isQueryTitleInvalid = React.useMemo(() => {
      if (queryTitle === "") return true;
  
      return false;
    }, [queryTitle]);

    async function saveQuery(queryTitle: String){

      //save the query to the query-management/save-query endpoint
      let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/query-management/save-query`, {
        credentials: "include",
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + await getToken()
        },
        body: JSON.stringify({
          db_id: props.query.databaseServerID,
          parameters: props.query.queryParams,
          queryTitle: queryTitle
        })
      })

      window.location.reload();

    }

    return (

        <>
        <Button onPress={onOpen} color="primary">Save Query</Button>
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          placement="top-center"
          className="text-black"
        >
          <ModalContent>
            {(onClose : any) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Save a query</ModalHeader>
                <ModalBody>
                  <Input
                    isRequired
                    label="Query Name"
                    placeholder="Enter a name to remember your query by"
                    variant="bordered"
                    onValueChange={setQueryTitle}
                    onFocus={() => setQueryTitleHasBeenFocused(true)}
                    isInvalid={isQueryTitleInvalid && queryTitleBeenFocused}
                    color={queryTitleBeenFocused ? "primary" : isQueryTitleInvalid ? "danger" : "success"}
                    errorMessage="Please enter a name for your query"
                  />
                </ModalBody>
                <ModalFooter>
                  <Button 
                    color="primary" 
                    onPress={onClose}  
                    onClick={() => saveQuery(queryTitle)}
                    isDisabled={isQueryTitleInvalid}
                    >
                    Save
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    )

}