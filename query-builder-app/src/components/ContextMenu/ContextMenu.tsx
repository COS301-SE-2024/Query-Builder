import React from "react";
import { ScrollShadow, Spacer } from "@nextui-org/react";
import ContextMenuCard from "../ContextMenuCard/ContextMenuCard";
import { createClient } from "./../../utils/supabase/client";

export default function ContextMenu() {


    interface ContextMenuCardProps {
        queryTitle: string,
        saved_at: string,
        parameters: any,
        query_id: any,
        db_id: string,
    }

    // This function gets the token from local storage.
    // Supabase stores the token in local storage so we can access it from there.
    const getToken = async () => {

        const supabase = createClient();
        const token = (await supabase.auth.getSession()).data.session?.access_token

        console.log(token)

        return token;
    };

    async function getSavedQueries() {
        try {
            const response = await fetch("http://localhost:55555/api/query-management/get-queries", {
                credentials: "include",
                method: "GET",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + await getToken()
                }
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();

            setSavedQueries(data.query_data);
        } catch (error) {
            console.error("Failed to fetch saved queries:", error);
            setSavedQueries([]);
        }
    }


    //React hook to hold the user's organisations
    const [savedQueries, setSavedQueries] = React.useState<ContextMenuCardProps[]>([]);


    //React hook to fetch the user's organisations upon rerender of the component
    React.useEffect(() => {
        getSavedQueries();

    }, [])

    return (

    );
}
