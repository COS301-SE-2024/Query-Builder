import "../../app/globals.css"
import "../Authentication/Authentication.css"
import React, { useState, useEffect } from "react";
import {Button, Card, CardBody, CardHeader, Input, input} from "@nextui-org/react";
import PhoneInput, { formatPhoneNumber, formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input';


const getToken = () => {
    const storageKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}-auth-token`;
    const sessionDataString = localStorage.getItem(storageKey);
    const sessionData = JSON.parse(sessionDataString || "null");
    const token = sessionData?.access_token;
  
    console.log(token)
  
    return token;
};

export default function UserSettings(){

    // get user information with JWT token
    const getUserInfo = async () => {
        
    }

    // Initial Info
    const [initialFirstName, setInitialFirstName] = useState('');
    const [initialLastName, setInitialLastName] = useState('');
    const [initialEmail, setInitialEmail] = useState('');
    const [initialPhone, setInitialPhone] = useState('');
    // const [initialPassword, setInitialPassword] = useState('');

    getUserInfo();

    // Updated fields
    const [updateFirstName, setUpdateFirstName] = useState(initialFirstName);
    const [updateLastName, setUpdateLastName] = useState(initialLastName);
    const [updateEmail, setUpdateEmail] = useState(initialEmail);
    const [updatePhone, setUpdatePhone] = useState(initialPhone);
    // const [updatePassword, setUpdatePassword] = useState(initialPassword);
    const [updateFirstNameHasBeenFocused, setUpdateFirstNameHasBeenFocused] = useState(false);
    const [updateLastNameHasBeenFocused, setUpdateLastNameHasBeenFocused] = useState(false);
    const [updateEmailHasBeenFocused, setUpdateEmailHasBeenFocused] = useState(false);
    const [updatePhoneHasBeenFocused, setUpdatePhoneHasBeenFocused] = useState(false);
    // const [updatePasswordBeenFocused, setUpdatePasswordHasBeenFocused] = useState(false);

    const validateEmail = (value:any) => value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

    const isUpdateEmailInvalid = React.useMemo(() => {
        if (updateEmail === "") return true;
    
        return validateEmail(updateEmail) ? false : true;
      }, [updateEmail]);
  
    const isUpdateFirstNameInvalid = React.useMemo(() => {
        if (updateFirstName === "") return true;
    
        return false;
    }, [updateFirstName]);

    const isUpdateLastNameInvalid = React.useMemo(() => {
        if (updateLastName === "") return true;
    
        return false;
    }, [updateLastName]);

    return (
        <>
            <Card
            fullWidth>
                <CardHeader><div className="user-management-options">Change User Details</div></CardHeader>
                <CardBody>
                        <div className="infield">
                            <Input
                                isRequired
                                label="First Name"
                                variant="bordered"
                                onValueChange={setUpdateFirstName}
                                onFocus={() => {setUpdateEmailHasBeenFocused(false);setUpdateFirstNameHasBeenFocused(true);setUpdateLastNameHasBeenFocused(false);setUpdatePhoneHasBeenFocused(false)}}
                                isInvalid={isUpdateFirstNameInvalid && updateFirstNameHasBeenFocused}
                                color={!updateFirstNameHasBeenFocused ? "primary" : isUpdateFirstNameInvalid ? "danger" : "success"}
                                errorMessage="Please enter a first name"
                            />
                        </div>
                        <div className="infield">
                            <Input
                                isRequired
                                label="Last Name"
                                variant="bordered"
                                onValueChange={setUpdateLastName}
                                onFocus={() => {setUpdateEmailHasBeenFocused(false);setUpdateFirstNameHasBeenFocused(false);setUpdateLastNameHasBeenFocused(true);setUpdatePhoneHasBeenFocused(false)}}
                                isInvalid={isUpdateLastNameInvalid && updateLastNameHasBeenFocused}
                                color={!updateLastNameHasBeenFocused ? "primary" : isUpdateLastNameInvalid ? "danger" : "success"}
                                errorMessage="Please enter a last name"
                            />
                        </div>
                        <div className="infield">
                            <Input
                                isRequired
                                label="Email"
                                variant="bordered"
                                type="email"
                                onValueChange={setUpdateEmail}
                                onFocus={() => {setUpdateEmailHasBeenFocused(true);setUpdateFirstNameHasBeenFocused(false);setUpdateLastNameHasBeenFocused(false);setUpdatePhoneHasBeenFocused(false);}}
                                isInvalid={isUpdateEmailInvalid && updateEmailHasBeenFocused}
                                color={!updateEmailHasBeenFocused ? "primary" : (isUpdateEmailInvalid && updateEmailHasBeenFocused) ? "danger" : "success"}
                                errorMessage="Please enter a valid email"
                            />
                        </div>
                        <div className="infield">
                            <PhoneInput
                                international
                                label="Phone Number"
                                variant="bordered"  
                                inputComponent={Input}
                                value={updatePhone}
                                onValueChange={setUpdatePhone}
                                onChange={(value) => setUpdatePhone((value as string))}
                                withCountryCallingCode
                                color={!updatePhoneHasBeenFocused ? "primary" : (updatePhone? (!isValidPhoneNumber(updatePhone) ? "danger" : "success"):"danger")}
                                onFocus={() => {setUpdateEmailHasBeenFocused(false);setUpdateFirstNameHasBeenFocused(false);setUpdateLastNameHasBeenFocused(false);setUpdatePhoneHasBeenFocused(true);}}
                                isInvalid={(updatePhone ? (!isValidPhoneNumber(updatePhone)) : true)&& updatePhoneHasBeenFocused}
                                errorMessage="Please enter a valid phone number"
                            />
                        </div>
                        <Button 
                            color="primary"  
                            // onClick={() => sendQuery("sql", "select", selectedTableValue, selectedColValue, "")}
                        >
                            Update
                        </Button>
                </CardBody>
            </Card>
        </>
    )

}