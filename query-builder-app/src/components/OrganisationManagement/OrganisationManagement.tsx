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

const getUser = async () => {
    const supabase = createClient();
    const loggedInUser = (await supabase.auth.getSession()).data.session?.user.id;
    // console.log((await supabase.auth.getSession()).data.session);
    return loggedInUser;
};

export default function OrganisationManagement(){

    const {orgServerID} = useParams<{orgServerID: string}>();
    let [loggedInUserID, setLoggedInUserID] = useState('');
    let [loggedInUserRole, setLoggedInUserRole] = useState('');
    let [initialOrgName, setInitialOrgName] = useState('');
    let [initialOrgLogo, setInitialOrgLogo] = useState('');
    let [orgMembers, setOrgMembers] = useState([]);
    let [updateOrgName, setUpdateOrgName] = useState('');
    let [updateOrgNameHasBeenFocused, setUpdateOrgNameHasBeenFocused] = useState(false);
    let [profilePicURL, setProfilePicURL] = useState('');
    let [hasAdminPermission, setHasAdminPermission] = useState(false);
    let [table, setTable] = useState('');

    async function getMembers() {
      try {
        let response = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/get-members`, {
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

        getUser().then((user) => {
          setLoggedInUserID(user as string);
          console.log(orgMembers);
          console.log(membersData);
          let role = membersData.find((orgMember:any) => orgMember.profiles.user_id === user).user_role;
          setLoggedInUserRole(role);
          // console.log(membersData.find((orgMember:any) => orgMember.profiles.user_id === user).user_role);
          if (role == "owner" || role == "admin") {
            setHasAdminPermission(true);
          }
        });

      } catch (error) {
        console.error("Failed to fetch members of the organisation:", error);
      }
    };


    const isUpdateOrgNameInvalid = React.useMemo(() => {
        if (updateOrgName === "") return true;
    
        return false;
    }, [updateOrgName]);

    useEffect(() => {
        // Fetch organisation info on initial render
        const getOrganisationInfo = async () => {
          try {
            let response = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/get-org`, {
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

        getMembers();
        
        getOrganisationInfo();
      }, []);


    // // Updated fields
    const updateQuery = async() => {

        let updatedDetails: UpdateOrganisation = {
            org_id: orgServerID,
        };

        if(updateOrgName == initialOrgName && profilePicURL == initialOrgLogo){
            console.log("No Updates")
            return;
        }
        
        if (updateOrgName != initialOrgName){
            updatedDetails.name = updateOrgName;   
        }

        if (profilePicURL != initialOrgLogo){
            updatedDetails.logo = profilePicURL;
        }
        console.log(updatedDetails);

        let response = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/update-org`, {
            method: "PATCH",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + await getToken()
            },
            body: JSON.stringify(updatedDetails)
        });
        console.log(response);
    };

    async function deleteUserFromOrg(userId: string){
      let response = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/remove-member`, {
          method: "DELETE",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken(),
          },
          body: JSON.stringify({ org_id: orgServerID, user_id: userId})
      })
      console.log(response);
    }

    async function deleteOrganisation(){
      let response = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/remove-org`, {
          method: "DELETE",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken(),
          },
          body: JSON.stringify({ org_id: orgServerID })
      })
      console.log(response);
    }

    const renderCell = React.useCallback((user:any, columnKey:any) => {
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
            if (hasAdminPermission) {
              
              if((user.user_role == "admin" || user.user_role == "member") && user.profiles.user_id !== loggedInUserID){
                return (
                  
                  <div className="relative flex items-center gap-2">
                    <Tooltip content="Edit user">
                      <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                        <EditUserModal org_id={orgServerID} user_id={user.profiles.user_id} on_add={getMembers} />
                      </span>
                    </Tooltip>
                    <Tooltip color="danger" content="Delete user">
                      <span className="text-lg text-danger cursor-pointer active:opacity-50">
                        <DeleteIcon onClick={() => deleteUserFromOrg(user.profiles.user_id)}/>
                      </span>
                    </Tooltip>
                  </div>
                );
              }
            }
            else{
              return(<></>);
            }
          default:
            return user.profiles.phone;
        }
      }, [hasAdminPermission, orgMembers]);

      const renderUpdatePage = React.useCallback(() => {
        console.log(loggedInUserRole);
        if  (hasAdminPermission && (loggedInUserRole == "owner" || loggedInUserRole == "Owner")) {
          return(
          <>
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
            <Spacer y={2}/>
            <Button 
                color="danger"  
                onClick={() => deleteOrganisation()}
            >
                Delete Organisation
            </Button>
          </>
          );
        }
        else{
          if(hasAdminPermission && loggedInUserRole == "admin"){
          return(
            <>
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
            <Spacer y={2}/>
            <Button 
                color="danger"  
                onClick={() => deleteUserFromOrg(loggedInUserID)}
            >
                Leave Organisation
            </Button>
          </>
          );
        }
        else{
          return(<>
            <div className="flex flex-col">
              <div className="infield flex justify-center relative pb-4"  >
                <Image
                    className="orgLogo rounded-full"
                    width={200}
                    height={100}
                    alt="Organisation Logo"
                    src={profilePicURL}
                />
              </div>
              <Spacer y={2}/>
              <div className="infield">
                <Input
                    // isRequired
                    isDisabled
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
                color="danger"  
                onClick={() => deleteUserFromOrg(loggedInUserID)}
            >
                Leave Organisation
            </Button>
          </>);
          }
        }
      }, [loggedInUserRole, hasAdminPermission, profilePicURL]);

      async function copyHashCode() {
        navigator.permissions.query({name: "notifications"}).then((result) => {
          if (result.state == "granted" || result.state == "prompt") {
            alert("Write access granted!");
          }
        });
        try {
          let hashCode;
          let response = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/create-hash`, {
            method: "POST",
            headers: {
                  'Authorization': 'Bearer ' + await getToken()
                },
                body: JSON.stringify({org_id: orgServerID})
            });
            console.log((await response.json()));
            hashCode = (await response.json()).data;
            try{
              await navigator.clipboard.writeText(hashCode);
              console.log('Content copied to clipboard');
            } catch (err) {
              console.error('Failed to copy: ', err);
              
            } 
        } catch(fetchError){
          console.error("Fetch error", fetchError);
        }
      }

      const renderJoinOrgHash = React.useCallback(() => {
        if(hasAdminPermission && (loggedInUserRole === 'admin' || loggedInUserRole === "owner")){
          return(
            <div className="m-auto mb-0 mt-0">
              <Button 
                color="primary"  
                onClick={() => copyHashCode()}
            >
                Share Organisation Code
            </Button>
            </div>
          );
        }
      },[hasAdminPermission]);

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
                formData.append('org_id', orgServerID);
                formData.append('file', file);
                // console.log(formData.get('file'));
      
                let response = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/upload-org-logo`, {
                    method: "POST",
                    headers: {
                    'Authorization': 'Bearer ' + await getToken()
                    },
                    body: formData
                }).then(async (response) => {
                    console.log(response);
                    setProfilePicURL((await response.json()).publicUrl);
                });
            }
        };

    return (
        <>
            <div className="flex w-full flex-col">
                <Spacer y={2}/>
                <div className="flex w-full flex-col">
                <div className="organisationHeader m-auto mt-0 mb-0 flex flex-col justify-center content-center ">
                    <Image
                      className="orgLogo md:rounded-1"
                      width={200}
                      height={100}
                      alt="Organisation Logo"
                      src={profilePicURL}
                    />
                    <Spacer y={2}/>
                    <span className="m-auto justify-center content-center text-2xl ">{updateOrgName}</span>
                </div>
                <Spacer y={2}/>
                    {renderJoinOrgHash()}
                <Spacer y={2}/>
                </div>
                <Tabs aria-label="Options" className="m-auto mb-0 mt-0">
                    <Tab key="orgInfo" aria-label="orgInfo" title="Organisation Information">
                    <Card>
                        <CardHeader>
                            Organisation Settings
                        </CardHeader>
                        <CardBody>
                          
                          {renderUpdatePage()}
                          
                        </CardBody>
                    </Card>  
                    </Tab>
                    <Tab key="orgMembers" aria-label="orgMembers" title="Members">
                    <Card>
                        <CardBody>

                        <Table aria-label="Organisation Members Table">
                          <TableHeader columns={columns}>
                              {(column) => (
                              <TableColumn key={column.uid}>
                                  {column.name}
                              </TableColumn>
                              )}
                          </TableHeader>
                          <TableBody items={orgMembers}>
                              {(item:any) => (
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