import "../../app/globals.css"
import "../Authentication/Authentication.css"
import React, { useState, useEffect } from "react";
import {Button, Card, CardBody, CardHeader, Input, input} from "@nextui-org/react";
import PhoneInput, { formatPhoneNumber, formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input';
import { createClient } from "./../../utils/supabase/client";

const getToken = async () => {

    const supabase = createClient();
    const token = (await supabase.auth.getSession()).data.session?.access_token;
  
    return token;
};

export default function UserSettings(){
    const [initialFirstName, setInitialFirstName] = useState('');
    const [initialLastName, setInitialLastName] = useState('');
    // const [initialEmail, setInitialEmail] = useState('');
    // const [initialPhone, setInitialPhone] = useState('');
    // get user information with JWT token
    const getUserInfo = async () => {

        try {
            let response = await fetch("http://localhost:55555/api/user-management/get-user", {
                method: "GET",
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await getToken()
                },
            })
            
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            //   console.log((await response.json()));
            let json = await response.json();
            console.log(json.profile_data[0]);
            setInitialFirstName(json.profile_data[0].first_name);
            setInitialLastName(json.profile_data[0].last_name);
        } catch (error) {
            console.error("Failed to fetch user info:", error);
        }
    }

    useEffect(() => {
        getUserInfo();
    }, []);

    // Updated fields
    const [updateFirstName, setUpdateFirstName] = useState(initialFirstName);
    const [updateLastName, setUpdateLastName] = useState(initialLastName);
    const [updateFirstNameHasBeenFocused, setUpdateFirstNameHasBeenFocused] = useState(false);
    const [updateLastNameHasBeenFocused, setUpdateLastNameHasBeenFocused] = useState(false);
    const [updatePhoneHasBeenFocused, setUpdatePhoneHasBeenFocused] = useState(false);
    // const [updatePasswordBeenFocused, setUpdatePasswordHasBeenFocused] = useState(false);

  
    const isUpdateFirstNameInvalid = React.useMemo(() => {
        if (updateFirstName === "") return true;
    
        return false;
    }, [updateFirstName]);

    const isUpdateLastNameInvalid = React.useMemo(() => {
        if (updateLastName === "") return true;
    
        return false;
    }, [updateLastName]);

    const updateQuery = async() => {
        let fName;
        let lName;
        
        if (updateFirstName == initialFirstName){
            fName = initialFirstName;
        }
        else {
            fName = updateFirstName;
        }

        if (updateLastName == initialLastName){
            lName = initialLastName;
        }
        else {
            lName = updateLastName;
        }

        let updatedDetails = {
            first_name: fName,
            last_name:lName,
        };

        console.log(updatedDetails);

        let response = await fetch("http://localhost:55555/api/user-management/update-user", {
            credentials: "include",
            method: "PATCH",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify(updatedDetails)
        })
        console.log(response)
    };

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
                                placeholder={initialFirstName}
                                onValueChange={setUpdateFirstName}
                                onFocus={() => {setUpdateFirstNameHasBeenFocused(true);setUpdateLastNameHasBeenFocused(false);setUpdatePhoneHasBeenFocused(false)}}
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
                                placeholder={initialLastName}
                                onValueChange={setUpdateLastName}
                                onFocus={() => {setUpdateFirstNameHasBeenFocused(false);setUpdateLastNameHasBeenFocused(true);setUpdatePhoneHasBeenFocused(false)}}
                                isInvalid={isUpdateLastNameInvalid && updateLastNameHasBeenFocused}
                                color={!updateLastNameHasBeenFocused ? "primary" : isUpdateLastNameInvalid ? "danger" : "success"}
                                errorMessage="Please enter a last name"
                            />
                        </div>
                        <Button 
                            color="primary"  
                            onClick={() => updateQuery()}
                        >
                            Update
                        </Button>
                </CardBody>
            </Card>
        </>
    )

}