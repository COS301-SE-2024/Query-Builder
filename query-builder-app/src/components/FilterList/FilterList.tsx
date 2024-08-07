//This implementation makes the assumption that all conditions are simply "ADDED" together

//----------------------------IMPORTS-----------------------------------//
import { compoundCondition, condition, primitiveCondition, table } from "@/interfaces/intermediateJSON"
import { Button, Card, CardBody, Spacer } from "@nextui-org/react";
import { useState } from "react"
import { createClient } from "./../../utils/supabase/client";
import FilterChip from "../FilterChip/FilterChip";
import React from "react";

//---------------------------INTERFACES---------------------------------//

interface FilterListProps{
    condition: compoundCondition,
    table: table,
    databaseServerID: string
}

interface PossibleCondition{
    tableName: string,
    column: string
}

export default function FilterList(props: FilterListProps){

    //----------------------------REACT HOOKS------------------------------------//

    //React hook for the data model
    const [condition, setCondition] = useState<compoundCondition>(props.condition);

    //React hook for all possible conditions
    const [possibleConditions, setPossibleConditions] = useState<PossibleCondition[]>();

    //React hook to refetch possible conditions when table changes
    React.useEffect(() => {

        fetchPossibleConditions();

    },[props.table])

    React.useEffect(() => {

        console.log(JSON.stringify(possibleConditions))

    },[possibleConditions])

    //----------------------------HELPER FUNCTIONS------------------------------------//

    // This function gets the token from local storage.
    // Supabase stores the token in local storage so we can access it from there.
    const getToken = async () => {

        const supabase = createClient();
        const token = (await supabase.auth.getSession()).data.session?.access_token
    
        console.log(token)
    
        return token;
    };

    async function fetchPossibleConditions(){
        console.log("FETCHING POSSIBLE CONDITIONS");

        let tableRef: table = props.table;

        const possibleConditions: PossibleCondition[] = []; 

        while(tableRef.join){
            tableRef = tableRef.join.table2;

            let response = await fetch("http://localhost:55555/api/metadata/fields", {
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

            let json = await response.json();

            possibleConditions.push(json.data);

        }

        //set the databases hook
        setPossibleConditions(possibleConditions);

    }

    function renderFilterChips(compoundCondition: compoundCondition): JSX.Element {

            return(
                <>
                {compoundCondition.conditions.map((subCondition) => (
                    <FilterChip primitiveCondition={subCondition as primitiveCondition} onChange={updateCondition} />
                ))}
                </>
            );

    }

    //callback function for FilterChip
    function updateCondition(updatedCondition: primitiveCondition){

        // Find the index of the primitiveCondition to be updated
        let i = 0;
        for(let cond of condition.conditions){
            let primitive = cond as primitiveCondition;
            if(primitive.column == updatedCondition.column){
                break;
            }
            i += 1;
        }

        const updatedConditions = [...condition.conditions];
        updatedConditions[i] = updatedCondition;
        setCondition((previousConditionState) => {
            return {...previousConditionState, conditions: updatedConditions}
        });

    }

    return (

        <>
            <h2>Add filters:</h2>
            <Spacer y={2}/>
            <Card className="w-full overflow-visible">
                <CardBody className="overflow-visible">
                    <div className="flex items-center space-x-2">
                        {
                            /*all FilterChips here*/
                            renderFilterChips(condition)
                        }
                        <div className="flex justify-end flex-1">
                            <Button variant="bordered">+</Button>
                        </div>
                    </div>         
                </CardBody>
            </Card>
            <h1>{JSON.stringify(condition)}</h1>
        </>

    );

}