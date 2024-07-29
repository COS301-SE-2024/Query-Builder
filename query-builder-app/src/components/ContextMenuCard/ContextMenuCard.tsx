import React from "react";
import { Card, CardBody, CardFooter, Divider, CardHeader, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from "@nextui-org/react";

export interface ContextMenuCardProps {
    queryTitle: string,
    saved_at: string,
    parameters: any
}

export default function ContextMenuCard({ queryTitle, saved_at, parameters }: ContextMenuCardProps) {
    return (

        <Dropdown>
            <DropdownTrigger>
                <Button
                    variant="flat" className="w-[235px]" color="primary"
                >
                    {queryTitle}
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions">
                <DropdownSection title={saved_at}>
                    <DropdownItem key="retrieve" description="Retrieve saved query">Retrieve Query</DropdownItem>
                    <DropdownItem key="delete" className="text-danger" color="danger" description="Delete query from saved queries">Delete Query</DropdownItem>
                </DropdownSection>

            </DropdownMenu>
        </Dropdown>
    );
}
