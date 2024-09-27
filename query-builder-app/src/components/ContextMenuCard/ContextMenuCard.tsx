import React, { useState, useEffect, useRef } from "react";
import {
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    DropdownSection,
    CardBody,
    Card,
    Checkbox,
    Textarea,
    Input,
} from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { createClient } from "./../../utils/supabase/client";
import { useRouter } from 'next/navigation';
import toast from "react-hot-toast";

export interface User {
    user_id: string;
    full_name: string;
    profile_photo: string | null; // profileImage can be null
}

interface ContextMenuCardProps {
    queryTitle: string;
    saved_at: string;
    parameters: any;
    query_id: any;
    db_id: string;
    onDelete: () => void;
    description_text: string;
    type_text: string;
    db_envs: any;
}

// This function gets the token from local storage.
const getToken = async () => {
    const supabase = createClient();
    const token = (await supabase.auth.getSession()).data.session?.access_token;

    console.log(token);
    return token;
};

async function removeQuery(query_id: string) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/query-management/delete-query`, {
        credentials: "include",
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken()
        },
        body: JSON.stringify({ query_id })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    let json = (await response.json()).data;
}

async function getMembers(db_id: string, query_id: string) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/query-management/get-shareable-members`, {
        credentials: "include",
        method: "PUT",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken()
        },
        body: JSON.stringify({ db_id, query_id })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    let json = (await response.json()).data;
    return json;
}


