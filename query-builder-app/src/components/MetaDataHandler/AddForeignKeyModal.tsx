"use client"
import "../../app/globals.css"
import React, { useState } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Card, CardBody, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem} from "@nextui-org/react";
import { createClient } from "../../utils/supabase/client";

//--------------------------------INTERFACES--------------------------------//

interface Table {
    table_name: string,
}

interface Column {
    name: string
}

interface AddForeignKeyModalProps {
    allTables: Table[]
    fromTable: string,
    databaseServerID: string,
    database: string,
    language: string
    onAdd: (fromTable: string, fromColumn: string, toTable: string, toColumn: string) => {}
}

export default function AddForeignKeyModal(props: AddForeignKeyModalProps){

    //--------------------------------REACT HOOKS--------------------------------//

    //the disclosure to control opening and closing the modal
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    //the column in the fromTable that the foreign key points from
    const [fromColumn, setFromColumn] = useState("");

    //the table that the foreign key points to
    const [toTable, setToTable] = useState("");

    //the column in the toTable that the foreign key points to
    const [toColumn, setToColumn] = useState("");

    //the list of possible fromColumns
    const [fromColumns, setFromColumns] = useState<Column[]>([]);

    //the list of possible toColumns
    const [toColumns, setToColumns] = useState<Column[]>([]);

    //fetch new fromColumns when fromTable changes and clear fromColumn, toTable and toColumn
    React.useEffect(() => {

        fetchColumns("from", props.fromTable);
        setFromColumn("");
        setToTable("");
        setToColumn("");

    },[props.fromTable])

    //fetch new toColumns when toTable changes
    React.useEffect(() => {

        if(toTable !== ""){
            fetchColumns("to", toTable);
            setToColumn("");
        }

    },[toTable])

    //------------------------------HELPER FUNCTIONS------------------------------//

    const getToken = async () => {
        const supabase = createClient();
        const token = (await supabase.auth.getSession()).data.session?.access_token
      
        // console.log(token)
      
        return token;
    };

    async function fetchColumns(direction: "from" | "to", table: string){

        if(direction === "from"){
            setFromColumns([]);
        }else{
            setToColumns([]);
        }

        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/fields`, {
            credentials: "include",
            method: "PUT",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify({
                databaseServerID: props.databaseServerID,
                database: props.database,
                table: table,
                language: props.language
            })
        });

        let json = await response.json();

        if(response.ok){
            if(direction === "from"){
                setFromColumns(json.data);
            }
            else{
                setToColumns(json.data);
            }
        }

    }

    return (

        <>
        {/* <label  className="custom-file-upload bg-white p-1 border-2 border-slate-600 rounded-full">
        </label> */}
        <div>
          <Button variant="bordered" onClick={onOpen}>
              +
          </Button>                            
        </div>
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          placement="top-center"
          className="text-black"
          aria-label="addForeignKeyModal"
        >
          <ModalContent>
            {(onClose : any) => (
              <>
                <ModalHeader className="flex justify-between items-center">
                    <h2 className="font-semibold">Add new foreign key</h2>
                </ModalHeader>
                <ModalBody>
                    {/*----------------------fromTable----------------------*/}
                    <h2>From table</h2>
                    <Card className="overflow-visible">
                        <CardBody className="flex flex-row items-center space-x-2">
                            {props.fromTable}
                        </CardBody>
                    </Card>
                    {/*----------------------fromColumn----------------------*/}
                    <h2>From column</h2>
                    <Card className="overflow-visible">
                        <CardBody className="flex flex-row items-center space-x-2">
                            <div className="flex flex-1">
                                {fromColumn}
                            </div>
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button
                                        variant="bordered"
                                        aria-label="choose fromColumn button"
                                    >
                                        {fromColumn !== ""? "Change":"+"}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    className="max-h-[50vh] overflow-y-auto"
                                    items={fromColumns}
                                    emptyContent="Loading columns..."
                                    onAction={(key) => setFromColumn(key as string)}
                                >
                                    {(item: any) => (
                                        <DropdownItem key={item.name}>
                                            {item.name}
                                        </DropdownItem>
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        </CardBody>
                    </Card>
                    {/*-----------------------toTable-----------------------*/}
                    <h2>To table</h2>
                    <Card className="overflow-visible">
                        <CardBody className="flex flex-row items-center space-x-2">
                            <div className="flex flex-1">
                                {toTable}
                            </div>
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button
                                        variant="bordered"
                                        aria-label="choose toTable button"
                                    >
                                        {toTable !== ""? "Change":"+"}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    className="max-h-[50vh] overflow-y-auto"
                                    items={props.allTables}
                                    emptyContent="Loading tables..."
                                    onAction={(key) => setToTable(key as string)}
                                >
                                    {(item: any) => (
                                        <DropdownItem key={item.table_name}>
                                            {item.table_name}
                                        </DropdownItem>
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        </CardBody>
                    </Card>
                    {/*----------------------toColumn-----------------------*/}
                    <h2>To column</h2>
                    <Card className="overflow-visible">
                        <CardBody className="flex flex-row items-center space-x-2">
                            <div className="flex flex-1">
                                {toColumn}
                            </div>
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button
                                        variant="bordered"
                                        aria-label="choose toColumn button"
                                    >
                                        {toColumn !== ""? "Change":"+"}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    className="max-h-[50vh] overflow-y-auto"
                                    items={toColumns}
                                    emptyContent="Loading columns..."
                                    onAction={(key) => setToColumn(key as string)}
                                >
                                    {(item: any) => (
                                        <DropdownItem key={item.name}>
                                            {item.name}
                                        </DropdownItem>
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        </CardBody>
                    </Card>
                </ModalBody>
                <ModalFooter>
                {props.fromTable !== "" && fromColumn !== "" && toTable !== "" && toColumn !== "" && (
                    <Button 
                        color="primary"  
                        onClick={() => {
                        props.onAdd(props.fromTable, fromColumn, toTable, toColumn);
                        onClose();}}
                        data-testid="updateDescriptionButton" 
                        >
                        Add
                    </Button>
                )}
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    )

}