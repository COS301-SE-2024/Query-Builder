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
    Input
} from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { createClient } from "./../../utils/supabase/client";
import { useRouter } from 'next/navigation';

export interface User {
    id: number;
    name: string;
    profileImage: string | null; // profileImage can be null
}

interface ContextMenuCardProps {
    queryTitle: string;
    saved_at: string;
    parameters: any;
    query_id: any;
    db_id: string;
    onDelete: () => void;
    description?: string; // Optional description
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

// Sample users array
const users: User[] = [
    { id: 1, name: "John Doe", profileImage: "https://via.placeholder.com/150" },
    { id: 2, name: "Jane Doe", profileImage: null }, // No image
    { id: 3, name: "Alice Doe", profileImage: "https://via.placeholder.com/150" },
    { id: 4, name: "Bob Doe", profileImage: null }, // No image
    { id: 5, name: "John Smith", profileImage: "https://via.placeholder.com/150" },
    { id: 6, name: "Jane Smith", profileImage: null }, // No image
    { id: 7, name: "Alice Smith", profileImage: "https://via.placeholder.com/150" },
    { id: 8, name: "Bob Smith", profileImage: null }, // No image
];
// const users: User[] = [
// ];

// Define a standard profile image URL
const DEFAULT_PROFILE_IMAGE = "https://via.placeholder.com/150/cccccc/FFFFFF?text=No+Image";

export default function ContextMenuCard({
    queryTitle,
    saved_at,
    parameters,
    query_id,
    db_id,
    onDelete,
    description, // Here we include the description prop
}: ContextMenuCardProps) {
    const [loading, setLoading] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const router = useRouter();
    const [openPopup, setOpenPopup] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState(""); // State for search term

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
        }
    };

    const handleRetrieve = async () => {
        let query = parameters;
        console.log(query);
        router.push("/" + db_id + "/" + query_id);
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

    const openSharePopup = () => {
        setOpenPopup(true);
    };

    // Filter users based on the search term
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate card position to prevent it from going off-screen
    const getCardPosition = () => {
        const cardWidth = 400; // Card width
        const cardHeight = 300; // Estimate a height for the card (adjust as needed)

        const { innerWidth, innerHeight } = window; // Get viewport dimensions
        const { top, left } = menuRef.current?.getBoundingClientRect() || { top: 0, left: 0 };

        let adjustedTop = top;
        let adjustedLeft = left;

        // Adjust position if the card goes out of viewport
        if (left + cardWidth > innerWidth) {
            adjustedLeft = innerWidth - cardWidth - 10; // 10px padding
        }
        if (top + cardHeight > innerHeight) {
            adjustedTop = innerHeight - cardHeight - 10; // 10px padding
        }

        return { top: adjustedTop, left: adjustedLeft };
    };

    return (
        <>
            <Dropdown>
                <DropdownTrigger>
                    <Button
                        variant="flat"
                        className="size-full pl-1 pr-1"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : queryTitle}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions" closeOnSelect={false}>
                    <DropdownSection title={localDateTime}>
                        {/* Show the description as a non-interactive item */}
                        <DropdownItem key="description" isDisabled className="text-sm text-gray-500">
                            {description || "No description available"}
                        </DropdownItem>
                        <DropdownItem
                            key="retrieve"
                            description="Retrieve saved query"
                            onClick={handleRetrieve}
                        >
                            Retrieve Query
                        </DropdownItem>
                        <DropdownItem
                            key="share"
                            description="Share query to other users in org"
                            onPress={openSharePopup}
                        >
                            Share Query

                            {openPopup && (
                                <Card
                                    ref={menuRef}
                                    className="absolute z-[10]"
                                    style={{
                                        top: `${getCardPosition().top}px`,
                                        left: `${getCardPosition().left}px`,
                                        width: '400px'
                                    }}
                                >
                                    <CardBody>

                                        {/* List of users in org */}
                                        <h2 className="text-lg font-semibold mb-2">Select Users to Share Query</h2>
                                        {/* Search bar for filtering users */}
                                        <Input
                                            placeholder="Search Users..."
                                            className="mb-2 z-[100]"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <div className="max-h-[200px] overflow-y-auto"> {/* Set max height and scroll */}
                                            {filteredUsers.length > 0 ? (
                                                filteredUsers.map((user) => (
                                                    <Checkbox key={user.id} className="flex items-center space-x-2 mb-2">
                                                        <div className="flex items-center space-x-2">
                                                            <img
                                                                src={user.profileImage || DEFAULT_PROFILE_IMAGE}
                                                                alt={`${user.name}'s profile`}
                                                                className="h-8 w-8 rounded-full"
                                                            />
                                                            <span className="text-sm">{user.name}</span>
                                                        </div>
                                                    </Checkbox>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500">No users found.</p>
                                            )}
                                        </div>

                                        {/* Place to enter new description */}
                                        <div className="mt-4">
                                            <h3 className="text-md font-medium mb-2">Enter New Description</h3>
                                            <Textarea
                                                placeholder="Add a new description for this query"
                                                className="w-full z-[100]"
                                                minRows={3}
                                                maxRows={5}
                                            />
                                        </div>

                                        {/* Button to share the query */}
                                        <div className="mt-4 flex justify-end">
                                            <Button color="primary" className="w-full">Share Query</Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            )}
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
        </>
    );
}
