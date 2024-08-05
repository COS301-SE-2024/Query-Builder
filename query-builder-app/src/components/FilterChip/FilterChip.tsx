//----------------------------IMPORTS------------------------------------//

import { Button, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Popover, PopoverContent, PopoverTrigger, Radio, RadioGroup, Spacer } from "@nextui-org/react";
import { AggregateFunction, column, primitiveCondition, ComparisonOperator } from "../../interfaces/intermediateJSON"
import { FiMoreVertical } from "react-icons/fi";
import { useState } from "react";
import React from "react";

//----------------------------INTERFACES------------------------------------//

interface FilterChipProps {
    primitiveCondition: primitiveCondition,
    onChange?: (primitiveCondition: primitiveCondition) => void
  }

export default function FilterChip(props: FilterChipProps){

    //----------------------------REACT HOOKS------------------------------------//

    //React hook for the data model
    const [primitiveCondition, setPrimitiveCondition] = useState<primitiveCondition>(props.primitiveCondition);

    //React hook for the string displayed on the Chip
    const [primitiveConditionString, setPrimitiveConditionString] = useState<string>("");

    //React hook for when the data model has changed
    React.useEffect(() => {

        //inform the parent component that the data model has changed
        if((props.onChange != null)){
            props.onChange(primitiveCondition);
        }

        //regenerate the primitiveConditionString
        setPrimitiveConditionString(generatePrimitiveConditionString);

    },[primitiveCondition])

    //----------------------------HELPER FUNCTIONS------------------------------------//

    //helper function that generates a string representing the primitiveCondition

    function generatePrimitiveConditionString() : string {

        let output : string = "";

        if(primitiveCondition.aggregate != null){
            output += primitiveCondition.aggregate + "(";
        }

        if(primitiveCondition.tableName != null){
            output += primitiveCondition.tableName + " - ";
        }

        output += primitiveCondition.column;

        if(primitiveCondition.aggregate != null){
            output += ")";
        }

        output += " " + primitiveCondition.operator + " ";

        output += primitiveCondition.value;

        return output;

    }

    return(
        <Chip
            size="lg"
            endContent={
                <Popover placement="right">
                    <PopoverTrigger>
                        <FiMoreVertical/>
                    </PopoverTrigger>
                    <PopoverContent>
                        <div>
                            <Spacer y={2}/>
                            <h2>Use a summary statistic</h2>
                            <Spacer y={2}/>
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button
                                        variant="bordered"
                                    >
                                        {primitiveCondition.aggregate ? primitiveCondition.aggregate : "NONE"}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label="Choose filter aggregate"
                                    variant="flat"
                                    disallowEmptySelection
                                    selectionMode="single"
                                    selectedKeys={primitiveCondition.aggregate ? primitiveCondition.aggregate : "NONE"}
                                    onSelectionChange={(keys) => {
                                        const key = Array.from(keys)[0];
                                        setPrimitiveCondition((previousPrimitiveConditionState) => {
                                            if(key == "NONE"){
                                                return { ...previousPrimitiveConditionState, aggregate: undefined };
                                            }
                                            else{
                                                return { ...previousPrimitiveConditionState, aggregate: AggregateFunction[key as keyof typeof AggregateFunction] };
                                            }
                                        })
                                    }}
                                >
                                    <DropdownItem key="NONE">None</DropdownItem>
                                    <DropdownItem key="COUNT">Count</DropdownItem>
                                    <DropdownItem key="SUM">Sum</DropdownItem>
                                    <DropdownItem key="AVG">Average</DropdownItem>
                                    <DropdownItem key="MIN">Minimum</DropdownItem>
                                    <DropdownItem key="MAX">Maximum</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            <Spacer y={2}/>
                            <h2>Sign</h2>
                            <Spacer y={2}/>
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button
                                        variant="bordered"
                                    >
                                        {primitiveCondition.operator}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label="Choose comparison operator"
                                    variant="flat"
                                    disallowEmptySelection
                                    selectionMode="single"
                                    selectedKeys={primitiveCondition.operator}
                                    onSelectionChange={(keys) => {
                                        const key = Array.from(keys)[0];
                                        setPrimitiveCondition((previousPrimitiveConditionState) => {
                                            return { ...previousPrimitiveConditionState, operator: ComparisonOperator[key as keyof typeof ComparisonOperator] };
                                        })
                                    }}
                                >
                                    <DropdownItem key="EQUAL">=</DropdownItem>
                                    <DropdownItem key="LESS_THAN">&lt;</DropdownItem>
                                    <DropdownItem key="GREATER_THAN">&gt;</DropdownItem>
                                    <DropdownItem key="LESS_THAN_EQUAL">&lt;=</DropdownItem>
                                    <DropdownItem key="GREATER_THAN_EQUAL">&gt;=</DropdownItem>
                                    <DropdownItem key="NOT_EQUAL">&lt;&gt;</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            <Spacer y={2}/>
                            <h2>Value</h2>
                            <Spacer y={2}/>
                            <Input 
                                type="text" 
                                value={primitiveCondition.value?.toString()}
                                onValueChange={(value:string) => {
                                    setPrimitiveCondition((previousPrimitiveConditionState) => {
                                        return { ...previousPrimitiveConditionState, value: value };
                                    })
                                }}
                            />
                            <Spacer y={2}/>
                        </div>
                    </PopoverContent>
                </Popover>
            }
        >
            {primitiveConditionString}
        </Chip>
    );

}