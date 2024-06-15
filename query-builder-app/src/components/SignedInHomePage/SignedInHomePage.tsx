"use client"
import { Chip, Spacer, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip, Link} from "@nextui-org/react"
import DatabaseConnectionModal from "../DatabaseConnectionModal/DatabaseConnectionModal"
import React from "react";
import { EditIcon } from "./EditIcon";
import { DeleteIcon } from "./DeleteIcon";

const statusColorMap = {
    Connected: "success",
    Disconnected: "warning",
  };

export default function SignedInHomePage(){

    const rows = [
        {
          key: "1",
          name: "MySQL on Localhost",
          status: "Connected",
        },
        {
            key: "2",
            name: "MongoDB on Localhost",
            status: "Connected"
        }
      ];
      
      const columns = [
        {
          key: "name",
          label: "NAME",
        },
        {
          key: "status",
          label: "STATUS",
        },
        {
          key: "actions",
          label: "ACTIONS",
        },
    ];

    const renderCell = React.useCallback((database:any, columnKey:any) => {
        const cellValue = database[columnKey];

        switch (columnKey) {
            case "name":
                return (
                    <Link href="#" color="foreground">{cellValue}</Link>
                )
            case "status":
                return (
                    <Chip className="capitalize" color="success" size="sm" variant="flat">
                    {cellValue}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                    <Tooltip content="Edit">
                        <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                        <EditIcon />
                        </span>
                    </Tooltip>
                    <Tooltip color="danger" content="Delete">
                        <span className="text-lg text-danger cursor-pointer active:opacity-50">
                        <DeleteIcon />
                        </span>
                    </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
        }, []);

    return (

    <>
        <div className="flex justify-between">
            <h1 className="text-4xl">Your databases</h1>
            <DatabaseConnectionModal/>
        </div>

        <Spacer y={5}/>

        <Table 
            removeWrapper aria-label="table with dynamic content">
            <TableHeader columns={columns}>
                {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
            </TableHeader>
            <TableBody items={rows}>
                {(item) => (
                <TableRow key={item.key}>
                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                </TableRow>
                )}
            </TableBody>
        </Table>

    </>

)

}