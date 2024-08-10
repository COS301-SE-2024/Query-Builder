import React from "react";
import { Textarea, Button, ButtonGroup, useDisclosure, Modal, ModalContent, ModalHeader, Card, CardHeader, CardBody, CardFooter } from "@nextui-org/react";
import TableResponse from "../TableResponse/TableResponse";

export default function NaturalLanguage() {
    const [value, setValue] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [query, setQuery] = React.useState("");

    const handleSubmit = () => {
        setLoading(true);
        //Here we will do chatGPT stuff
        //give value to chatGPT



        //get query from chatGPT
        { onOpen }
    };

    return (
        <Card>
            <CardHeader>Type what you would like to query</CardHeader>
            <CardBody>
                <Textarea
                    className="w-[100%] h-[100%] item-centered"
                    placeholder="Type your query here"
                    value={value}
                    onChange={(newVal) => setValue(newVal.target.value)}
                />
            </CardBody>
            <CardFooter>
            <Button
                isDisabled={value.length <= 1}
                isLoading={loading}
                color="primary"
                onClick={handleSubmit}
            >
                Query
            </Button>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="top-center"
                className="text-black h-100vh"
                size="full">
                <ModalContent>
                    {(onClose: any) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Query Results</ModalHeader>
                            {/* <TableResponse query={query} /> */}
                        </>
                    )}
                </ModalContent>
            </Modal>
            </CardFooter>
        </Card>
    );
}