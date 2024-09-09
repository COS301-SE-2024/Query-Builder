"use server";

import { redirect } from "next/navigation";

export async function navigateToForm(databaseServerID: string) {
    redirect('/' + databaseServerID);
}