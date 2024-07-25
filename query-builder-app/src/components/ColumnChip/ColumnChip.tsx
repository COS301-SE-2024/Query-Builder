import { Chip, Input, Popover, PopoverContent, PopoverTrigger, Radio, RadioGroup, Spacer } from "@nextui-org/react";
import { AggregateFunction, column } from "../../interfaces/intermediateJSON"
import { FiMoreVertical } from "react-icons/fi";
import { useState } from "react";
import React from "react";

interface ColumnChipProps {
    column: column,
    key?: React.Key,
    onChange?: (column: column, key: React.Key) => void
  }

export default function ColumnChip(props: ColumnChipProps){

    const [column, setColumn] = useState<column>(props.column);

    React.useEffect(() => {

        console.log("hello");
        console.log(JSON.stringify(props));

    },[])

    React.useEffect(() => {

        if((props.onChange != null) && (props.key != null)){
            props.onChange(column, props.key);
        }

    },[column])

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
                            <RadioGroup
                                label="Get summary statistics"
                                value={column.aggregation ? column.aggregation : "NONE"}
                                onValueChange={(value:string) => {
                                    setColumn((previousColumnState) => {
                                        if(value == "NONE"){
                                            return { ...previousColumnState, aggregation: undefined };
                                        }
                                        else{
                                            return { ...previousColumnState, aggregation: AggregateFunction[value as keyof typeof AggregateFunction] };
                                        }
                                    })
                                }}
                                >
                                <Radio value="NONE">None</Radio>
                                <Radio value="COUNT">Count</Radio>
                                <Radio value="SUM">Sum</Radio>
                                <Radio value="AVG">Average</Radio>
                                <Radio value="MIN">Minimum</Radio>
                                <Radio value="MAX">Maximum</Radio>
                            </RadioGroup>
                            <Spacer y={2}/>
                            <Input 
                                type="text" 
                                label="Rename"
                                value={column.alias ? column.alias : ""}
                                onValueChange={(value:string) => {
                                    setColumn((previousColumnState) => {
                                        if(value == ""){
                                            return { ...previousColumnState, alias: undefined };
                                        }
                                        else{
                                            return { ...previousColumnState, alias: value };
                                        }
                                    })
                                }}
                            />
                            <Spacer y={2}/>
                        </div>
                    </PopoverContent>
                </Popover>
            }
        >
            {column.name}
        </Chip>
    );

}