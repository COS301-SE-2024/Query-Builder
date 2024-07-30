import "../../app/globals.css"
import "../Authentication/Authentication.css"
import './OrganisationManagement.css';
import React, { useState, useEffect } from "react";
import {Button, Image, Spacer, Card, CardBody, CardHeader, Input, Tabs, Tab, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Tooltip, getKeyValue} from "@nextui-org/react";
import { createClient } from "./../../utils/supabase/client";
import {DeleteIcon} from "./DeleteIcon";
import { useParams } from 'next/navigation'
import EditUserModal from "./EditUserModal";
import {EditIcon} from "./EditIcon";


interface UpdateOrganisation {
    org_id: string;
    name?: string;
    logo?: string;
  }

const getToken = async () => {

    const supabase = createClient();
    const token = (await supabase.auth.getSession()).data.session?.access_token;
  
    return token;
};

export default function OrganisationManagement(){

    const {orgServerID} = useParams<{orgServerID: string}>();

    let [initialOrgName, setInitialOrgName] = useState('');
    let [initialOrgLogo, setInitialOrgLogo] = useState('');
    let [orgMembers, setOrgMembers] = useState(null);
    let [updateOrgName, setUpdateOrgName] = useState(initialOrgName);
    let [updateOrgNameHasBeenFocused, setUpdateOrgNameHasBeenFocused] = useState(false);
    let [profilePicURL, setProfilePicURL] = useState('');

    const isUpdateOrgNameInvalid = React.useMemo(() => {
        if (updateOrgName === "") return true;
    
        return false;
    }, [updateOrgName]);

    useEffect(() => {
        // Fetch organisation info on initial render
        const getOrganisationInfo = async () => {
          try {
            let response = await fetch("http://localhost:55555/api/org-management/get-org", {
              method: "PUT",
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await getToken(),
              },
              body: JSON.stringify({ org_id: orgServerID }),
            });
    
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
    
            let orgData = (await response.json()).data[0];
            setInitialOrgName(orgData.name);
            setInitialOrgLogo(orgData.logo);
            // setOrgMembers(orgData.org_members);
            setProfilePicURL(orgData.logo);
            setUpdateOrgName(orgData.name);
          } catch (error) {
            console.error("Failed to fetch organisation info:", error);
          }
        };
    
        getOrganisationInfo();
        getMembers();
      }, [orgServerID]);

    // TODO: get members
    async function getMembers() {
      try {
        let response = await fetch("http://localhost:55555/api/org-management/get-members", {
          method: "PUT",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken(),
          },
          body: JSON.stringify({ org_id: orgServerID, }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        let membersData = ((await response.json()).data);
        console.log(membersData);
        setOrgMembers(membersData);
      } catch (error) {
        console.error("Failed to fetch members of the organisation:", error);
      }
    }
   
    // // Updated fields
    const updateQuery = async() => {

        let updatedDetails: UpdateOrganisation = {
            org_id: orgServerID,
        };

        if(updateOrgName === initialOrgName && profilePicURL === initialOrgLogo){
            console.log("No Updates")
            return;
        }
        
        if (updateOrgName !== initialOrgName){
            updatedDetails.name = updateOrgName;   
        }

        if (profilePicURL !== initialOrgLogo){
            updatedDetails.logo = profilePicURL;
        }
        console.log(updatedDetails);

        let response = await fetch("http://localhost:55555/api/org-management/update-org", {
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

    const renderCell = React.useCallback((user, columnKey) => {
        // const cellValue = user[columnKey];
    
        switch (columnKey) {
          case "name":
            return (
              <User
                avatarProps={{radius: "lg", src: user.profiles.profile_photo}}
                description={user.profiles.email}
                name={user.profiles.first_name + " " + user.profiles.last_name}
              >
                {user.profiles.email}
              </User>
            );
          case "role":
            return (
              <div className="flex flex-col">
                <p className="text-bold text-sm capitalize">{user.user_role}</p>
              </div>
            );
          case "actions":
            return (
              <div className="relative flex items-center gap-2">
                <Tooltip content="Edit user">
                  <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                    <EditUserModal org_id={orgServerID} user_id={user.id} on_add={getMembers} />
                  </span>
                </Tooltip>
                <Tooltip color="danger" content="Delete user">
                  <span className="text-lg text-danger cursor-pointer active:opacity-50">
                    <DeleteIcon />
                  </span>
                </Tooltip>
              </div>
            );
          default:
            return user.profiles.phone;
        }
      }, []);

      const columns = [
        {name: "NAME", uid: "name"},
        {name: "ROLE", uid: "role"},
        {name: "ACTIONS", uid: "actions"},
      ];

        const [profilePic, setProfilePic] = useState('');
        const [file, setFile] = useState(null);
    
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
      
                let response = await fetch("http://localhost:55555/api/user-management/upload-profile-photo", {
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

    return (
        <>
            <div className="flex w-full flex-col">
                <Tabs aria-label="Options">
                    <Tab key="orgInfo" title="Organisation Information">
                    <Card>
                        <CardHeader>
                            Organisation Settings
                        </CardHeader>
                        <CardBody>
                            <div className="flex flex-col">
                                <div className="infield flex justify-center relative pb-4"  >
                                    <Image
                                        className="orgLogo rounded-full"
                                        width={200}
                                        height={100}
                                        alt="Organisation Logo"
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
                                <Spacer y={2}/>
                                <div className="infield">
                                    <Input
                                        // isRequired
                                        label="Organisation Name"
                                        defaultValue={updateOrgName}
                                        variant="bordered"
                                        placeholder={updateOrgName}
                                        onValueChange={setUpdateOrgName}
                                        onFocus={() => {setUpdateOrgNameHasBeenFocused(true);}}
                                        isInvalid={isUpdateOrgNameInvalid && updateOrgNameHasBeenFocused}
                                        color={!updateOrgNameHasBeenFocused ? "primary" : isUpdateOrgNameInvalid ? "danger" : "success"}
                                        errorMessage="Please enter the Organisation's name"
                                    />
                                </div>
                            </div>
                            <Spacer y={2}/>
                            <Button 
                                color="primary"  
                                onClick={() => updateQuery()}
                            >
                                Update
                            </Button>
                        </CardBody>
                    </Card>  
                    </Tab>
                    <Tab key="orgMembers" title="Members">
                    <Card>
                        <CardBody>
                            <Table aria-label="Example table with custom cells">
                                <TableHeader columns={columns}>
                                    {(column) => (
                                    <TableColumn key={column.uid}>
                                        {column.name}
                                    </TableColumn>
                                    )}
                                </TableHeader>
                                <TableBody items={orgMembers}>
                                    {(item) => (
                                    <TableRow key={item.profiles.user_id} >
                                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                                    </TableRow>
                                    )}
                                </TableBody>
                            </Table>  
                        </CardBody>
                    </Card>  
                    </Tab>
                    <Tab key="orgDatabases" title="Databases">
                    <Card>
                        <CardBody>
                            TO BE ADDED
                            {/* TODO: Get end point to only show available databases in the organisation */}
                        </CardBody>
                    </Card>  
                    </Tab>
                </Tabs>
                </div>  
        </>
    )

}