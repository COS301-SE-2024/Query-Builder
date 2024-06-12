import "../../app/globals.css"
import "../Authentication/Authentication.css"
import React, { useState, useEffect } from "react";
import {Button, Card, CardBody, CardHeader, Input, input} from "@nextui-org/react";
import PhoneInput, { formatPhoneNumber, formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input';


export default function UserSettings(){

    const [updateFirstName, setUpdateFirstName] = useState('');
    const [updateLastName, setUpdateLastName] = useState('');
    const [updateEmail, setUpdateEmail] = useState('');
    const [updatePhone, setUpdatePhone] = useState('');
    const [updatePassword, setUpdatePassword] = useState('');
    const [updateFirstNameHasBeenFocused, setUpdateFirstNameHasBeenFocused] = useState(false);
    const [updateLastNameHasBeenFocused, setUpdateLastNameHasBeenFocused] = useState(false);
    const [updateEmailHasBeenFocused, setUpdateEmailHasBeenFocused] = useState(false);
    const [updatePhoneHasBeenFocused, setUpdatePhoneHasBeenFocused] = useState(false);
    const [updatePasswordBeenFocused, setUpdatePasswordHasBeenFocused] = useState(false);

    const validateEmail = (value:any) => value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

    const isUpdateEmailInvalid = React.useMemo(() => {
        if (updateEmail === "") return true;
    
        return validateEmail(updateEmail) ? false : true;
      }, [updateEmail]);
  
      const isUpdatePasswordInvalid = React.useMemo(() => {
          if (updatePassword === "") return true;
      
          return false;
      }, [updatePassword]);
  
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
                <CardHeader><div className="user-management-options">Options</div></CardHeader>
                <CardBody>
                        <div className="infield">
                            <Input
                                isRequired
                                label="First Name"
                                variant="bordered"
                                onValueChange={setUpdateFirstName}
                                onFocus={() => {setUpdatePasswordHasBeenFocused(false); setUpdateEmailHasBeenFocused(false);setUpdateFirstNameHasBeenFocused(true);setUpdateLastNameHasBeenFocused(false);setLoginPasswordHasBeenFocused(false); setLoginEmailHasBeenFocused(false);setUpdatePhoneHasBeenFocused(false);}}
                                isInvalid={isUpdateFirstNameInvalid && updateFirstNameHasBeenFocused}
                                color={!updateFirstNameHasBeenFocused ? "primary" : isUpdateFirstNameInvalid ? "danger" : "success"}
                                errorMessage="Please enter a username"
                            />
                        </div>
                        <div className="infield">
                            <Input
                                isRequired
                                label="Last Name"
                                variant="bordered"
                                onValueChange={setUpdateLastName}
                                onFocus={() => {setUpdatePasswordHasBeenFocused(false); setUpdateEmailHasBeenFocused(false);setUpdateFirstNameHasBeenFocused(false);setUpdateLastNameHasBeenFocused(true);setLoginPasswordHasBeenFocused(false); setLoginEmailHasBeenFocused(false);setUpdatePhoneHasBeenFocused(false);}}
                                isInvalid={isUpdateLastNameInvalid && updateLastNameHasBeenFocused}
                                color={!updateLastNameHasBeenFocused ? "primary" : isUpdateLastNameInvalid ? "danger" : "success"}
                                errorMessage="Please enter a username"
                            />
                        </div>
                        <div className="infield">
                            <Input
                                isRequired
                                label="Email"
                                variant="bordered"
                                type="email"
                                onValueChange={setUpdateEmail}
                                onFocus={() => {setUpdatePasswordHasBeenFocused(false); setUpdateEmailHasBeenFocused(true);setUpdateFirstNameHasBeenFocused(false);setUpdateLastNameHasBeenFocused(false);setLoginPasswordHasBeenFocused(false); setLoginEmailHasBeenFocused(false);setUpdatePhoneHasBeenFocused(false);}}
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
                                onChange={setUpdatePhone}
                                withCountryCallingCode
                                onValueChange={setUpdatePhone}
                                color={!updatePhoneHasBeenFocused ? "primary" : (updatePhone? (!isValidPhoneNumber(updatePhone) ? "danger" : "success"):"danger")}
                                onFocus={() => {setUpdatePasswordHasBeenFocused(false); setUpdateEmailHasBeenFocused(false);setUpdateFirstNameHasBeenFocused(false);setUpdateLastNameHasBeenFocused(false);setLoginPasswordHasBeenFocused(false); setLoginEmailHasBeenFocused(false);setUpdatePhoneHasBeenFocused(true);}}
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