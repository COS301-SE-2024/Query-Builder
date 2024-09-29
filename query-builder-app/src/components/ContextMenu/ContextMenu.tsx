import React, { useState } from "react";
import { Input, ScrollShadow, Spacer, Button } from "@nextui-org/react";
import ContextMenuCard from "../ContextMenuCard/ContextMenuCard";
import { createClient } from "./../../utils/supabase/client";



export default function ContextMenu() {

    interface ContextMenuCardProps {
        queryTitle: string;
        saved_at: string;
        parameters: any;
        query_id: any;
        db_id: string;
        description: string;
        type: string;
        onDelete: () => void;
        db_envs: any;
    }

    const getToken = async () => {
        const supabase = createClient();
        const token = (await supabase.auth.getSession()).data.session?.access_token;

        return token;
    };

    const reload = () => {
        getSavedQueries();
    };


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

    const [savedQueries, setSavedQueries] = useState<ContextMenuCardProps[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    React.useEffect(() => {
        getSavedQueries();
    }, []);

    const filteredQueries = Array.isArray(savedQueries)
        ? savedQueries.filter(queryData =>
            queryData.queryTitle.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    return (
        <div className="size-full pl-3 pr-3 mt-2 flex flex-col">
            <Input
                fullWidth
                color="primary"
                placeholder="Search Queries..."
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
                style={{
                    backgroundColor: 'transparent',
                    color: '#333',
                }}
            />
            <Spacer y={2} />
            <ScrollShadow hideScrollBar className="flex-grow-1">
                {filteredQueries.length > 0 ? (
                    filteredQueries.map((queryData: ContextMenuCardProps, index: number) => (
                        <React.Fragment key={index}>
                            <ContextMenuCard
                                queryTitle={queryData.queryTitle}
                                saved_at={queryData.saved_at}
                                parameters={queryData.parameters}
                                query_id={queryData.query_id}
                                db_id={queryData.db_id}
                                description_text={queryData.description}
                                type_text={queryData.type}
                                onDelete={reload}
                                db_envs={queryData.db_envs}
                            />
                            <Spacer x={4} />
                        </React.Fragment>
                    ))
                ) : (
                    <p style={{ fontSize: '15px' }}>No queries, only empty space...</p>)}
            </ScrollShadow>
        </div>
    );
}
