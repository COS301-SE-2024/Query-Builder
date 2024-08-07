import "../../app/globals.css"
import "../Authentication/Authentication.css"
import './UserSettings.css';
import React, { useState, useEffect } from "react";
import {Button, Card, CardBody, CardFooter, CardHeader, Input, Image} from "@nextui-org/react";
import {EditIcon} from "../OrganisationManagement/EditIcon";
import PhoneInput, { formatPhoneNumber, formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { createClient } from "./../../utils/supabase/client";

interface UpdateUserPersonalDetails {
    user_id?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    profile_photo?: string;
}

const getToken = async () => {
    const supabase = createClient();
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    return token;
};

export default function UserSettings(){
    const [initialFirstName, setInitialFirstName] = useState('');
    const [initialLastName, setInitialLastName] = useState('');
    const [initialEmail, setInitialEmail] = useState('');
    const [initialPhone, setInitialPhone] = useState('');
    const [initialProfilePicture, setInitialProfilePicture] = useState('');
    const [updateFirstName, setUpdateFirstName] = useState('');
    const [updateLastName, setUpdateLastName] = useState('');
    const [updatePhone, setUpdatePhone] = useState('');
    const [updateEmail, setUpdateEmail] = useState('');

    // get user information with JWT token
   

    useEffect(() => {
        async function getUserInfo() {

            try {
                let response = await fetch(`http://${process.env.BACKEND_URL}/api/user-management/get-user`, {
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
                let json = (await response.json()).data[0];
                console.log(json);
                setInitialFirstName(json.first_name);
                setUpdateFirstName(json.first_name);
                setInitialLastName(json.last_name);
                setUpdateLastName(json.last_name);
                setInitialPhone(json.phone);
                setUpdatePhone(json.phone);
                setInitialEmail(json.email);
                setUpdateEmail(json.email);
                setInitialProfilePicture(json.profile_photo);
                setProfilePicURL(json.profile_photo);
            } catch (error) {
                console.error("Failed to fetch user info:", error);
            }
        }

        getUserInfo();
    }, []);

    // Updated fields
    

    const [updateFirstNameHasBeenFocused, setUpdateFirstNameHasBeenFocused] = useState(false);
    const [updateLastNameHasBeenFocused, setUpdateLastNameHasBeenFocused] = useState(false);
    const [updatePhoneHasBeenFocused, setUpdatePhoneHasBeenFocused] = useState(false);
    const [updateEmailHasBeenFocused, setUpdateEmailHasBeenFocused] = useState(false);
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
        let updatedDetails: UpdateUserPersonalDetails = {};

        if (updateFirstName === initialFirstName && updateLastName === initialLastName && initialProfilePicture == profilePicURL ) {
            return;
        }
        
        if (updateFirstName !== initialFirstName){
            updatedDetails.first_name = updateFirstName;
        }

        if (updateLastName !==  initialLastName){
            updatedDetails.last_name = updateLastName;
        }

        if (profilePicURL !== initialProfilePicture){
            updatedDetails.profile_photo = profilePicURL;
        }

        console.log(updatedDetails);

        let response = await fetch(`http://${process.env.BACKEND_URL}/api/user-management/update-user`, {
            // credentials: "include",
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

    const updateEmailFunction = async() => {
        let updatedDetails: UpdateUserPersonalDetails = {};
        
        if (updateEmail == initialEmail){
            return;
        }
        else {
            updatedDetails.email = updateEmail;
        }

        console.log(updatedDetails);

        let response = await fetch(`http://${process.env.BACKEND_URL}/api/user-management/update-user-email`, {
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

    const updatePhoneNumber = async() => {
        let phoneNumber;
        
        if (updatePhone == initialPhone){
            phoneNumber = initialPhone;
        }
        else {
            phoneNumber = updatePhone;
        }


        let updatedDetails = {
            phone: phoneNumber
        };

        console.log(updatedDetails);

        let response = await fetch(`http://${process.env.BACKEND_URL}/api/user-management/update-user-phone`, {
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

    const validateEmail = (value: any) =>
        value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

    const isUpdateEmailInvalid = React.useMemo(() => {
        if (updateEmail === '') return true;
    
        return validateEmail(updateEmail) ? false : true;
    }, [updateEmail]);

    const [profilePic, setProfilePic] = useState('');
    const [file, setFile] = useState(null);
    const [profilePicURL, setProfilePicURL] = useState('');

    useEffect(() => {
        if (file) {
            updateProfilePicture();
        }
    }, [file]);

    const handleProfilePicChange = async (event:any) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = () => {
                setProfilePic(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
            setFile(selectedFile);
        }
    };

    const updateProfilePicture = async() => {
        if(file != null) {
            const formData = new FormData();
            formData.append('file', file);
            console.log(formData.get('file'));
  
            let response = await fetch(`http://${process.env.BACKEND_URL}/api/user-management/upload-profile-photo`, {
                method: "POST",
                headers: {
                'Authorization': 'Bearer ' + await getToken()
                },
                body: formData
            }).then((response) => {
                console.log(response);
                response.json().then((data) => {
                    setProfilePicURL(data.publicUrl);
                });
            });
        }
    };

    const renderUserDetails = React.useCallback(() => {
        return(<>
            <Card
            fullWidth
            className="m-1 lg:pl-10 lg:pr-20">
                <CardBody className="mt-2 mb-2">
                    <div className="flex flex-col">
                        <div className="infield flex justify-center relative pb-4"  >
                            <Image
                                className="orgLogo rounded-full"
                                width={200}
                                height={100}
                                alt="User Profile Picture"
                                src={profilePicURL}
                            />
                    
                            <div className="flex flex-col justify-end absolute bottom-0">
                                <label className="custom-file-upload bg-white p-1 border-2 border-slate-600 rounded-full">
                                    <input
                                        data-testid="file-input"
                                        type="file"
                                        accept=".jpg,.jpeg,.png"
                                        onInput={(event) => handleProfilePicChange(event)}
                                    />
                                    <EditIcon/>
                                </label>
                            </div>
                        </div>
                    </div>
            
                </CardBody>

                <CardHeader><div className="user-management-options">Personal Details</div></CardHeader>
                <CardBody>
                        <div className="infield">
                            <Input
                                // isRequired
                                label="First Name"
                                defaultValue={initialFirstName}
                                variant="bordered"
                                placeholder="First Name"
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
                                defaultValue={initialLastName}
                                placeholder="Last Name"
                                onValueChange={setUpdateLastName}
                                onFocus={() => {setUpdateFirstNameHasBeenFocused(false);setUpdateLastNameHasBeenFocused(true);setUpdatePhoneHasBeenFocused(false)}}
                                isInvalid={isUpdateLastNameInvalid && updateLastNameHasBeenFocused}
                                color={!updateLastNameHasBeenFocused ? "primary" : isUpdateLastNameInvalid ? "danger" : "success"}
                                errorMessage="Please enter a last name"
                            />
                        </div>
                </CardBody>
                <CardHeader><div className="user-management-options">Contact Details</div></CardHeader>
                <CardBody>
                    <div className="infield">
                        <PhoneInput
                            international
                            label="Phone Number"
                            variant="bordered"
                            inputComponent={Input}
                            value={initialPhone}
                            onValueChange={setUpdatePhone}
                            onChange={(value) => setUpdatePhone(value as string)}
                            withCountryCallingCode
                            color={
                            !updatePhoneHasBeenFocused
                                ? 'primary'
                                : updatePhone
                                ? !isValidPhoneNumber(updatePhone)
                                    ? 'danger'
                                    : 'success'
                                : 'danger'
                            }
                            onFocus={() => {
                            setUpdatePhoneHasBeenFocused(true);
                            }}
                            isInvalid={
                            (updatePhone ? !isValidPhoneNumber(updatePhone) : true) &&
                            updatePhoneHasBeenFocused
                            }
                            errorMessage="Please enter a valid phone number"
                        />
                    </div>
                </CardBody>

                <CardHeader><div className="user-management-options">Email Address</div></CardHeader>
                <CardBody>
                    <div className="infield">
                    <Input
                        isRequired
                        label="Email"
                        variant="bordered"
                        type="email"
                        placeholder={initialEmail}
                        onValueChange={setUpdateEmail}
                        onFocus={() => {
                            setUpdateEmailHasBeenFocused(true);
                        }}
                        isInvalid={
                        isUpdateEmailInvalid && updateEmailHasBeenFocused
                        }
                        color={
                        !updateEmailHasBeenFocused
                            ? 'primary'
                            : isUpdateEmailInvalid && updateEmailHasBeenFocused
                            ? 'danger'
                            : 'success'
                        }
                        errorMessage="Please enter a valid email"
                    />
                    </div>

                </CardBody>
                <CardBody>
                        <Button 
                            color="primary"  
                            onClick={() => {
                                updateQuery();
                                updatePhoneNumber();
                                updateEmailFunction();
                            }}
                        >
                            Update
                        </Button>
                </CardBody>
            </Card>
        </>);

    }, [initialFirstName, initialLastName, initialEmail, initialPhone]);

    return (
        <>{renderUserDetails()}</>
        
    );

}