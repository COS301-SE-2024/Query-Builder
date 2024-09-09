import "../../app/globals.css"
import "../Authentication/Authentication.css"
import './UserSettings.css';
import React, { useState, useEffect } from "react";
import { Button, Card, CardBody, CardFooter, CardHeader, Input, Image } from "@nextui-org/react";
import { EditIcon } from "../OrganisationManagement/EditIcon";
import { createClient } from "./../../utils/supabase/client";
import toast, { Toaster } from 'react-hot-toast';

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

export default function UserSettings() {
    const [initialFirstName, setInitialFirstName] = useState('');
    const [initialLastName, setInitialLastName] = useState('');
    const [initialEmail, setInitialEmail] = useState('');
    const [initialProfilePicture, setInitialProfilePicture] = useState('');
    const [updateFirstName, setUpdateFirstName] = useState('');
    const [updateLastName, setUpdateLastName] = useState('');
    const [updateEmail, setUpdateEmail] = useState('');
    const [profilePic, setProfilePic] = useState('');
    const [file, setFile] = useState(null);
    const [profilePicURL, setProfilePicURL] = useState('');
    const [loading, setLoading] = React.useState(false);


    // get user information with JWT token


    useEffect(() => {
        async function getUserInfo() {

            try {
                let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-management/get-user`, {
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

    const updateAll = async () => {
        // setLoading(true);
        await updateQuery();
        await updateEmailFunction();
        await updateProfileUrl();
        setLoading(false);
    };

    const updateQuery = async () => {

        let updatedDetails: UpdateUserPersonalDetails = {};

        if (updateFirstName == initialFirstName && updateLastName == initialLastName) {
            return;
        }

        if (updateFirstName != initialFirstName) {
            updatedDetails.first_name = updateFirstName;
        }

        if (updateLastName != initialLastName) {
            updatedDetails.last_name = updateLastName;
        }

        console.log(updatedDetails);

        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-management/update-user`, {
            // credentials: "include",
            method: "PATCH",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify(updatedDetails)
        }).then(async (response) => {
            if (response.status === 200 || response.status === 201) {
                if (updateFirstName != initialFirstName) {
                    setInitialFirstName(updateFirstName);
                }

                if (updateLastName != initialLastName) {
                    setInitialLastName(updateLastName);
                }
            }
        });
        // console.log(response)
    };

    const updateProfileUrl = async () => {
        let updatedDetails: UpdateUserPersonalDetails = {};

        if (initialProfilePicture == profilePicURL) {
            return;
        }

        if (profilePicURL != initialProfilePicture) {
            updatedDetails.profile_photo = profilePicURL;
        }

        console.log(updatedDetails);

        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-management/update-user`, {
            // credentials: "include",
            method: "PATCH",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify(updatedDetails)
        });
        // console.log(response)

    };

    const updateEmailFunction = async () => {
        let updatedDetails: UpdateUserPersonalDetails = {};

        if (updateEmail == initialEmail) {
            return;
        }
        else {
            updatedDetails.email = updateEmail;
        }

        console.log(updatedDetails);

        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-management/update-user-email`, {
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



    useEffect(() => {
        if (file) {
            updateProfilePicture();
        }
    }, [file]);

    const handleProfilePicChange = async (event: any) => {
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

    const updateProfilePicture = async () => {
        if (file != null) {
            const formData = new FormData();
            formData.append('file', file);
            console.log(formData.get('file'));

            let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-management/upload-profile-photo`, {
                method: "POST",
                headers: {
                    'Authorization': 'Bearer ' + await getToken()
                },
                body: formData
            }).then(async (response) => {
                // console.log((await response.json()).publicUrl);
                setProfilePicURL((await response.json()).publicUrl);
                // response.json().then((data) => {
                //     console.log(data);
                //     setProfilePicURL(data.publicUrl);
                // });
            });
        }
    };

    const renderUserDetails = React.useCallback(() => {
        return (<>
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
                                    <EditIcon />
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
                            placeholder={initialFirstName}
                            onValueChange={setUpdateFirstName}
                            onFocus={() => { setUpdateFirstNameHasBeenFocused(true); setUpdateLastNameHasBeenFocused(false); }}
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
                            placeholder={initialLastName}
                            onValueChange={setUpdateLastName}
                            onFocus={() => { setUpdateFirstNameHasBeenFocused(false); setUpdateLastNameHasBeenFocused(true); }}
                            isInvalid={isUpdateLastNameInvalid && updateLastNameHasBeenFocused}
                            color={!updateLastNameHasBeenFocused ? "primary" : isUpdateLastNameInvalid ? "danger" : "success"}
                            errorMessage="Please enter a last name"
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
                        isLoading={loading}
                        onClick={() => {
                            setLoading(true);
                            toast.promise(
                                updateAll(),
                                {
                                    loading: 'Saving...',
                                    success: 'Successfully saved!',
                                    error: (err) => `${err || "Unexpected error while saving, please try again!"}`,
                                }
                            );
                        }}
                    >
                        Update
                    </Button>
                </CardBody>
            </Card>
        </>);

    }, [initialFirstName, initialLastName, initialEmail, profilePicURL, updateAll]);

    return (
        <>{renderUserDetails()}</>

    );

}