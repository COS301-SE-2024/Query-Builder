import "../../app/globals.css"
import "../Authentication/Authentication.css"
import './OrganisationManagement.css';
import React, { useState, useEffect } from "react";
import { AvatarIcon, Button, Checkbox, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Image, Spacer, Card, CardBody, CardHeader, Input, Tabs, Tab, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Tooltip, getKeyValue } from "@nextui-org/react";
import { createClient } from "./../../utils/supabase/client";
import { DeleteIcon } from "./DeleteIcon";
import { useParams } from 'next/navigation'
import EditUserModal from "./EditUserModal";
import { EditIcon } from "./EditIcon";
import { CheckIcon } from "./CheckIcon";
import { navigateToForm } from "../../app/serverActions";
import Link from 'next/link';
import toast from 'react-hot-toast';
import DatabaseCredentialsModal from "../DatabaseCredentialsModal/DatabaseCredentialsModal";
import MetaDataHandler from "../MetaDataHandler/MetaDataHandler";


interface UpdateOrganisation {
  org_id: string;
  name?: string;
  logo?: string;
}

interface Database {
  created_at: String;
  name: String;
  db_id: any;
  db_info: any;
  type: String;
}

interface Organisation {
  created_at: String;
  logo: String;
  name: String;
  org_id: String;
  db_envs: Database[];
  org_members: String[];
}

