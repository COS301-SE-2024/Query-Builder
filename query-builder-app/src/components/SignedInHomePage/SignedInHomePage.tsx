"use client"
import { Chip, Spacer, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Link} from "@nextui-org/react"
import DatabaseConnectionModal from "../DatabaseConnectionModal/DatabaseConnectionModal"
import React from "react";
import { createClient } from "./../../utils/supabase/client";
import AddOrganisationModal from "../AddOrganisationModal/AddOrganisationModal";


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
   
    return token;
};

export default function SignedInHomePage(){

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

        //the org_data property is an array of organisations

        setOrganisations(json.data)

    }

    //React hook to hold the user's organisations
    const [organisations, setOrganisations] = React.useState([]);

    //React hook to fetch the user's organisations upon rerender of the component
    React.useEffect(() => {

        fetchOrgs();

    },[])

    return (
        
        <div className="p-5 app">
        <div className="flex justify-between">
            <h1 className="text-5xl">Your Organisations</h1>
            <AddOrganisationModal on_add={fetchOrgs} ></AddOrganisationModal>
        </div>
        <Spacer y={10}/>
        {organisations ? organisations.map((org: Organisation) => (
            <>
                <div className="flex">
                    <h1 className="text-3xl flex-1">{org.name}</h1>
                    <DatabaseConnectionModal org_id={org.org_id} on_add={fetchOrgs}/>
                    <Spacer x={5} />
                    <Link href={"/organisation/" + org.org_id}>settings</Link>
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
                                <TableCell><Link href={"/"+db.db_id}>{db.name}</Link></TableCell>
                            </TableRow>
                            )
                        )}
                    </TableBody>
                </Table>
                <Spacer y={5}/>
            </>
        )): <></>}
        </div>

)

}