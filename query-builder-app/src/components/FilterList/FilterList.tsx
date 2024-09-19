//----------------------------IMPORTS-----------------------------------//
import { ComparisonOperator, compoundCondition, condition, LogicalOperator, primitiveCondition, table } from "../../interfaces/intermediateJSON";
import { Button, Card, CardBody, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Spacer } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { createClient } from "./../../utils/supabase/client";
import FilterChip from "../FilterChip/FilterChip";
import React from "react";
import { navigateToAuth } from "../../app/authentication/actions";

//---------------------------INTERFACES---------------------------------//

interface FilterListProps {
    condition: compoundCondition | undefined,
    table: table,
    databaseServerID: string
    onChange?: (condition: compoundCondition) => void
}

interface PossibleCondition {
    tableName: string,
    column: string
}

//---------------------------MAIN COMPONENT-----------------------------//

export default function FilterList(props: FilterListProps) {
    //----------------------------REACT HOOKS------------------------------------//
    const [condition, setCondition] = useState<compoundCondition>({ id: generateUUID(), conditions: [], operator: LogicalOperator.AND });
    const [possibleConditions, setPossibleConditions] = useState<PossibleCondition[]>();

    useEffect(() => {
        if (props.condition) {
            setCondition(props.condition);
        }
    }, [props.condition]);

    useEffect(() => {
        fetchPossibleConditions();
    }, [props.table]);

    useEffect(() => {
        if (props.onChange != null) {
            props.onChange(condition);
        }
    }, [condition]);

    // This function gets the token from local storage.
    const getToken = async () => {
        const supabase = createClient();
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        console.log(token);
        return token;
    };

    async function fetchPossibleConditions() {
        console.log("FETCHING POSSIBLE CONDITIONS");

        let tableRef: table = props.table;
        const newPossibleConditions: PossibleCondition[] = [];

        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/fields`, {
            credentials: "include",
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify({
                databaseServerID: props.databaseServerID,
                schema: "sakila",
                table: tableRef.name
            })
        });

        if (!response) {
            return;
        }

        let json = await response.json();

        if (!response.ok) {
            if (json.response && json.response.message == 'You do not have a backend session') {
                navigateToAuth();
            }
        }

        console.log(json.data);
        for (let item of json.data) {
            newPossibleConditions.push({ tableName: tableRef.name, column: item.name });
        }

        while (tableRef.join) {
            tableRef = tableRef.join.table2;
            response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/fields`, {
                credentials: "include",
                method: "PUT",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + await getToken()
                },
                body: JSON.stringify({
                    databaseServerID: props.databaseServerID,
                    schema: "sakila",
                    table: tableRef.name
                })
            });

            json = await response.json();
            if (!response.ok) {
                if (json.response && json.response.message == 'You do not have a backend session') {
                    navigateToAuth();
                }
            }

            console.log(json.data);
            for (let item of json.data) {
                newPossibleConditions.push({ tableName: tableRef.name, column: item.name });
            }
        }

        // Set the possible conditions hook
        setPossibleConditions(newPossibleConditions);
    }

    const handleFilterSelection = (key: string) => {
        const [tableName, columnName] = key.split(" - ");
        const newPrimitiveCondition: primitiveCondition = {
            id: generateUUID(), // Generate unique ID
            tableName: tableName,
            column: columnName,
            operator: ComparisonOperator.EQUAL,
            value: 0
        };

        setCondition(prevCondition => ({
            ...prevCondition,
            conditions: [...prevCondition.conditions, newPrimitiveCondition]
        }));
    };

    function renderFilterChips(): JSX.Element {
        return (
            <>
                {condition.conditions.map(subCondition => (
                    <FilterChip
                        key={(subCondition as primitiveCondition).id ?? generateUUID()}
                        primitiveCondition={subCondition as primitiveCondition}
                        onChange={updateCondition}
                        onRemove={removeCondition}
                        id={(subCondition as primitiveCondition).id?.toString() ?? generateUUID()}
                    />
                ))}
            </>
        );
    }

    function generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Callback function for FilterChip
    function updateCondition(updatedCondition: primitiveCondition) {
        setCondition(prevCondition => ({
            ...prevCondition,
            primitiveCondition: prevCondition.conditions.map(cond =>
                (cond as primitiveCondition).id === updatedCondition.id ? updatedCondition : cond
            )
        }));
    }

    function removeCondition(id: string) {
        console.log(`Removing condition with id: ${id}`);
        setCondition(prevCondition => ({
            ...prevCondition,
            conditions: prevCondition.conditions.filter(cond => (cond as primitiveCondition).id !== id)
        }));
    }

    return (
        <>
            <h2>Add filters:</h2>
            <Spacer y={2} />
            <Card className="w-full overflow-visible">
                <CardBody className="overflow-visible">
                    <div className="flex items-center space-x-2">
                        {renderFilterChips()}
                        <div className="flex justify-end flex-1">
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button aria-label="add filter" variant="bordered">+</Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    className="max-h-[50vh] overflow-y-auto"
                                    items={possibleConditions}
                                    onAction={(key) => handleFilterSelection(key as string)}
                                >
                                    {(item: any) => (
                                        <DropdownItem key={`${item.tableName} - ${item.column}`}>
                                            {`${item.tableName} - ${item.column}`}
                                        </DropdownItem>
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </>
    );
}
