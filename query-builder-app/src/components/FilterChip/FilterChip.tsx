//----------------------------IMPORTS------------------------------------//

import { Button, Card, CardBody, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Input, Popover, PopoverContent, PopoverTrigger, Radio, RadioGroup, Spacer } from "@nextui-org/react";
import { AggregateFunction, column, primitiveCondition, ComparisonOperator, QueryParams } from "../../interfaces/intermediateJSON"
import { FiMoreVertical } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { Q } from "vitest/dist/reporters-yx5ZTtEV.js";

//----------------------------INTERFACES------------------------------------//

export interface CurrentQuery
{
    query_id: string,
    queryTitle: string,
    parameters: QueryParams
}

interface FilterChipProps {
    primitiveCondition: primitiveCondition,
    key: string,
    subquerylist?: CurrentQuery[],
    onChange?: (primitiveCondition: primitiveCondition) => void
    onRemove?: (key: string) => void;
  }

export default function FilterChip(props: FilterChipProps){

    //----------------------------REACT HOOKS------------------------------------//

    //React hook for whether the popup is open or not
    const [openPopup, setOpenPopup] = useState(false);

    //React hook for the data model
    const [primitiveCondition, setPrimitiveCondition] = useState<primitiveCondition>(props.primitiveCondition);
    
    // React hook for the subquery list
    const [subquerylist, setSubqueryList] = useState<CurrentQuery[] | undefined>(props.subquerylist);
    
    const [isQuery, setIsQuery] = useState<boolean>(isQueryParams(primitiveCondition.value));
    
    const [initIsQuery, setInitIsQuery] = useState<boolean>(isQueryParams(primitiveCondition.value));

    //React hook for initial subquery
    const [initSubquery, setInitSubquery] = useState<any>(primitiveCondition.value);

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

    React.useEffect(() => {

        console.log("Printing subquery list");
        console.log(subquerylist);

    },[subquerylist])

    //----------------------------HELPER FUNCTIONS------------------------------------//

    //helper functions for toggling the popup
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

        if(isQueryParams(primitiveCondition.value)){
            output += "Query";
        }
        else
        {
            output += primitiveCondition.value;
        }

        return output;

    }

    function isQueryParams(object: any): object is QueryParams {
        return object && typeof object.language === 'string' && typeof object.query_type === 'string' && typeof object.databaseName === 'string' && typeof object.table === 'object';
    }

    //not handling null which causes issues
    function setConditionValue(valueString: any ){

        let value: any;

        if(isQueryParams(valueString)){
            console.log("IS QUERY PARAMS");
            value = valueString;
        }
        else if(valueString == ""){
            value = valueString;
        }
        else if(valueString.toUpperCase() === "TRUE"){
            value = true;
        }
        else if(valueString.toUpperCase() === "FALSE"){
            value = false;
        }
        else if(isNaN(Number(valueString))){
            value = valueString;
        }
        else{
            value = Number(valueString);
        }

        setPrimitiveCondition((previousPrimitiveConditionState) => {
            return { ...previousPrimitiveConditionState, value: value };
        })

    }

    return(
        <Chip
            size="lg"
            endContent={
                <div className="relative inline-block">
                    <FiMoreVertical onClick={togglePopup} aria-label="edit" className="cursor-pointer"/>
                    {(openPopup) && (<Card ref={menuRef} className="absolute z-20 -top-[168px] left-[32px]">
                        <CardBody>
                            <Spacer y={2}/>
                            <h2>Use a summary statistic</h2>
                            <Spacer y={2}/>
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button
                                        variant="bordered"
                                        aria-label="Choose filter aggregate button"
                                    >
                                        {primitiveCondition.aggregate ? primitiveCondition.aggregate : "NONE"}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label="Choose filter aggregate dropdown menu"
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
                                        aria-label="Choose comparison operator button"
                                    >
                                        {primitiveCondition.operator}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label="Choose comparison operator dropdown menu"
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
                                    <DropdownItem key="LIKE">LIKE</DropdownItem>
                                    <DropdownItem key="IS">IS</DropdownItem>
                                    <DropdownItem key="IS_NOT">IS NOT</DropdownItem>
                                    <DropdownItem key="IN">IN</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            <Spacer y={2}/>
                            <h2>Value</h2>
                            <Spacer y={2}/>
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button
                                        variant="bordered"
                                        aria-label="Choose a subquery"
                                    >
                                        {isQuery ? "Query" : "Value"}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label="Choose between a value and a subquery from dropdown menu"
                                    variant="flat"
                                    disallowEmptySelection
                                    selectionMode="single"
                                    onSelectionChange={(keys) => {
                                        const key = Array.from(keys)[0];

                                        if(key == "VALUE"){
                                            setIsQuery(false)
                                            setConditionValue(0);
                                        } else if (key == "OTHER"){
                                            setIsQuery(true)
                                            setConditionValue(initSubquery);
                                        }
                                        else{
                                            setIsQuery(true)
                                            if(subquerylist !== undefined){
                                                const currquery = subquerylist.find((subquery) => subquery.query_id === key);
                                                setConditionValue(currquery?.parameters);
                                            }
                                        }
                                    }}

                                >
                                    <DropdownSection showDivider>
                                        <DropdownItem key="VALUE">Value</DropdownItem>
                                    </DropdownSection>
                                    <DropdownSection title="Choose a saved query as a subquery" items={subquerylist}>
                                        {(item) => (
                                        <DropdownItem
                                            key={item.query_id}
                                        >
                                            {item.queryTitle}
                                        </DropdownItem>
                                        )}
                                    </DropdownSection>
                                </DropdownMenu>
                            </Dropdown>
                            {(!isQuery) && (
                                <Input 
                                aria-label="Value input field"
                                type="text" 
                                value={primitiveCondition.value?.toString()}
                                onValueChange={(value:string) => {
                                setConditionValue(value)
                                }}
                                />
                            )}
                            <Spacer y={4} />
                            <Button
                                color="primary"
                                onClick={() => {
                                    if (props.onRemove) {
                                        props.onRemove(props.key);
                                    }
                                }}
                            >
                                Remove
                            </Button>
                            <Spacer y={2} />
                        </CardBody>
                    </Card>)}
                </div>
            }
        >
            {primitiveConditionString}
        </Chip>
    );

}