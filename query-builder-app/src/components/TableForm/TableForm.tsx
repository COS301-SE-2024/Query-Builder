import { useState } from "react";
import { column, table } from "../../interfaces/intermediateJSON"
import { Card, CardBody, Spacer } from "@nextui-org/react";
import ColumnChip from "../ColumnChip/ColumnChip";

interface TableFormProps {
    table: table
}

export default function TableForm(props: TableFormProps){

    const [table, setTable] = useState<table>(props.table);

    function updateColumns(updatedColumn: column, index: number){

        const updatedColumns = [...table.columns];
        updatedColumns[index] = updatedColumn;
        setTable((previousTableState) => {
            return {...previousTableState, columns: updatedColumns}
        });

    }

    return(
        <>
            <h2>Select the columns to display from {table.name}:</h2>
            <Spacer y={2}/>
            <Card>
                <CardBody>
                    <div className="flex space-x-2">
                        {table.columns.map((column, index) => <ColumnChip column={column} index={index} onChange={updateColumns}></ColumnChip>)}
                    </div>
                </CardBody>
            </Card>
            <h1>{JSON.stringify(table)}</h1>
        </>
    );

}