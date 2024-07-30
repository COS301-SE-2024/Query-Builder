import "../../app/globals.css"
import "../Authentication/Authentication.css"
import React, { useState, useEffect } from "react";
import {Button, Image, Spacer, Card, CardBody, CardHeader, Input, Tabs, Tab, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Tooltip, getKeyValue} from "@nextui-org/react";
import { createClient } from "./../../utils/supabase/client";
import {DeleteIcon} from "./DeleteIcon";
import { useParams } from 'next/navigation'
import EditUserModal from "./EditUserModal";

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
    let [profilePicURL, setProfilePicURL] = useState(initialOrgLogo);

    const isUpdateOrgNameInvalid = React.useMemo(() => {
        if (updateOrgName === "") return true;
    
        return false;
    }, [updateOrgName]);

    const getOrganisationInfo = async () => {

        try {
            let response = await fetch("http://localhost:55555/api/org-management/get-org", {
                method: "PUT",
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await getToken()
                },
                body: JSON.stringify({
                    org_id:orgServerID
                })
            })
            
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            let orgData = (await response.json()).data[0];
            console.log(orgData);
            setInitialOrgName(orgData.name);
            setInitialOrgLogo(orgData.logo);
            setOrgMembers(orgData.org_members);
            setProfilePicURL(initialOrgLogo);
        } catch (error) {
            console.error("Failed to fetch organisation info:", error);
        }
    }

    // TODO: get members
    async function getMembers() {
    }


    useEffect(() => {
        getOrganisationInfo();
    }, []);

    useEffect(() => {
        setUpdateOrgName(initialOrgName);
    }, [initialOrgName]);

    useEffect(() => {
        setProfilePic(initialOrgLogo);
    }, [initialOrgLogo]);
   
    // // Updated fields
    const updateQuery = async() => {
        let orgName;
        let logoURL;
        
        if (updateOrgName == initialOrgName){
            orgName = initialOrgName;
        }
        else {
            orgName = updateOrgName;
        }

        if (profilePicURL == initialOrgLogo){
            logoURL = initialOrgLogo;
        }
        else {
            logoURL = profilePicURL;
        }

        let updatedDetails = {
            name: orgName,
            logo: logoURL,
        };

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
        const cellValue = user[columnKey];
    
        switch (columnKey) {
          case "name":
            return (
              <User
                avatarProps={{radius: "lg", src: user.avatar}}
                description={user.email}
                name={cellValue}
              >
                {user.email}
              </User>
            );
          case "role":
            return (
              <div className="flex flex-col">
                <p className="text-bold text-sm capitalize">{cellValue}</p>
                <p className="text-bold text-sm capitalize text-default-400">{user.team}</p>
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
            return cellValue;
        }
      }, []);

      const columns = [
        {name: "NAME", uid: "name"},
        {name: "ROLE", uid: "role"},
        {name: "STATUS", uid: "status"},
        {name: "ACTIONS", uid: "actions"},
      ];
      
      const users = [
        {
          id: 1,
          name: "Tony Reichert",
          role: "CEO",
          team: "Management",
          status: "active",
          age: "29",
          avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
          email: "tony.reichert@example.com",
        },
        {
          id: 2,
          name: "Zoey Lang",
          role: "Technical Lead",
          team: "Development",
          status: "paused",
          age: "25",
          avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
          email: "zoey.lang@example.com",
        }];

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
                            <div className="infield">
                                <Input
                                    // isRequired
                                    label="Organisation Name"
                                    defaultValue={initialOrgName}
                                    variant="bordered"
                                    placeholder={initialOrgName}
                                    onValueChange={setUpdateOrgName}
                                    onFocus={() => {setUpdateOrgNameHasBeenFocused(true);}}
                                    isInvalid={isUpdateOrgNameInvalid && updateOrgNameHasBeenFocused}
                                    color={!updateOrgNameHasBeenFocused ? "primary" : isUpdateOrgNameInvalid ? "danger" : "success"}
                                    errorMessage="Please enter the Organisation's name"
                                />
                            </div>
                            <div className="infield">
                                {/* {<>profilePicURL == "" ? (setProfilePicURL("https://img.icons8.com/?size=100&id=ABBSjQJK83zf&format=png&color=000000")):()</>} */}
                                <Image
                                    className="orgLogo"
                                    width={300}
                                    height={200}
                                    alt="Organisation Logo"
                                    src={profilePicURL}
                                />
                                <Spacer y={2}/>
                                <input
                                    data-testid="file-input"
                                    type="file"
                                    accept=".jpg,.jpeg"
                                    onInput={(event) => handleProfilePicChange(event)}
                                />

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
                                    <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                                        {column.name}
                                    </TableColumn>
                                    )}
                                </TableHeader>
                                <TableBody items={users}>
                                    {(item) => (
                                    <TableRow key={item.id}>
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
                        </CardBody>
                    </Card>  
                    </Tab>
                </Tabs>
                </div>  
        </>
    )

}