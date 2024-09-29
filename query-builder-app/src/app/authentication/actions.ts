"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";
import { AuthApiError, AuthError } from "@supabase/supabase-js";
import { wait } from "@testing-library/user-event/dist/cjs/utils/index.js";

export async function login(email: string, password: string) {
    const supabase = createClient();

    const userDetails = {
        email: email,
        password: password,
    };

    const { data, error } = await supabase.auth.signInWithPassword(userDetails);

    if (error) {
        // redirect("/error");
        // console.log(error);
        if(error instanceof AuthApiError || error instanceof AuthError){
            if (error.status == 400 && error.code == 'invalid_credentials'){
                throw new AuthError("Failed to login, please try again: Invalid credentials", 400, 'invalid_credentials');
            }

        }
        throw new Error("Failed to login, please try again: Unexpected error");
    }

    if(data){
        //console.log(data);
        if(!data.user.confirmed_at){
            throw new Error("Failed to login, please check your emails and verify your account!");
        }
    }
}

export async function signup(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
) {
    const supabase = createClient();

    const userDetails = {
        email: email,
        password: password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
            }
        },
    };

    let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-management/get-user`, {
        credentials: "include",
        method: "PUT",
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
            email: userDetails.email
        })
    });

    let result = await (response).json();
    if (result.statusCode === 404 && result.response.message === "User not found"){

        const { data, error } = await supabase.auth.signUp(userDetails);

        // console.log(data);

        if (error) {
            // Check for the specific rate limit error by message
            if (error.message && error.message.includes('Email rate limit exceeded')) {
                // console.log(data);
                throw new Error('Too many sign-up attempts. Please wait and try again.');
            }
            // Handle other types of errors
            throw new Error("Unexpected error"); // Generic error handling
        }
    }
    else if (result.data?.length > 0) {
        if(result.data[0].onboarded){
            throw new Error('This email is already taken.');
        }
        else{
            throw new Error('Confirm account');
        }  
    }
    else {
        throw new Error('Unexpected error.');
    }

    
}

export async function navigateToAuth() {
    revalidatePath('/authentication', 'layout');
    redirect('/authentication');
}

export async function navigateToSignedInHomePage() {
    revalidatePath('/', 'layout');
    redirect('/');
}