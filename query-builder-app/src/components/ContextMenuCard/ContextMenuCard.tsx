import React, { useState } from "react";
import {
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    DropdownSection,
} from "@nextui-org/react";
import { createClient } from "./../../utils/supabase/client";
import { useRouter } from 'next/navigation'
import { timeStamp } from "console";

interface ContextMenuCardProps {
    queryTitle: string;
    saved_at: string;
    parameters: any;
    query_id: any;
    db_id: string;
    onDelete: () => void;
}

// This function gets the token from local storage.
// Supabase stores the token in local storage so we can access it from there.
const getToken = async () => {
    const supabase = createClient();
    const token = (await supabase.auth.getSession()).data.session?.access_token;

    console.log(token);

    return token;
};

async function removeQuery(query_id: string) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/query-management/delete-query`, {
        credentials: "include",
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken()
        },
        body: JSON.stringify({
            query_id: query_id
        })
    });

    if (!response.ok) {
        // Handle errors or unsuccessful response
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    let json = (await response.json()).data;
}

export default function ContextMenuCard({
    queryTitle,
    saved_at,
    parameters,
    query_id,
    db_id,
    onDelete,
}: ContextMenuCardProps) {
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleDelete = async () => {
        setLoading(true);

        try {
            await removeQuery(query_id);
        } catch (error) {
            console.error("Error during deletion:", error);
        } finally {
            setLoading(false);
            onDelete();
        }
    };

    const handleRetrieve = async () => {
        let query = parameters;

        console.log(query);
        //Here we will send the query to the query builder
        
        router.push("/" + db_id + "/" + query_id);
        
    };

    const localDateTime = new Date(saved_at).toLocaleString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button
                    variant="flat"
                    className="size-full pl-1 pr-1"
                    color="primary"
                    disabled={loading}
                >
                    {loading ? "Processing..." : queryTitle}
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions">
                <DropdownSection title={localDateTime}>
                    <DropdownItem
                        key="retrieve"
                        description="Retrieve saved query"
                        onClick={handleRetrieve}
                    >
                        Retrieve Query
                    </DropdownItem>
                    <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        description="Delete query from saved queries"
                        onClick={handleDelete}
                    >
                        Delete Query
                    </DropdownItem>
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    );
}
