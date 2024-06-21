"use client"
import { Chip, Spacer, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, getKeyValue} from "@nextui-org/react"
import DatabaseConnectionModal from "../DatabaseConnectionModal/DatabaseConnectionModal"
import React from "react";
import { EditIcon } from "./EditIcon";
import { DeleteIcon } from "./DeleteIcon";
import { createClient } from "@/utils/supabase/client";

interface Database {
    created_at: String,
    name: String,
    db_id: any,
    db_info: any,
    type: String
}

interface Organisation {
    created_at: String,
    logo: String,
    name: String,
    org_id: String,
    db_envs: Database[],
    org_members: String[]
}

// This function gets the token from local storage.
// Supabase stores the token in local storage so we can access it from there.
const getToken = async () => {

    const supabase = createClient();
    const token = (await supabase.auth.getSession()).data.session?.access_token
  
    console.log(token)
  
    return token;
};

export default function SignedInHomePage(){

    //async function to fetch the user's organisations
    async function fetchOrgs() {
        
        //Get the orgs of the logged-in user
        let response = await fetch("http://localhost:55555/api/org-management/get-org", {
            method: "GET",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken()
            },
        });

        let json = await response.json();

        //the org_data property is an array of organisations
        console.log(json.org_data);

        setOrganisations(json.org_data)

    }

    //React hook to hold the user's organisations
    const [organisations, setOrganisations] = React.useState([]);

    //React hook to fetch the user's organisations upon rerender of the component
    React.useEffect(() => {

        fetchOrgs();

    },[])

    return (

        <div className="p-5">
        {organisations.map((org: Organisation) => (
            <>
                <div className="flex justify-between">
                    <h1 className="text-4xl">{org.name}</h1>
                    <DatabaseConnectionModal org_id={org.org_id} on_add={fetchOrgs}/>
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
                            <TableRow>
                                <TableCell>{db.name}</TableCell>
                            </TableRow>
                            )
                        )}
                    </TableBody>
                </Table>
                <Spacer y={5}/>
            </>
        ))}
        </div>

)

}