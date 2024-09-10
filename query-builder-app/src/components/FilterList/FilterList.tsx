//This implementation makes the assumption that all conditions are simply "ADDED" together

//----------------------------IMPORTS-----------------------------------//
import { ComparisonOperator, compoundCondition, condition, LogicalOperator, primitiveCondition, table } from "../../interfaces/intermediateJSON"
import { Button, Card, CardBody, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Spacer } from "@nextui-org/react";
import { useState } from "react"
import { createClient } from "./../../utils/supabase/client";
import FilterChip from "../FilterChip/FilterChip";
import React from "react";
import { navigateToAuth } from "../../app/authentication/actions";

//---------------------------INTERFACES---------------------------------//

interface FilterListProps{
    condition: compoundCondition | undefined,
    table: table,
    databaseServerID: string
    onChange?: (condition: compoundCondition) => void
}

interface PossibleCondition{
    tableName: string,
    column: string
}

export default function FilterList(props: FilterListProps){

    //----------------------------REACT HOOKS------------------------------------//

    const [condition, setCondition] = useState<compoundCondition>({conditions: [], operator: LogicalOperator.AND});

    if(props.condition){
        //React hook for the data model
        setCondition(props.condition);
    }

    //React hook for all possible conditions
    const [possibleConditions, setPossibleConditions] = useState<PossibleCondition[]>();

    //React hook to refetch possible conditions when table changes
    React.useEffect(() => {

        fetchPossibleConditions();

    },[props.table])

    React.useEffect(() => {

        console.log(JSON.stringify(possibleConditions))

    },[possibleConditions])

    //React hook for when the data model has changed
    React.useEffect(() => {

        //inform the parent component that the data model has changed
        if((props.onChange != null)){
            props.onChange(condition);
        }

    },[condition])

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

        let json = await response.json();

        if(!response.ok){
        
            if(json.response && json.response.message == 'You do not have a backend session'){
                navigateToAuth();
            }
          
        }

        console.log(json.data)

        for(let item of json.data){
            newPossibleConditions.push({tableName: tableRef.name, column: item.name});
        }

        while(tableRef.join){
            tableRef = tableRef.join.table2;

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

            let json = await response.json();

            if(!response.ok){
        
                if(json.response && json.response.message == 'You do not have a backend session'){
                    navigateToAuth();
                }
              
            }

            console.log(json.data)

            for(let item of json.data){
                newPossibleConditions.push({tableName: tableRef.name, column: item.name});
            }

        }

        //set the databases hook
        setPossibleConditions(newPossibleConditions);

    }

    const handleFilterSelection = (key: string) => {

        const stringSplit = key.split(" - ");
        const tableName = stringSplit[0];
        const columnName = stringSplit[1];

        const newConditionsArray = condition.conditions;

        const newPrimitiveCondition: primitiveCondition = {
            tableName: tableName,
            column: columnName,
            operator: ComparisonOperator.EQUAL,
            value: 0
        }

        newConditionsArray.push(newPrimitiveCondition)

        setCondition({
            ...condition,
            conditions: newConditionsArray
        });

    };

    function renderFilterChips(compoundCondition: compoundCondition): JSX.Element {

            return(
                <>
                {compoundCondition.conditions.map((subCondition, index) => (
                    <FilterChip key={index} primitiveCondition={subCondition as primitiveCondition} onChange={updateCondition} onRemove={removeCondition}/>
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

    function removeCondition(key: React.Key) {
        const index = Number(key);
        setCondition((prevCondition) => {
            const updatedConditions = prevCondition.conditions.filter((_, i) => i !== index);
    
            return { 
                ...prevCondition, 
                conditions: updatedConditions 
            };
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
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button aria-label="add filter" variant="bordered">+</Button>
                                </DropdownTrigger>
                                <DropdownMenu 
                                        className="max-h-[50vh] overflow-y-auto"
                                        items={possibleConditions} 
                                        onAction={(key) => handleFilterSelection(key as string)}
                                    >
                                        {(item:any) => (
                                        <DropdownItem
                                            key={item.tableName + " - " + item.column}
                                        >
                                            {item.tableName + " - " + item.column}
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