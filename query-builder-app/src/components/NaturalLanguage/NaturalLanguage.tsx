import React, { useEffect, useState } from "react";
import { Textarea, Button, Card, CardHeader, CardBody, CardFooter, Spacer, Modal, ModalContent, ModalHeader, useDisclosure } from "@nextui-org/react";
import TableResponse from "../TableResponse/TableResponse";
import { useParams } from "next/navigation";
import { createClient } from "./../../utils/supabase/client";
import { Query } from "@/interfaces/intermediateJSON";
import { MdMic } from 'react-icons/md';
import useSpeechToText from 'react-hook-speech-to-text';

export default function NaturalLanguage() {
    const [value, setValue] = useState("");
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [queryLoaded, setQueryLoaded] = useState(false);
    const [query, setQuery] = useState<Query>();
    const [loading, setLoading] = useState(false);
    const [showError, setShowError] = useState(false);

    //This is the speech to text hook//
    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
    });

    if (error) return <p>Web Speech API is not available in this browser 🤷‍</p>;

    type ResultType = {
        timestamp: number;
        transcript: string;
    };

    useEffect(() => {
        const combinedResults = results.map((result) => {
            if (typeof result === "string") {
                return result;
            } else {
                return result.transcript;
            }
        }).join(" ");
        const finalText = interimResult ? `${combinedResults} ${interimResult}` : combinedResults;

        setValue(finalText);
    }, [interimResult, results]);


    // Assuming results is an array of ResultType
    const safeResults: ResultType[] = results as ResultType[];

    const getToken = async () => {
        const supabase = createClient();
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        return token;
    };

    const { databaseServerID } = useParams<{ databaseServerID: string }>();

    async function getQuery() {
        setLoading(true);

        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/natural-language/query`, {
            credentials: "include",
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify({
                databaseServerID: databaseServerID[0],
                query: value
            })
        });

        if (response.ok) {
            let query = await response.json();
            setShowError(false);
            setLoading(false);
            setQuery(query);
            setQueryLoaded(true);
            setValue("");
        } else {
            setLoading(false);
            setShowError(true);
        }
    };

    const handleTextareaChange: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
        setValue(event.target.value);
    };

    return (
        <Card className="h-[40vh]">
            <CardHeader>Type what you would like to query</CardHeader>
            <CardBody>
                <div className="relative flex flex-row gap-1 w-full">
                    <textarea
                        className="flex-1 h-[25vh] item-centered bg-inherit rounded p-2"
                        placeholder="Type your query here"
                        value={value}
                        onChange={handleTextareaChange}
                        style={{
                            backgroundColor: 'transparent',
                            color: '#333',
                            border: 'none',
                            resize: 'none',
                            overflow: 'hidden', 
                            width: '100%', 
                        }}
                    />
                    <Button
                        onClick={isRecording ? stopSpeechToText : startSpeechToText}
                        color={isRecording ? "danger" : "primary"}
                        className="absolute right-10 top-1/2 transform -translate-y-1/2 w-[40px] h-[40px] flex items-center justify-center rounded-full"
                    >
                        <MdMic size={20} />
                    </Button>
                </div>
            </CardBody>
            <CardFooter>
                <Button
                    isDisabled={value.length <= 1}
                    isLoading={loading}
                    color="primary"
                    onPress={() => {
                        getQuery();
                        onOpen();
                        setValue("");
                    }}
                >
                    Query
                </Button>
                <Spacer x={5} />
                {showError && (
                    <h2>This feature is still in Beta - try again?</h2>
                )}
                <Modal
                    isOpen={isOpen && queryLoaded}
                    onOpenChange={onOpenChange}
                    placement="top-center"
                    className="text-black h-100vh"
                    size="full">
                    <ModalContent>
                        {(onClose: any) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">Query Results</ModalHeader>
                                <TableResponse query={query!} />
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </CardFooter>
        </Card>
    );
}
