import "../../app/globals.css"
import "../Authentication/Authentication.css"
import React, { useState, useEffect } from "react";
import {Button, Card, CardBody, CardHeader, Input, input} from "@nextui-org/react";
import PhoneInput, { formatPhoneNumber, formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { createClient } from "./../../utils/supabase/client";
import ImageUploading, { ImageListType } from 'react-images-uploading';

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
            setInitialPhone(json.profile_data[0].phone);
            setInitialEmail(json.profile_data[0].email);
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
    const [updatePhone, setUpdatePhone] = useState(initialPhone);
    const [updateEmail, setUpdateEmail] = useState(initialEmail);

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

    const updateEmailFunction = async() => {
        let email;
        
        if (updateEmail == initialEmail){
            email = initialEmail;
        }
        else {
            email = updateEmail;
        }


        let updatedDetails = {
            email: updateEmail
        };

        console.log(updatedDetails);

        let response = await fetch("http://localhost:55555/api/user-management/update-user-email", {
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

        let response = await fetch("http://localhost:55555/api/user-management/update-user-phone", {
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

    const updateProfilePicture = async() => {

    };

    const validateEmail = (value: any) =>
        value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

    const isUpdateEmailInvalid = React.useMemo(() => {
        if (updateEmail === '') return true;
    
        return validateEmail(updateEmail) ? false : true;
    }, [updateEmail]);

    const [images, setImages] = React.useState([]);
    const maxNumber = 1;

    const onChange = (
        imageList: ImageListType,
        addUpdateIndex: number[] | undefined
      ) => {
        // data for submit
        console.log(imageList, addUpdateIndex);
        setImages(imageList as never[]);
      };

    return (
        <>
            <Card
            fullWidth>
                <CardHeader><div className="user-management-options">Change User's Personal Details</div></CardHeader>
                <CardBody>
                        <div className="infield">
                            <Input
                                // isRequired
                                label="First Name"
                                defaultValue={initialFirstName}
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
                                defaultValue={initialLastName}
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

            <Card
            fullWidth>
                <CardHeader><div className="user-management-options">Change User's Contact Details</div></CardHeader>
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
                        <Button 
                            color="primary"  
                            onClick={() => updatePhoneNumber()}
                        >
                            Update
                        </Button>
                </CardBody>
            </Card>

            <Card
            fullWidth>
                <CardHeader><div className="user-management-options">Change User's Email</div></CardHeader>
                <CardBody>
                    <div className="infield">
                    <Input
                        isRequired
                        label="Email"
                        variant="bordered"
                        type="email"
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
                        <Button 
                            color="primary"  
                            onClick={() => updateEmailFunction()}
                        >
                            Update
                        </Button>
                </CardBody>
            </Card>
            <Card
            fullWidth>
                <CardHeader><div className="user-management-options">Profile Picture</div></CardHeader>
                <CardBody>
                    <div className="infield">
                    <ImageUploading
                        value={images}
                        onChange={onChange}
                        maxNumber={maxNumber}
                        dataURLKey="data_url"
                    >
                        {({
                        imageList,
                        onImageUpload,
                        onImageRemoveAll,
                        onImageUpdate,
                        onImageRemove,
                        isDragging,
                        dragProps,
                        }) => (
                        // write your building UI
                        <div className="upload__image-wrapper">
                            {(imageList.length < 1)?
                            (<>
                                <button
                                style={isDragging ? { color: 'red' } : undefined}
                                onClick={onImageUpload}
                                {...dragProps}
                                >
                                Add a profile picture
                                </button> 
                            </>) : 
                            (
                                <>
                                    {imageList.map((image, index) => (
                                    <div key={index} className="image-item">
                                        <img src={image['data_url']} alt="" width="100" />
                                        <div className="image-item__btn-wrapper">
                                        <button onClick={() => onImageUpdate(index)}>Update</button>
                                        <button onClick={() => onImageRemove(index)}>Remove</button>
                                        </div>
                                    </div>
                                    ))}
                                </>)}
                        </div>
                        )}
                    </ImageUploading>
                    </div>
                        <Button 
                            color="primary"  
                            onClick={() => updateEmailFunction()}
                        >
                            Update
                        </Button>
                </CardBody>
            </Card>
        </>
    )

}