export interface User {
  user_id: string;
  full_name: string;
  profile_photo: string | null; // profileImage can be null
  access: boolean;
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

const DEFAULT_PROFILE_IMAGE = "https://via.placeholder.com/150/cccccc/FFFFFF?text=No+Image";

async function getDBAccessMembers(db_id: string) {
  let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/get-dbaccess-members`, {
    credentials: "include",
    method: "PUT",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + await getToken()
    },
    body: JSON.stringify({ db_id })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  let json = (await response.json()).data;
  return json;
}

export default function OrganisationManagement() {

  const { orgServerID } = useParams<{ orgServerID: string }>();
  let [loggedInUserID, setLoggedInUserID] = useState('');
  let [loggedInUserRole, setLoggedInUserRole] = useState('');
  let [initialOrgName, setInitialOrgName] = useState("");
  let [initialOrgLogo, setInitialOrgLogo] = useState("");
  let [orgMembers, setOrgMembers] = useState([]);
  let [updateOrgName, setUpdateOrgName] = useState("");
  let [updateOrgNameHasBeenFocused, setUpdateOrgNameHasBeenFocused] = useState(false);
  let [profilePicURL, setProfilePicURL] = useState('');
  let [hasAdminPermission, setHasAdminPermission] = useState(false);
  let [table, setTable] = useState('');
  let [hashCodeCopyText, setHashCodeCopyText] = useState('Share Join Code');
  let [errorGetMembers, setErrorGetMembers] = useState("");
  const [organisations, setOrganisations] = React.useState([]);
  const credentialsModalDisclosure = useDisclosure();
  const [currentDBServerID, setCurrentDBServerID] = React.useState('');
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [dbAccessID, setdbAccessID] = useState("");
  const [deleteDatabaseID, setDeleteDatabaseID] = useState("");
  const [databaseName, setDatabaseName] = useState("");
  const { isOpen: isDeleteDBOpen, onOpen: onDeleteDBOpen, onOpenChange: onDeleteDBOpenChange } = useDisclosure();
  const { isOpen: isDBAccessOpen, onOpen: onDBAccessOpen, onOpenChange: onDBAccessOpenChange } = useDisclosure(); // For the db access modal

  const handleCheckboxChange = async (dbID: string, user: User, isChecked: boolean) => {
    if (isChecked) {
      // Add the user object to the checkedUsers if it's checked
      try {
        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/give-db-access`, {
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken(),
          },
          body: JSON.stringify({ user_id: user.user_id, db_id: dbID, org_id: orgServerID, }),
        });


        if (!response.ok) {
          // console.log("YOURR ERROR " + (response.status) + " " + (response.statusText);
          if (response.status === 401) {
            toast.error("You are not authorized to update database access for a member!");
            return;
          }
          else {
            toast.error("Failed to update database access for a member. \nPlease try again!");
            return;
          }
        } else {
          toast.success("Successfully granted database access");
        }

      } catch (error) {
        toast.error("Unexpected error while trying to give member database access!");
      }
    } else {
      // Remove the user object from checkedUsers if it's unchecked
      try {
        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/remove-db-access`, {
          method: "DELETE",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken(),
          },
          body: JSON.stringify({ user_id: user.user_id, db_id: dbID, org_id: orgServerID, }),
        });


        if (!response.ok) {
          // console.log("YOURR ERROR " + (response.status) + " " + (response.statusText);
          if (response.status === 401) {
            toast.error("You are not authorized to update database access for a member!");
            return;
          }
          else {
            toast.error("Failed to update database access for a member. \nPlease try again!");
            return;
          }
        } else {
          toast.success("Successfully revoked database access");
        }

      } catch (error) {
        toast.error("Unexpected error while trying to give member database access!");
      }
    }

    const members = await getDBAccessMembers(dbID); // Fetch members
    setSelectedUsers(members);
  };

  async function queryDatabaseServer(databaseServerID: string) {

    //first determine whether the user already has an active connection to the database server
    let hasActiveConnectionResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/has-active-connection`, {
      credentials: "include",
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + await getToken()
      },
      body: JSON.stringify({
        databaseServerID: databaseServerID
      })
    });

    const hasActiveConnection = (await hasActiveConnectionResponse.json()).hasActiveConnection;

    //if the user has an active connection to the database server, navigate straight to the form
    if (hasActiveConnection === true) {
      navigateToForm(databaseServerID);
    }
    //otherwise proceed to open a connection to the database server
    else {

      //determine whether the user has db secrets saved for the database server
      let dbSecretsSavedResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/has-saved-db-credentials`, {
        credentials: "include",
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + await getToken()
        },
        body: JSON.stringify({
          db_id: databaseServerID
        })
      });

      const dbSecretsSaved = (await dbSecretsSavedResponse.json()).saved_db_credentials;

      //if the user doesn't have db credentials saved for that database, then prompt them for their credentials
      if (dbSecretsSaved === false) {
        credentialsModalDisclosure.onOpen();
        setCurrentDBServerID(databaseServerID);
      }
      else {

        //attempt a connection to the database, using saved credentials
        //call the api/connect endpoint, and exclude databaseServerCredentials
        let connectionResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connect`, {
          credentials: "include",
          method: "PUT",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken()
          },
          body: JSON.stringify({
            databaseServerID: databaseServerID
          })
        });

        let json = await connectionResponse.json();

        //if connection was successful, navigate to the form
        if (connectionResponse.ok === true && json.success === true) {
          navigateToForm(databaseServerID);
        }
        //if the connection was not successful, display an appropriate error message
        else if (connectionResponse.ok === false && json.response && json.response.message) {
          toast.error(json.response.message);
        }
        else {
          toast.error("Something went wrong. Please try again");
        }

      }

    }
  }

  async function getMembers() {
    try {
      let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/get-members`, {
        method: "PUT",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + await getToken(),
        },
        body: JSON.stringify({ org_id: orgServerID, }),
      });

      if (!response.ok) {
        // console.log("YOURR ERROR " + (response.status) + " " + (response.statusText);
        if (response.status === 401) {
          setErrorGetMembers("You are not authorized to view this! Please let an administrator verify your account in the organisation!");
          toast.error("You are not authorized to view this! Please let an administrator verify your account in the organisation!");
          return;
        }
        else {
          setErrorGetMembers("Error occurred while trying to fetch members, please try again later!");
          toast.error("Error occurred while trying to fetch members, please try again later!");
          return;
        }
      }

      let membersData = ((await response.json()).data);
      console.log(membersData);
      setOrgMembers(membersData);

      getUser().then((user) => {
        setLoggedInUserID(user as string);
        let role = membersData.find((orgMember: any) => orgMember.profiles.user_id === user).user_role;
        setLoggedInUserRole(role);
        // console.log(membersData.find((orgMember:any) => orgMember.profiles.user_id === user).user_role);
        if (role == "owner" || role == "admin") {
          setHasAdminPermission(true);
        }
      });

    } catch (error) {
      toast.error("Unexpected error while fetching members!");
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
        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/get-org`, {
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

        let org = await response.json();
        setOrganisations(org.data);
        let orgData = org.data[0];

        setInitialOrgName(orgData.name);
        setInitialOrgLogo(orgData.logo);
        // setOrgMembers(orgData.org_members);
        setProfilePicURL(orgData.logo);
        // setUpdateOrgName(orgData.name);
      } catch (error) {
        console.error("Failed to fetch organisation info:", error);
      }
    };

    try {
      getMembers();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      else if (error) {
        setErrorGetMembers("Unknown error has occurred, please refresh the page and try again!");
        toast.error("Unknown error has occurred, please refresh the page and try again!");
      }
    }

    getOrganisationInfo();
  }, []);


  // // Updated fields
  const updateQuery = async () => {

    let updatedDetails: UpdateOrganisation = {
      org_id: orgServerID,
    };

    if (updateOrgName === initialOrgName && profilePicURL === initialOrgLogo) {
      console.log("No Updates")
      return;
    }

    if (updateOrgName != initialOrgName) {
      if (updateOrgName == '') {
        setUpdateOrgName(initialOrgName);
        updatedDetails.name = initialOrgName;
      }
      else {
        updatedDetails.name = updateOrgName;
      }
    }

    if (profilePicURL != initialOrgLogo) {
      updatedDetails.logo = profilePicURL;
    }
    console.log(updatedDetails);

    let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/update-org`, {
      method: "PATCH",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + await getToken()
      },
      body: JSON.stringify(updatedDetails)
    });
    console.log(response);
    if (response.status === 200 || response.status === 201) {
      setInitialOrgName(updateOrgName);
      setInitialOrgLogo(profilePicURL);
    }
  };

  async function deleteUserFromOrg(userId: string) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/remove-member`, {
      method: "DELETE",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + await getToken(),
      },
      body: JSON.stringify({ org_id: orgServerID, user_id: userId })
    })
    await getMembers();
  }

  async function deleteDatabaseFromOrg(dbID: string) {
    // TO DO: deleteDatabaseFromOrg
    try {
      let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/remove-db`, {
        method: "DELETE",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + await getToken(),
        },
        body: JSON.stringify({ org_id: orgServerID, db_id: dbID })
      })

      if (!response.ok) {
        // console.log("YOURR ERROR " + (response.status) + " " + (response.statusText);
        if (response.status === 401) {
          toast.error("You are not authorized to delete the database from the organisation!");
          return;
        }
        else {
          toast.error("Failed to delete the database from the organisation. \nPlease try again!");
          return;
        }
      } else {
        toast.success("Successfully deleted the database from the organisation.");
      }

    } catch (error) {
      toast.error("Error while trying to delete the database, please try again!");
    }
  }

  async function deleteOrganisation() {
    let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/remove-org`, {
      method: "DELETE",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + await getToken(),
      },
      body: JSON.stringify({ org_id: orgServerID })
    })
    // console.log(response);

  }

  async function verifyUser(userId: string) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/add-member`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + await getToken(),
      },
      body: JSON.stringify({ org_id: orgServerID, user_id: userId })
    })
    console.log(response);
    getMembers();
  }

  const renderCell = React.useCallback((user: any, columnKey: any) => {
    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ radius: "lg", src: user.profiles.profile_photo }}
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

          if ((user.user_role == "admin" || user.user_role == "member") && user.profiles.user_id !== loggedInUserID) {
            let editControls = (<>
              <Tooltip content="Edit user">
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <EditUserModal org_id={orgServerID} user_id={user.profiles.user_id} on_add={getMembers} />
                </span>
              </Tooltip>
              <Tooltip color="danger" content="Delete user">
                <span className="text-lg text-danger cursor-pointer active:opacity-50">
                  <DeleteIcon onClick={() => deleteUserFromOrg(user.profiles.user_id)} />
                </span>
              </Tooltip>

            </>
            );

            if (!user.verified) {
              editControls = (<>
                {editControls}
                <Tooltip color="success" content="Verify user">
                  <span className="text-lg text-success cursor-pointer active:opacity-50">
                    <CheckIcon onClick={() => verifyUser(user.profiles.user_id)} />
                  </span>
                </Tooltip>
              </>);
            }
            return (
              <div className="relative flex items-center gap-2">
                {editControls}
              </div>
            );
          }
        }
        else {
          return (<></>);
        }
      default:
        return user.profiles.phone;
    }
  }, [hasAdminPermission, orgMembers]);

  const filteredUsers = selectedUsers.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderDBCell = React.useCallback((db: any, columnKey: any) => {
    switch (columnKey) {
      case "name":
        return (
          <Link href="" onClick={() => { queryDatabaseServer(db.db_id) }}>{db.name}</Link>
        );
      case "actions":
        if (hasAdminPermission) {
          let editControls = (<>
            <Tooltip content="Edit database access">
              <span className="text-lg text-default-400 h-5 w-5 flex justify-center mt-1 cursor-pointer active:opacity-50">
                {/* <EditUserModal org_id={orgServerID} user_id={user.profiles.user_id} on_add={getMembers} /> */}
                <EditIcon onClick={async () => {
                  const members = await getDBAccessMembers(db.db_id); // Fetch members
                  setDatabaseName(db.name);
                  setSelectedUsers(members);
                  setdbAccessID(db.db_id);
                  onDBAccessOpen();
                }} />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete database">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon onClick={() => {
                  setDatabaseName(db.name);
                  setDeleteDatabaseID(db.db_id);
                  onDeleteDBOpen();
                }
                  // deleteDatabaseFromOrg(db.db_id)
                } />
              </span>
            </Tooltip>
            <Tooltip content="Edit database metadata">
              <span className="text-lg cursor-pointer active:opacity-50">
                <MetaDataHandler db_id={db.db_id} org_id={orgServerID} on_add={() => { }} />
              </span>
            </Tooltip>

            {/* TO DO: EDIT DATABASE METADATA */}

          </>
          );
          return (
            <div className="relative flex items-center gap-2">
              {editControls}
            </div>
          );
        }
        else {
          return (<></>);
        }
      default:
        return (<></>);
    }
  }, [hasAdminPermission, orgMembers]);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const renderUpdatePage = React.useCallback(() => {
    // console.log(loggedInUserRole);
    if (hasAdminPermission && (loggedInUserRole == "owner" || loggedInUserRole == "Owner")) {
      return (
        <>
          <div className="flex flex-col">
            <div className="infield flex justify-center relative pb-4"  >
              <Image
                className="orgLogo rounded-full"
                // width={200}
                height={200}
                data-testid="updateOrgLogo"
                alt="Organisation Logo"
                src={profilePicURL}
              />

              <div className="flex flex-col justify-end absolute bottom-0">
                <Tooltip content="Upload new logo">
                  <label className="custom-file-upload bg-white p-1 border-2 border-slate-600 rounded-full hover:bg-">
                    <input
                      data-testid="file-input"
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onInput={(event) => handleProfilePicChange(event)}
                    />
                    <EditIcon className="cursor-pointer" />
                  </label>
                </Tooltip>
              </div>
            </div>
            <Spacer y={2} />
            <div className="infield">
              {renderOrgName()}
            </div>
          </div>
          <Spacer y={2} />
          <Button
            color="primary"
            onClick={updateQuery}
          >
            Update
          </Button>
          <Spacer y={2} />
          <Button
            color="danger"

            onClick={onOpen}
          >
            Delete Organisation
          </Button>
          <>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-row items-center justify-center text-center">
                      <span>Delete {updateOrgName}</span>
                    </ModalHeader>
                    <ModalBody className="text-center">
                      <p className="text-lg">Are you sure you want to delete the Organisation?</p>
                      <p className="text-sm text-gray-500">This action cannot be undone.</p>
                    </ModalBody>
                    <ModalFooter className="flex flex-row items-center justify-center space-x-4">
                      <Button color="primary" onPress={onClose}>
                        Cancel
                      </Button>
                      <Button
                        as={Link}
                        href="/"
                        color="danger"
                        type="button"
                        onClick={() => deleteOrganisation()}
                      >
                        Delete
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
          </>
        </>
      );
    }
    else {
      if (hasAdminPermission && loggedInUserRole == "admin") {
        return (
          <>
            <div className="flex flex-col">
              <div className="infield flex justify-center relative pb-4"  >
                <Image
                  className="orgLogo rounded-full"
                  // width={200}
                  height={200}
                  data-testid="updateOrgLogo"
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
                    <EditIcon />
                  </label>
                </div>
              </div>
              <Spacer y={2} />
              <div className="infield">
                {renderOrgName()}

              </div>
            </div>
            <Spacer y={2} />
            <Button
              color="primary"
              onClick={() => updateQuery()}
            >
              Update
            </Button>
            <Spacer y={2} />
            <Button
              color="danger"
              onClick={onOpen}
            >
              Leave Organisation
            </Button>
            <>
              <Modal isOpen={isOpen} onOpenChange={onOpenChange} >
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-row items-center justify-center text-center">
                        <span>Leave {updateOrgName}</span>
                      </ModalHeader>
                      <ModalBody className="text-center">
                        <p className="text-lg">Are you sure you want to leave the Organisation?</p>
                        <p className="text-sm text-gray-500">This action cannot be undone.</p>
                      </ModalBody>
                      <ModalFooter className="flex flex-row items-center justify-center space-x-4">
                        <Button color="primary" onPress={onClose}>
                          Cancel
                        </Button>
                        <Button
                          as={Link}
                          href="/"
                          color="danger"
                          type="button"
                          onClick={() => deleteUserFromOrg(loggedInUserID)}
                        >
                          Leave
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </>
          </>
        );
      }
      else {
        return (<>
          <div className="flex flex-col">
            <div className="infield flex justify-center relative pb-4"  >
              <Image
                className="orgLogo rounded-full"
                // width={200}
                height={200}
                alt="Organisation Logo"
                src={profilePicURL}
              />
            </div>
            <Spacer y={2} />
            <div className="infield">
              <Input
                isDisabled
                label="Organisation Name"
                defaultValue={initialOrgName}
                variant="bordered"
                placeholder={initialOrgName}
                onValueChange={setUpdateOrgName}
                onFocus={() => { setUpdateOrgNameHasBeenFocused(true); }}
                isInvalid={isUpdateOrgNameInvalid && updateOrgNameHasBeenFocused}
                color={!updateOrgNameHasBeenFocused ? "primary" : isUpdateOrgNameInvalid ? "danger" : "success"}
                errorMessage="Please enter the Organisation's name"
              />
            </div>
          </div>
          <Spacer y={2} />
          <Button
            color="danger"
            onClick={onOpen}
          >
            Leave Organisation
          </Button>
          <>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-row items-center justify-center text-center">
                      <span>Leave {updateOrgName}</span>
                    </ModalHeader>
                    <ModalBody className="text-center">
                      <p className="text-lg">Are you sure you want to leave the Organisation?</p>
                      <p className="text-sm text-gray-500">This action cannot be undone.</p>
                    </ModalBody>
                    <ModalFooter className="flex flex-row items-center justify-center space-x-4">
                      <Button color="primary" onPress={onClose}>
                        Cancel
                      </Button>
                      <Button
                        as={Link}
                        href="/"
                        color="danger"
                        type="button"
                        onClick={() => deleteUserFromOrg(loggedInUserID)}
                      >
                        Leave
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
          </>
        </>);
      }
    }
  }, [loggedInUserRole, hasAdminPermission, profilePicURL, initialOrgName, updateQuery]);

  const renderOrgName = React.useCallback(() => {
    return (
      <Input
        isRequired
        label="Organisation Name"
        defaultValue={initialOrgName}
        variant="bordered"
        data-testid="orgName-change"
        placeholder={initialOrgName}
        onValueChange={setUpdateOrgName}
        onFocus={() => { setUpdateOrgNameHasBeenFocused(true); }}
        isInvalid={isUpdateOrgNameInvalid && updateOrgNameHasBeenFocused}
        color={!updateOrgNameHasBeenFocused ? "primary" : isUpdateOrgNameInvalid ? "danger" : "success"}
        errorMessage="Please enter the Organisation's name"
      />
    );
  }, [initialOrgName, updateOrgName])

  async function copyHashCode() {
    navigator.permissions.query({ name: "notifications" }).then((result) => {
      if (result.state == "granted" || result.state == "prompt") {
        // alert("Write access granted!");
      }
    });
    try {
      let hashCode;
      let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/create-hash`, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + await getToken()
        },
        body: JSON.stringify({ org_id: orgServerID })
      });
      // console.log((await response.json()));
      hashCode = (await response.json()).data[0].hash;
      try {
        await navigator.clipboard.writeText(hashCode);
        console.log('Content copied to clipboard');
      } catch (err) {
        console.error('Failed to copy: ', err);

      }
      setHashCodeCopyText("Copied!");
      setTimeout(() => {
        setHashCodeCopyText("Share Join Code");
      }, 2000);
    } catch (fetchError) {
      console.error("Fetch error", fetchError);
    }
  }

  const renderJoinOrgHash = React.useCallback(() => {
    if (hasAdminPermission && (loggedInUserRole === 'admin' || loggedInUserRole === "owner")) {
      return (
        <div className="m-auto mb-0 mt-0">
          <Button
            color="primary"
            onClick={() => copyHashCode()}
          >
            {hashCodeCopyText}
          </Button>
        </div>
      );
    }
  }, [hasAdminPermission, hashCodeCopyText]);

  const columns = [
    { name: "NAME", uid: "name" },
    { name: "ROLE", uid: "role" },
    { name: "ACTIONS", uid: "actions" },
  ];

  const databaseColumns = [
    { name: "DATABASE NAME", uid: "name" },
    { name: "ACTIONS", uid: "actions" },
  ];

  const [profilePic, setProfilePic] = useState('');
  const [file, setFile] = useState(null);

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

  const updateProfilePicture = React.useCallback(async () => {
    if (file != null) {
      const formData = new FormData();
      formData.append('org_id', orgServerID);
      formData.append('file', file);
      // console.log(formData.get('file'));

      let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/upload-org-logo`, {
        method: "POST",
        headers: {
          'Authorization': 'Bearer ' + await getToken()
        },
        body: formData
      }).then(async (response) => {
        let data = (await response.json());
        console.log(data);
        setProfilePicURL(data.publicUrl);
      }).then(async () => {
        await updateQuery();
      });

    }
  }, [setProfilePicURL, profilePicURL, updateQuery]);

  return (
    <>
      <div className="flex w-full flex-col">
        <Spacer y={2} />
        <div className="flex w-full flex-col">
          <div className="organisationHeader m-auto mt-0 mb-0 flex flex-col items-center">
            <Image
              className="orgLogo md:rounded-1"
              // width={200}
              height={200}
              data-testid="OrganisationLogoImage"
              alt="Organisation Logo"
              src={profilePicURL}
            />
            <Spacer y={2} />
            <span className="text-center text-2xl">{initialOrgName}</span>
          </div>
          <Spacer y={2} />
          {renderJoinOrgHash()}
          <Spacer y={2} />
        </div>
        <Tabs aria-label="Options" className="m-auto mb-0 mt-0">
          <Tab key="orgInfo" aria-label="orgInfo" title="Information">
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
                    {(item: any) => (
                      <TableRow key={item.profiles.user_id} >
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {errorGetMembers == "" ?
                  (
                    <>
                    </>
                  ) : (
                    <>
                      <div className="m-4 flex flex-row text-center">{errorGetMembers}</div>
                    </>
                  )}
              </CardBody>

            </Card>
          </Tab>
          <Tab key="orgDatabases" aria-label="orgDatabases" title="Databases">
            <Card>
              <CardBody>
                {errorGetMembers == "" ?
                  (<>
                    <DatabaseCredentialsModal dbServerID={currentDBServerID} disclosure={credentialsModalDisclosure} onConnected={() => { navigateToForm(currentDBServerID) }} />
                    {organisations ? organisations.map((org: Organisation) => (
                      <>
                        <Table aria-label="Organisation Database Table">
                          <TableHeader columns={databaseColumns}>
                            {(column) => (
                              <TableColumn key={column.uid}>
                                {column.name}
                              </TableColumn>
                            )}
                          </TableHeader>
                          <TableBody>
                            {org.db_envs.map((db: Database) =>
                            (
                              <TableRow key={db.db_id}>
                                {(columnKey) => <TableCell>{renderDBCell(db, columnKey)}</TableCell>}
                              </TableRow>
                            )
                            )}
                          </TableBody>
                        </Table>
                      </>
                    )) : <></>}
                  </>) : (
                    <>
                      <div className="m-4 flex flex-row text-center">{errorGetMembers}</div>
                    </>
                  )}
                {/* TODO: Get end point to only show available databases in the organisation */}
                <Modal isOpen={isDBAccessOpen} onOpenChange={onDBAccessOpenChange}>
                  <ModalContent>
                    {(onClose) => (
                      <>
                        <ModalHeader className="flex justify-between items-center">
                          <h2 className="font-semibold"> Database Access </h2>
                        </ModalHeader>
                        <ModalBody>
                          {/* List of users in org */}
                          <h2 className="text-lg font-semibold mb-2">Edit database access for the members of the organisation</h2>
                          {/* Search bar for filtering users */}
                          <Input
                            placeholder="Search Users..."
                            className="mb-2 z-[100]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <div className="max-h-[200px] overflow-y-auto">
                            {filteredUsers.length > 0 ? (
                              filteredUsers.map((selectedUsers) => (
                                <Tooltip key={selectedUsers.user_id} className="mb-2 ml-3" content={selectedUsers.access ? "Revoke Access" : "Grant access"}>
                                  <Checkbox
                                    key={selectedUsers.user_id}
                                    className="flex items-center space-x-2 mb-2"
                                    isSelected={selectedUsers.access}
                                    onChange={(e) => handleCheckboxChange(dbAccessID, selectedUsers, e.target.checked)} // Update the checkbox based on user selection
                                  >
                                    <div className="flex items-center space-x-2">
                                      <img
                                        src={selectedUsers.profile_photo || DEFAULT_PROFILE_IMAGE}
                                        alt={`${selectedUsers.full_name}'s profile`}
                                        className="h-8 w-8 rounded-full"
                                      />
                                      <span className="text-sm">{selectedUsers.full_name}</span>
                                    </div>
                                  </Checkbox>
                                </Tooltip>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500">No users found.</p>
                            )}
                          </div>
                        </ModalBody>
                        <ModalFooter>
                          <div className="mt-4 flex justify-center w-full">
                            <Button color="primary" className="w-full max-w-xs items-center" onClick={onClose}>
                              Cancel
                            </Button>
                          </div>

                        </ModalFooter>
                      </>
                    )}
                  </ModalContent>
                </Modal>
                <Modal isOpen={isDeleteDBOpen} onOpenChange={onDeleteDBOpenChange} >
                  <ModalContent>
                    {(onClose) => (
                      <>
                        <ModalHeader className="flex flex-row items-center justify-center text-center">
                          <span>Delete {databaseName}</span>
                        </ModalHeader>
                        <ModalBody className="text-center">
                          <p className="text-lg">Are you sure you want to delete the database?</p>
                          <p className="text-sm text-gray-500">This action cannot be undone.</p>
                        </ModalBody>
                        <ModalFooter className="flex flex-row items-center justify-center space-x-4">
                          <Button color="primary" onPress={onClose}>
                            Cancel
                          </Button>
                          <Button
                            as={Link}
                            href={"/organisation/" + orgServerID}
                            color="danger"
                            type="button"
                            onClick={() => deleteDatabaseFromOrg(deleteDatabaseID)}
                          >
                            Delete
                          </Button>
                        </ModalFooter>
                      </>
                    )}
                  </ModalContent>
                </Modal>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </>
  )

}