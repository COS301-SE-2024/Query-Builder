import "../../app/globals.css"
import React, { useState, useEffect } from "react";
import {Button, Card, CardBody, CardHeader, Input, input} from "@nextui-org/react";
import PhoneInput, { formatPhoneNumber, formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input';


export default function UserSettings(){

    return (
        <>
            <Card
            isBlurred
            fullWidth>
                <CardHeader >Options</CardHeader>
                <CardBody>Display</CardBody>
            </Card>
        </>
    )

}