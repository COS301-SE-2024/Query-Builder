import { Card, CardBody, Chip, Input, Popover, PopoverContent, PopoverTrigger, Radio, RadioGroup, Spacer } from "@nextui-org/react";
import { AggregateFunction, column } from "../../interfaces/intermediateJSON"
import { FiMoreVertical } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import React from "react";

interface ColumnChipProps {
    column: column,
    key?: React.Key,
    onChange?: (column: column, key: React.Key) => void
  }

export default function ColumnChip(props: ColumnChipProps){

    const [column, setColumn] = useState<column>(props.column);

    const [openPopup, setOpenPopup] = useState(false);

    //React hook to inform the parent component that the data model has changed
    React.useEffect(() => {

        if((props.onChange != null)){
            props.onChange(column, column.name);
        }

    },[column])

    function togglePopup(){
        setOpenPopup((previousOpenPopup) => {
            return !previousOpenPopup;
        });
    }

    const menuRef = useRef<HTMLDivElement>(null)

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current != null) { // Check if menuRef.current is not null
        if (!menuRef.current.contains(event.target as Node)) {
          setOpenPopup(false);
        }
      }
    };
  
    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);   
  
      };
    }, []);

    return(
        <Chip
            size="lg"
            endContent={
                <div className="relative inline-block">
                    <FiMoreVertical onClick={togglePopup} aria-label="edit"/>
                    {(openPopup) && (<Card ref={menuRef} className="absolute z-10 top-8">
                        <CardBody>
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
                        </CardBody>
                    </Card>)}
                </div>
            }
        >
            {column.name}
        </Chip>
    );

}