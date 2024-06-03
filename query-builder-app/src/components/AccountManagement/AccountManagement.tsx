'use client'
import styles from './AccountManagement.module.css';
import { Input, Button } from '@nextui-org/react';

export interface AccountManagementProps {}

//todo -  we need to get the current username values such that we are able to display it and check if changed

export function AccountManagement(props: AccountManagementProps) {
    return (
        <>
            <h1>Account Management</h1>
            <Input
                key={'md'}
                radius={'md'}
                type='text'
                label='Username'
                placeholder='Enter a new username'
                defaultValue=''
            />
            <Input
                key={'md'}
                radius={'md'}
                type='text'
                label='Username'
                placeholder='Enter a new username'
                defaultValue=''
            />
        </>
    );
    // <Input key="md" radius="md" type="text" label="Username" placeholder="Enter a new username" defaultValue=''/>
}