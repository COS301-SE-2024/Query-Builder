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
        <div className="w-full h-[70%] flex flex-col gap-2 max-w-[80%] items-center">
    <Textarea
        className="w-[80%] h-[100%]"
        label="Please enter desired data"
        placeholder="Enter your description of desired data"
        value={value}
        onChange={(newVal) => setValue(newVal.target.value)}
    />
    <Button
        isDisabled={value.length <= 1}
        isLoading={loading}
        onClick={handleSubmit}
        color="primary"
        className="w-[80%]"
    >
        Query
    </Button>
</div>
    );
}