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
        onDelete: () => void;
    }

    // This function gets the token from local storage.
    // Supabase stores the token in local storage so we can access it from there.
    const getToken = async () => {

        const supabase = createClient();
        const token = (await supabase.auth.getSession()).data.session?.access_token

        return token;
    };

    function reload()
    {
        getSavedQueries();
    }

    async function getSavedQueries() {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/query-management/get-queries`, {
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
        <ScrollShadow className=" h-full size-full  pl-3 pr-3 mt-2">
            {Array.isArray(savedQueries) && savedQueries.map((queryData: ContextMenuCardProps, index: number) => (
                <React.Fragment key={index}>
                    <ContextMenuCard
                        queryTitle={queryData.queryTitle}
                        saved_at={queryData.saved_at}
                        parameters={queryData.parameters}
                        query_id={queryData.query_id}
                        db_id={queryData.db_id}
                        onDelete={reload}
                    />
                    <Spacer x={4} />

                </React.Fragment>
            ))}
        </ScrollShadow>
    );
}
