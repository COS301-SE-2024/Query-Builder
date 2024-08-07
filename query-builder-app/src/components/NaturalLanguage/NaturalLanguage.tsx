import React from "react";
import { Textarea, Button, ButtonGroup } from "@nextui-org/react";

export default function NaturalLanguage() {
    const [value, setValue] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = () => {
        setLoading(true);

        //Here we will do chatGPT stuff
    };

    return (
        <div className="w-full flex flex-row gap-2 max-w-[80%] items-center">
                <Textarea
                    label="Please enter desired data"
                    // labelPlacement="outside"
                    placeholder="Enter your description of desired data"
                    value={value}
                    onChange={(newVal) => setValue(newVal.target.value)}
                />
                <Button
                    isDisabled={value.length <= 1}
                    isLoading={loading}
                    onClick={handleSubmit}
                    color="primary"
                >
                    Query
                </Button>
        </div>
    );
}