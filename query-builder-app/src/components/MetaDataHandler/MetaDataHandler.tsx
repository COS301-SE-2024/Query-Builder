"use client"
import "../../app/globals.css"
import { table } from "../../interfaces/intermediateJSON"
import React, { useState, useEffect } from "react";
import {Modal, ModalContent, Card, CardBody, Spacer, Textarea, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Tooltip,   Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,} from "@nextui-org/react";
import { createClient } from "../../utils/supabase/client";
import { navigateToAuth } from '../../app/authentication/actions';
import EditDescriptionMetaData from "./EditDescriptionMetaData";
import {EditIcon} from "../OrganisationManagement/EditIcon";
import toast from "react-hot-toast";
import DatabaseCredentialsModal from "../DatabaseCredentialsModal/DatabaseCredentialsModal";
import AddForeignKeyModal from "./AddForeignKeyModal";


const getToken = async () => {
    const supabase = createClient();
    const token = (await supabase.auth.getSession()).data.session?.access_token
  
    // console.log(token)
  
    return token;
};


interface MetaDataHandlerProps {
    org_id: string,
    db_id: string,
    on_add: () => void
}

interface Database {
    database: string;
}

interface FieldMetaData{
    column_name: string;
    description?: string;
}

interface ForeignKeyMetadata{
  table_name: string;
  column_name: string;
  referenced_column_name: string;
}

interface ReferForeignKeyMetadata extends ForeignKeyMetadata {
  referenced_table_schema: string;
}

interface OriginForeignKeyMetadata extends ForeignKeyMetadata {
  table_schema: string;
}

interface TableMetadata{
  table_name: string;
  description?: string;
  fields?: FieldMetaData[];
  foreign_keys?: ForeignKeyMetadata[];
}
interface DBMetadata {
    schema_name: string;
    description?: string;
    tables?: TableMetadata[];
}
interface Metadata{
    databaseServerID: string;
    language: string;
    org_id?: string;
    db_metadata: DBMetadata;
}

interface JoinableTable {
    table_name: string,
    qbee_id: number,
    referenced_column_name: string,
    column_name: string,
    //present in from
    referenced_table_schema?: string,
    //present in to
    table_schema?: string
}