async function shareQuery(query_id: string, checkboxUsers: string[], description: string) {
    console.log(query_id, checkboxUsers, description);
    let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/query-management/share-query`, {
        credentials: "include",
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await getToken()
        },
        body: JSON.stringify({ query_id: query_id, shareable_members: checkboxUsers, description: description })
    });

    if (!response.ok) {
        // throw new Error(`HTTP error! Status: ${response.status}`);
        toast.error("Error sharing query. Please try again later.");
    }
    else {
        toast.success("Query shared successfully!");
    }

    let json = (await response.json()).data;
    return response;
}

// Define a standard profile image URL
const DEFAULT_PROFILE_IMAGE = "https://via.placeholder.com/150/cccccc/FFFFFF?text=No+Image";

export default function ContextMenuCard({
    queryTitle,
    saved_at,
    parameters,
    query_id,
    db_id,
    onDelete,
    description_text,
    type_text,
    db_envs
}: ContextMenuCardProps) {
    const [loading, setLoading] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure(); // For the delete confirmation modal
    const { isOpen: isShareOpen, onOpen: onShareOpen, onOpenChange: onShareOpenChange } = useDisclosure(); // For the share query modal

    const router = useRouter();
    const [openPopup, setOpenPopup] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState(""); // State for search term
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [userDescription, setUserDescription] = useState("");
    const [checkedUsers, setCheckedUsers] = useState<User[]>([]); // Track checked state as an array of user objects
    const [dborginfo, setdborginfo] = useState("");

    const handleCheckboxChange = (user: User, isChecked: boolean) => {
        if (isChecked) {
            // Add the user object to the checkedUsers if it's checked
            setCheckedUsers((prev) => [...prev, user]);
        } else {
            // Remove the user object from checkedUsers if it's unchecked
            setCheckedUsers((prev) => prev.filter((u) => u.user_id !== user.user_id));
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await removeQuery(query_id);
        } catch (error) {
            console.error("Error during deletion:", error);
        } finally {
            setLoading(false);
            onDelete();
            onOpenChange();
            toast.success("Query deleted successfully!");
        }
    };

    const handleRetrieve = async () => {
        let query = parameters;
        console.log(query);
        router.push("/" + db_id + "/" + query_id);
        toast.dismiss();
    };

    const localDateTime = new Date(saved_at).toLocaleString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });

    // Handle closing the popup if clicked outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenPopup(false);
            }
        }

        if (openPopup) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openPopup]);

    const openSharePopup = async () => {
        setSelectedUsers(await getMembers(db_id, query_id));
        console.log(selectedUsers);
        setOpenPopup(true);
    };

    // Filter users based on the search term
    const filteredUsers = selectedUsers.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    function shareQueryHelper(query_id: string, checkedUsers: User[], userDescription: string) {
        if (checkedUsers.length == 0) {
            toast.error("Please select at least one user to share the query with.");
            return;
        }
        const test = checkedUsers.map((user) => user.user_id);
        shareQuery(query_id, test, userDescription)
        onShareOpenChange();
    }

    return (
        <>
            <Dropdown className="w-[300px]">
                <DropdownTrigger>
                    <Button
                        variant="flat"
                        className="size-full pl-1 pr-1"
                        style={type_text === 'Shared' ? { backgroundColor: '#7cc6eb', color: 'white' } : {}}
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : queryTitle}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions" closeOnSelect={false}>
                    <DropdownSection title={localDateTime}>
                        <DropdownItem
                            isDisabled
                            style={{
                                maxWidth: '300px', // Set your preferred max width
                                whiteSpace: 'normal', // Allow text to wrap
                                overflowWrap: 'break-word', // Allow long words to break
                                overflow: 'visible', // Ensure overflow is visible
                                display: 'block', // Ensure block-level display
                                wordBreak: 'break-all', // Break long words if necessary
                            }}
                            className="text-sm text-gray-500"
                        >
                            <div style={{
                                wordBreak: 'break-all', // Ensures breaking of long words
                                overflowWrap: 'break-word', // Break long words if necessary
                            }}>
                                {"Organization: " + (db_envs.organisations.name || "No org information available")}
                                <br />
                                {"Database: " + (db_envs.name || "No db information available")}
                            </div>
                        </DropdownItem>
                        <DropdownItem
                            isDisabled
                            style={{
                                maxWidth: '300px', // Set your preferred max width
                                whiteSpace: 'normal', // Allow text to wrap normally
                                overflowWrap: 'break-word', // Allow long words to break
                                display: 'block', // Ensure block-level display
                                wordBreak: 'break-all', // Break long words if necessary
                                overflow: 'hidden', // Prevent overflow
                            }}
                            className="text-sm text-gray-500"
                        >
                            Description:
                            <div style={{ padding: '20px', backgroundColor: '#f0f0f0', zIndex: 100 }}>
                                <div
                                    style={{
                                        maxWidth: '250px', // Set your preferred max width
                                        maxHeight: '150px', // Set your preferred max height
                                        whiteSpace: 'normal', // Allow text to wrap normally
                                        overflowWrap: 'break-word', // Allow long words to break
                                        display: 'block', // Ensure block-level display
                                        wordBreak: 'break-all', // Break long words if necessary
                                        overflowY: 'auto', // Make vertical overflow scrollable
                                        overflowX: 'hidden', // Prevent horizontal overflow
                                    }}
                                    className="text-sm text-gray-500"
                                >
                                    <div style={{
                                        wordBreak: 'break-all', // Ensures breaking of long words
                                        overflowWrap: 'break-word', // Break long words if necessary
                                    }}>
                                        {description_text || "No description available"}
                                    </div>
                                </div>
                            </div>
                        </DropdownItem>
                        <DropdownItem
                            key="retrieve"
                            description="Retrieve saved query"
                            onClick={() => {
                                toast.loading("Retrieving query...");
                                handleRetrieve();
                            }}
                        >
                            Retrieve Query
                        </DropdownItem>
                        <DropdownItem
                            key="share"
                            description="Share query to other users in org"
                            onPress={async () => {
                                onShareOpen(); // Open the share modal
                                const members = await getMembers(db_id, query_id); // Fetch members
                                setSelectedUsers(members); // Set the selected users
                                console.log(selectedUsers);
                            }}
                        >
                            Share Query
                        </DropdownItem>
                        <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            description="Delete query from saved queries"
                            onPress={onOpen}
                        >
                            Delete Query
                        </DropdownItem>
                    </DropdownSection>
                </DropdownMenu>
            </Dropdown>

            {/* Modal for delete confirmation */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-row items-center justify-center text-center">
                                <span>Delete</span>
                                <span style={{ color: 'red', fontWeight: 'bold', marginLeft: '0.5rem' }}>
                                    {queryTitle}
                                </span>
                                <span>?</span>
                            </ModalHeader>
                            <ModalBody className="text-center">
                                <p className="text-lg">Are you sure you want to delete this query?</p>
                                <p className="text-sm text-gray-500">This action cannot be undone.</p>
                            </ModalBody>
                            <ModalFooter className="flex flex-row items-center justify-center space-x-4">
                                <Button color="primary" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="danger" onClick={handleDelete}>
                                    Delete
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Share Modal */}
            <Modal isOpen={isShareOpen} onOpenChange={onShareOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex justify-between items-center">
                                <h2 className="font-semibold">Share Query</h2>
                            </ModalHeader>
                            <ModalBody>
                                {/* List of users in org */}
                                <h2 className="text-lg font-semibold mb-2">Select Users to Share Query</h2>
                                {/* Search bar for filtering users */}
                                <Input
                                    placeholder="Search Users..."
                                    className="mb-2 z-[100]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="max-h-[200px] overflow-y-auto">
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <Checkbox
                                                key={user.user_id}
                                                className="flex items-center space-x-2 mb-2"
                                                onChange={(e) => handleCheckboxChange(user, e.target.checked)} // Update the checkbox based on user selection
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <img
                                                        src={user.profile_photo || DEFAULT_PROFILE_IMAGE}
                                                        alt={`${user.full_name}'s profile`}
                                                        className="h-8 w-8 rounded-full"
                                                    />
                                                    <span className="text-sm">{user.full_name}</span>
                                                </div>
                                            </Checkbox>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">No users found...</p>
                                    )}
                                </div>

                                {/* Place to enter new description */}
                                <div className="mt-4">
                                    <h3 className="text-md font-medium mb-2">Enter New Description</h3>
                                    <Textarea
                                        placeholder="Add a new description for this query"
                                        className="w-full"
                                        minRows={3}
                                        maxRows={5}
                                        maxLength={190} // Limit the number of characters
                                        onChange={(e) => {
                                            if (e.target.value.length <= 190) {
                                                setUserDescription(e.target.value);
                                            }
                                        }}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                {/* Button to share the query */}
                                <div className="mt-4 flex justify-center w-full">
                                    <Button
                                        color="primary"
                                        className="w-full max-w-xs items-center"
                                        onClick={() => shareQueryHelper(query_id, checkedUsers, userDescription)}
                                    >
                                        Share Query
                                    </Button>
                                </div>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}