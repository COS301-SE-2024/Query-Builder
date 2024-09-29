"use server";

import { redirect } from "next/navigation";

export async function navigateToForm(databaseServerID: string, queryID?: string) {

    if(!queryID){
        redirect('/' + databaseServerID);
    }else{
        redirect('/' + databaseServerID + '/' + queryID);
    }

}