export default function MetaDataHandler(props: MetaDataHandlerProps){

    const {isOpen: ismetadataModalOpen, onOpen: onmetadataModalOpen, onOpenChange: onmetadataModalOpenChange} = useDisclosure();
    const orgId = props.org_id;
    const dbID = props.db_id;

    const [databases, setDatabases] = useState<Database[]>([]);
    const [databaseLanguage, setDatabaseLanguage] = useState("");
    const credentialsModalDisclosure = useDisclosure();
    const [databaseName, setDatabaseName] = useState("");
    const [table, setTable] = useState<table>({name:"", columns:[]});
    const [fields, setFields] = useState<FieldMetaData[]>([]);
    const [selectedField, setSelectedField] = useState<FieldMetaData>({column_name:"", description:""});
    const [joinableTables, setJoinableTables] = useState<JoinableTable[]>([]);
    const [metaData, setMetaData] = useState<Metadata>();
    const [foreignKey, setForeignKey] = useState<ReferForeignKeyMetadata>();

    //---------------------------------------FETCH ALL DATABASES---------------------------------------//

    // Fetch databases in your server
    async function fetchDatabases() {
            //determine whether the user has db secrets saved for the database server
            setDatabaseName("");
            setTable({name:"", columns:[]});
            setSelectedField({column_name:"", description:""});
            let hasActiveConnectionResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/has-active-connection`, {
                credentials: "include",
                method: "POST",
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await getToken()
                },
                body: JSON.stringify({
                    databaseServerID: dbID
                })
            });
        
            const hasActiveConnection = (await hasActiveConnectionResponse.json()).hasActiveConnection;
            
        
            //if the user has an active connection to the database server, navigate straight to the form
            if(hasActiveConnection === true){
                await fetchHelper();
            }
            else{
                //determine whether the user has db secrets saved for the database server
                let dbSecretsSavedResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/has-saved-db-credentials`, {
                    credentials: "include",
                    method: "POST",
                    headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + await getToken()
                    },
                    body: JSON.stringify({
                        db_id: dbID
                    })
                });
        
                const dbSecretsSaved = (await dbSecretsSavedResponse.json()).saved_db_credentials;
                
                
                //if the user doesn't have db credentials saved for that database, then prompt them for their credentials
                if(dbSecretsSaved === false){
                    credentialsModalDisclosure.onOpen();
                }
                else{
                    // console.log("here");
        
                    //attempt a connection to the database, using saved credentials
                    //call the api/connect endpoint, and exclude databaseServerCredentials
                    let connectionResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connect`, {
                        credentials: "include",
                        method: "PUT",
                        headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + await getToken()
                        },
                        body: JSON.stringify({
                            databaseServerID: dbID
                        })
                    });
        
                    let json = await connectionResponse.json();

        
                    //if connection was successful, navigate to the form
                    if(connectionResponse.ok === true && json.success === true){
                        toast.success("connected");
                        await fetchHelper();
                    }
                    //if the connection was not successful, display an appropriate error message
                    else if(connectionResponse.ok === false && json.response && json.response.message){
                        toast.error(json.response.message);
                        return;
                    }
                    else{
                        toast.error("Something went wrong. Please try again");
                        return;
                    }
        
                }
        
            }
        //first get the database type
    }

    async function fetchHelper(){
            let typeResponse = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/get-db-type`,
                {
                  credentials: 'include',
                  method: 'PUT',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + (await getToken()),
                  },
                  body: JSON.stringify({
                    db_id: dbID,
                  }),
                },
              );
          
              if(typeResponse.ok){
          
                const languageType = (await typeResponse.json()).type;
          
                setDatabaseLanguage(languageType);
          
                let response = await fetch(
                  `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/databases`,
                  {
                    credentials: 'include',
                    method: 'PUT',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                      Authorization: 'Bearer ' + (await getToken()),
                    },
                    body: JSON.stringify({
                      databaseServerID: dbID,
                      language: languageType
                    }),
                  },
                );
            
                let json = await response.json();
                // console.log(json);
            
                if(response.ok){
            
                    //set the databases hook
                    setDatabases(json.data);
                    onmetadataModalOpen();
                }
                else{
                    
                    if(json.response && json.response.message == 'You do not have a backend session'){
                        navigateToAuth();
                    }
            
                }
          
            }
    }

    //---------------------------------------FETCH ALL TABLES---------------------------------------//

    async function fetchAllTables(database: string) {

        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/tables`, {
            credentials: "include",
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify({
                databaseServerID: dbID,
                database: database,
                language: databaseLanguage
            })
        });
        
        if (!response) {
            return;
        }
        
        let json = await response.json();
        

        if (response.ok) {
            //set the tables hook
            setJoinableTables(json);
        }
        else{
        
            if(json.response && json.response.message == 'You do not have a backend session'){
                navigateToAuth();
            }
            //or they might have a backend session, but need to reconnect to a new postgres database
            else if(json.response && json.response.message == 'You do not have saved credentials for this database'){
                credentialsModalDisclosure.onOpen();
            }

        }

    }

    async function fetchAllColumns(database: string, tableName: string) {

        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/fields`, {
            credentials: "include",
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify({
                databaseServerID: dbID,
                database: database,
                language: databaseLanguage,
                table: tableName
            })
        });
        
        if (!response) {
            toast.error("Failed to fetch columns of the database");
            return;
        }
        
        let json = await response.json();
        

        if (response.ok) {
            //set the fields hook
            console.log(json.data);
            setFields(json.data);
        }
        else{
        
            if(json.response && json.response.message == 'You do not have a backend session'){
                navigateToAuth();
            }
            //or they might have a backend session, but need to reconnect to a new postgres database
            else if(json.response && json.response.message == 'You do not have saved credentials for this database'){
                credentialsModalDisclosure.onOpen();
            }

        }

    }

    function handleTableSelection(key: any, table: table) {

        //if table.name is empty, add the key as the name
        setTable((previousTableState) => {return { ...previousTableState, name: key }});
        setSelectedField({column_name:"", description:""});
        fetchAllColumns(databaseName, key);


    }

    function handleColumnSelection(key: any, selectedField: FieldMetaData) {

        //if table.name is empty, add the key as the name
        setSelectedField((previousFieldState) => {return { ...previousFieldState, column_name: key }});
        // fetchAllColumns(databaseName, key);

    }

    const handleDatabaseSelection = (key: any) => {

        setDatabaseName(key);
        setTable({name:"", columns:[]});
        fetchAllTables(key);

    };

    //Saving Database Description
    async function updateDatabaseDescription(description: string) {
        if(databaseName == ""){
            toast.error("Please select a database");
            return;
        }
        if(description == ""){
            toast.error("Please enter a description for the table."); 
            return;
        }
        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/save-db-metadata`, {
            credentials: "include",
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify({ 
                databaseServerID: dbID,
                language: databaseLanguage,
                org_id: orgId,
                db_metadata: {
                    schema_name: databaseName,
                    description: description
                }
            })
        });
    
        if (!response.ok) {
            // throw new Error(`HTTP error! Status: ${response.status}`);
            toast.error("Error updating database description. Please try again later.");
        }
        else {
            toast.success("Successfully updated database description.");
        }
    }

    //Saving Table Description
    async function updateTableDescription(description: string) {
        if(table.name == ""){
            toast.error("Please select a table");
            return;
        }
        if(description == ""){
            toast.error("Please enter a description for the table."); 
            return;
        }

        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/save-db-metadata`, {
            credentials: "include",
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify({ 
                databaseServerID: dbID,
                language: databaseLanguage,
                org_id: orgId,
                db_metadata: {
                    schema_name: databaseName,
                    tables:[
                        {
                            table_name: table.name,
                            description: description,
                        }
                    ]
                    
                }
            })
        });
    
        if (!response.ok) {
            // throw new Error(`HTTP error! Status: ${response.status}`);
            toast.error("Error updating table description. Please try again later.");
        }
        else {
            toast.success("Successfully updated table description.");
        }
    }

    //Saving foreign key that refers from fromTable to some other toTable
    //from the perspective 'from' table_name, it is a 'from' foreign key
    //so it has referenced_table_schema
    //column_name (fromColumn)
    //table_name (toTable)
    //referenced_column_name (toColumn)
    async function addForeignKey(fromTable: string, fromColumn: string, toTable: string, toColumn: string) {

        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/save-db-metadata`, {
            credentials: "include",
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify({ 
                databaseServerID: dbID,
                language: databaseLanguage,
                org_id: orgId,
                db_metadata: {
                    schema_name: databaseName,
                    tables:[
                        {
                            table_name: fromTable,
                            foreign_keys: [
                                {
                                    column_name: fromColumn,
                                    table_name: toTable,
                                    referenced_column_name: toColumn,
                                    referenced_table_schema: databaseName
                                }
                            ]
                        }
                    ]
                    
                }
            })
        });
    
        if (!response.ok) {
            toast.error("Error adding foreign key. Please try again later.");
        }
        else {
            toast.success("Successfully added foreign key.");
        }
    }

    async function updateColumnDescription(description: string) {
        if(selectedField.column_name == ""){
            toast.error("Please select a column");
            return;
        }
        if(description == ""){
            toast.error("Please enter a description for the column."); 
            return;
        }

        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/save-db-metadata`, {
            credentials: "include",
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify({ 
                databaseServerID: dbID,
                language: databaseLanguage,
                org_id: orgId,
                db_metadata: {
                    schema_name: databaseName,
                    tables:[
                        {
                            table_name: table.name,
                            fields:[
                                {
                                    column_name: selectedField.column_name,
                                    description: description
                                }
                            ]
                        }
                    ]
                    
                }
            })
        });
    
        if (!response.ok) {
            // throw new Error(`HTTP error! Status: ${response.status}`);
            toast.error("Error updating table description. Please try again later.");
        }
        else {
            toast.success("Successfully updated table description.");
        }
    }

    return (

        <>
        <div>
          <EditIcon data-testid="editMetaPopUpTest" onClick={async () => {
            await fetchDatabases();                      
        }}/>
        </div>
        <DatabaseCredentialsModal dbServerID={dbID} disclosure={credentialsModalDisclosure} onConnected={async () => {await fetchHelper()}}/>
        <Modal 
          isOpen={ismetadataModalOpen} 
          onOpenChange={onmetadataModalOpenChange}
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
                <ModalBody className="flex flex-row items-center space-x-2">
                <Card className="w-full">
                <CardBody className="overflow-visible">

                    <h2>Select a database: <span style={{ color: 'red' }}>*</span></h2>
                    <Spacer y={2} />
                    <Card className="overflow-visible">
                    <CardBody className="flex flex-row items-center space-x-2">
                        {
                        //div for the name
                        databaseName !== "" && (
                        <div className="flex flex-1">
                            <div className="flex flex-1">
                                {databaseName}
                            </div>
                            <EditDescriptionMetaData description={""} type={databaseName} on_add={updateDatabaseDescription}/>
                        </div>
                        
                        )
                        }
            
                        {
                        //include the add button if no database is selected yet
                            <Dropdown>
                            <DropdownTrigger>
                                <Button variant="bordered">{databaseName !== ""? "Change":"+"}</Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                className="max-h-[50vh] overflow-y-auto"
                                emptyContent="Loading databases..."
                                items={databases}
                                onAction={(key) => handleDatabaseSelection(key)}
                            >
                                {databases.map((item: any) => (
                                <DropdownItem key={item.database}>
                                    {item.database}
                                </DropdownItem>
                                ))}
                            </DropdownMenu>
                            </Dropdown>
                        }
                        </CardBody>

                        </Card>
                        <Spacer y={2} />
                        {databaseName !== "" && ( 
                            <>
                            <h2>Select a table: <span style={{ color: 'red' }}>*</span></h2>
                            <Spacer y={2} />
                            </>)
                        }

                        {//Table editor part
                        databaseName !== "" && ( 
                            <Card className="overflow-visible">
                            <CardBody className="flex flex-row items-center space-x-2">
                                {databaseName !== "" && table.name && (
                                    <div className="flex flex-1">
                                        <div className="flex flex-1">
                                            {table?.name}
                                        </div>
                                        <EditDescriptionMetaData description={"// add pulled description from the database"} type={table.name} on_add={updateTableDescription}/>
                                    </div>)
                                }

                                {databaseName !== "" && (
                                    <Dropdown>
                                        <DropdownTrigger>
                                            <Button
                                                variant="bordered"
                                                aria-label="choose table button"
                                            >
                                                {table.name !== ""? "Change":"+"}
                                            </Button>
                                        </DropdownTrigger>
                                        {joinableTables.length > 0 && (
                                            <DropdownMenu
                                                className="max-h-[50vh] overflow-y-auto"
                                                items={joinableTables}
                                                onAction={(key) => handleTableSelection(key, table)}
                                            >
                                                {(item: any) => (
                                                    <DropdownItem key={item.table_name}>
                                                        {item.table_name}
                                                    </DropdownItem>
                                                )}
                                            </DropdownMenu>
                                        )}
                                    </Dropdown>)}
                                </CardBody>
                            </Card>)}

                            {databaseName !== "" && table.name !== "" && ( 
                                <>
                                <Spacer y={2} />
                                <h2>Select a column: <span style={{ color: 'red' }}>*</span></h2>
                                <Spacer y={2} />
                                </>)
                            }

                        {databaseName !== "" && table.name !== "" && ( 
                            <Card className="overflow-visible">
                            <CardBody className="flex flex-row items-center space-x-2">
                                {databaseName !== "" && table.name !== "" &&  selectedField.column_name !== "" && (
                                    <div className="flex flex-1">
                                        <div className="flex flex-1">
                                            {selectedField?.column_name}
                                        </div>
                                        <EditDescriptionMetaData description={""} type={selectedField.column_name} on_add={updateColumnDescription}/>
                                    </div>)
                                }

                                {databaseName !== "" && table.name !== "" && (
                                    <Dropdown>
                                        <DropdownTrigger>
                                            <Button
                                                variant="bordered"
                                                aria-label="choose table button"
                                            >
                                                {selectedField.column_name !== ""? "Change":"+"}
                                            </Button>
                                        </DropdownTrigger>
                                        {fields.length > 0 && (
                                            <DropdownMenu
                                                className="max-h-[50vh] overflow-y-auto"
                                                items={fields}
                                                onAction={(key) => handleColumnSelection(key, selectedField)}
                                            >
                                                {(item: any) => (
                                                    <DropdownItem key={item.name}>
                                                        {item.name}
                                                    </DropdownItem>
                                                )}
                                            </DropdownMenu>
                                        )}
                                    </Dropdown>)}
                                </CardBody>
                            </Card>)}

                        {//Define new foreign key
                        databaseName !== "" && table.name !== "" && ( 
                            <>
                                <Spacer y={2} />
                                <h2>Define a new foreign key referencing another table</h2>
                                <Spacer y={2} />
                                <Card className="overflow-visible">
                                <CardBody className="flex flex-row items-center space-x-2">

                                    {!foreignKey && (
                                        <AddForeignKeyModal onAdd={addForeignKey} databaseServerID={props.db_id} database={databaseName} language={databaseLanguage} allTables={joinableTables} fromTable={table.name}/>)}
                                    </CardBody>
                                </Card>
                            </>
                        )
                        }

                    </CardBody>
                    </Card>
                </ModalBody>
                <ModalFooter>
                  <Button 
                    color="primary" 
                    // onPress={() => onClose}  
                    onClick={() => {onClose();}}
                    data-testid="updateMetadataButton" 
                    >
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    )

}