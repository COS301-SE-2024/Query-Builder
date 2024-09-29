"use client"
import { Spacer, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Link, useDisclosure, Button} from "@nextui-org/react"
import DatabaseAdditionModal from "../DatabaseAdditionModal/DatabaseAdditionModal"
import React from "react";
import { createClient } from "./../../utils/supabase/client";
import AddOrganisationModal from "../AddOrganisationModal/AddOrganisationModal";
import { navigateToForm } from "../../app/serverActions";
import DatabaseCredentialsModal from "../DatabaseCredentialsModal/DatabaseCredentialsModal";
import toast from "react-hot-toast";


interface Database {
  name: String;
  db_id: any;
}

interface Member {
    role_permissions: {
        add_dbs: boolean,
        is_owner: boolean,
        remove_dbs: boolean,
        update_dbs: boolean,
        invite_users: boolean,
        remove_users: boolean,
        view_all_dbs: boolean,
        view_all_users: boolean,
        update_db_access: boolean,
        update_user_roles: boolean
    }
}

interface Organisation {
  name: String;
  org_id: String;
  db_envs: Database[];
  org_members: Member[];
}

// This function gets the token from local storage.
// Supabase stores the token in local storage so we can access it from there.
const getToken = async () => {
  const supabase = createClient();
  const token = (await supabase.auth.getSession()).data.session?.access_token;

  return token;
};

export default function SignedInHomePage(){

    const [notVerified, setNotVerified] = React.useState('');
    //async function to query a database server
    async function queryDatabaseServer(databaseServerID: string) {

        //first determine whether the user already has an active connection to the database server
        let hasActiveConnectionResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/has-active-connection`, {
            credentials: "include",
            method: "POST",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify({
                databaseServerID: databaseServerID
            })
        });

        const hasActiveConnection = (await hasActiveConnectionResponse.json()).hasActiveConnection;

        //if the user has an active connection to the database server, navigate straight to the form
        if(hasActiveConnection === true){
            navigateToForm(databaseServerID);
        }
        //otherwise proceed to open a connection to the database server
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
                    db_id: databaseServerID
                })
            });

            const dbSecretsSaved = (await dbSecretsSavedResponse.json()).saved_db_credentials;

            //if the user doesn't have db credentials saved for that database, then prompt them for their credentials
            if(dbSecretsSaved === false){
                credentialsModalDisclosure.onOpen();
                setCurrentDBServerID(databaseServerID);
            }
            else{

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
                        databaseServerID: databaseServerID
                    })
                });

                let json = await connectionResponse.json();

                //if connection was successful, navigate to the form
                if(connectionResponse.ok === true && json.success === true){
                    navigateToForm(databaseServerID);
                }
                //if the connection was not successful, display an appropriate error message
                else if(connectionResponse.ok === false && json.response && json.response.message){
                    toast.error(json.response.message);
                }
                else{
                    toast.error("Something went wrong. Please try again");
                }

            }

        }

    }

    //async function to fetch the user's organisations
    async function fetchOrgs() {
        
        //Get the orgs of the logged-in user
        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/get-org`, {
            credentials: "include",
            method: "GET",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken()
            },
        });

        let json = await response.json();

        if(json.statusCode === 404){
            setNotVerified("Please check your emails and verify your account!");
        }
        else{
            //the org_data property is an array of organisations
            setOrganisations(json.data)
        }
    }

    //React hook to show the credentials modal
    const credentialsModalDisclosure = useDisclosure();

    //React hook for the current DB server ID
    const [currentDBServerID, setCurrentDBServerID] = React.useState('');

  //React hook to hold the user's organisations
  const [organisations, setOrganisations] = React.useState<Organisation[]>([]);

  //React hook to fetch the user's organisations upon rerender of the component
  React.useEffect(() => {
    fetchOrgs();
  }, []);

    return (
        <>
            <DatabaseCredentialsModal dbServerID={currentDBServerID} disclosure={credentialsModalDisclosure} onConnected={() => {navigateToForm(currentDBServerID)}}/>
            <div className="p-5 app">
            { notVerified == "" ? (
                <>
                    <div className="flex justify-between">
                        <h1 className="text-5xl">Your Organisations</h1>
                        <AddOrganisationModal on_add={fetchOrgs} ></AddOrganisationModal>
                    </div>
                    <Spacer y={10}/>
                    {organisations ? organisations.map((org: Organisation) => (
                        <>
                            <div className="flex">
                                <h1 className="text-3xl flex-1">{org.name}</h1>
                                {org.org_members[0].role_permissions.add_dbs && (<DatabaseAdditionModal org_id={org.org_id} on_add={fetchOrgs}/>)}
                                <Spacer x={2} />
                                <Button variant="bordered" color="primary">
                                    <Link href={"/organisation/" + org.org_id}>Settings</Link>
                                </Button>
                    </div>

                            <Spacer y={5}/>

                            <Table 
                                removeWrapper aria-label="table with dynamic content">
                                <TableHeader>
                                    <TableColumn>Name</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {org.db_envs.map((db: Database) => 
                                        (
                                        <TableRow key={db.db_id}>
                                            <TableCell><Link className="cursor-pointer" onPress={() => {queryDatabaseServer(db.db_id)}}>{db.name}</Link></TableCell>
                                        </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                            <Spacer y={5}/>
                        </>
                    )): <></>}
                </>) : (<>
                    <div className="flex justify-center my-auto text-xl">
                        {notVerified}
                    </div>
                </>)}
            
            </div>
        </>

)

}
