//----------------------------IMPORTS-----------------------------------//
import { compoundCondition, condition, primitiveCondition } from "@/interfaces/intermediateJSON"
import { Button, Card, CardBody, Spacer } from "@nextui-org/react";
import { useState } from "react"
import FilterChip from "../FilterChip/FilterChip";
import React from "react";

//---------------------------INTERFACES---------------------------------//

interface FilterListProps{
    condition: condition
}

export default function FilterList(props: FilterListProps){

    //----------------------------REACT HOOKS------------------------------------//

    //React hook for the data model
    const [condition, setCondition] = useState<condition>(props.condition);

    //----------------------------HELPER FUNCTIONS------------------------------------//

    //helper function that, when given the abstract syntax tree of conditions, renders the primitiveConditions'
    //FilterChips correctly

    function renderFilterChips(condition: condition): JSX.Element {

        //for a compoundCondition, call renderFilterChips on each of its conditions, but render the logical
        //operator in between
        if('conditions' in condition){
            const compoundCondition = condition as compoundCondition;
            return(
                <>
                <span>{"("}</span>
                {compoundCondition.conditions.map((subCondition, index) => (
                    <React.Fragment key={index}>
                      {renderFilterChips(subCondition)}
                      {index < compoundCondition.conditions.length - 1 && (
                        <span>{compoundCondition.operator}</span>
                      )}
                      {index == compoundCondition.conditions.length - 1 && (
                        <Button variant="bordered">+</Button>
                      )}
                    </React.Fragment>
                ))}
                <span>{")"}</span>
                </>
            );
        }
        //for a primitiveCondition, render a FilterChip for the primitive condition
        else{
            const primitiveCondition = condition as primitiveCondition;
            return(<FilterChip primitiveCondition={primitiveCondition} />);
        }

    }

    return (

        <>
            <h2>Add filters:</h2>
            <Spacer y={2}/>
            <Card className="w-full">
                <CardBody>
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
        </>

    );

}