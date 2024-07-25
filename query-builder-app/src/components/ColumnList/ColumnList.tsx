import { Card, CardBody } from "@nextui-org/react";
import { column } from "../../interfaces/intermediateJSON"
import ColumnChip from "../ColumnChip/ColumnChip"
import { useState } from "react";

interface ColumnListProps {
    columns: column[]
}

export default function ColumnList(props: ColumnListProps){

    const [columns, setColumns] = useState<column[]>(props.columns);

    function updateColumns(updatedColumn: column, index: number){

        const updatedColumns = [...columns];
        updatedColumns[index] = updatedColumn;
        setColumns(updatedColumns);

    }

    return (
        <Card>
            <CardBody>
                <div className="flex space-x-2">
                    {columns.map((column, index) => <ColumnChip column={column} index={index} onChange={updateColumns}></ColumnChip>)}
                </div>
            </CardBody>
        </Card>
    );

}