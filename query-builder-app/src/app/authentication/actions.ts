"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";
import { AuthApiError, AuthError } from "@supabase/supabase-js";

export async function login(email: string, password: string) {
    const supabase = createClient();

    const userDetails = {
        email: email,
        password: password,
    };

    const { data, error } = await supabase.auth.signInWithPassword(userDetails);

    if (error) {
        // redirect("/error");
        console.log(error);
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

    const { data, error } = await supabase.auth.signUp(userDetails);

    if (error) {
        // Check for the specific rate limit error by message
        if (error.message === 'Email rate limit exceeded') {
            console.log(data);
            throw new Error('Too many sign-up attempts. Please wait and try again.');
        }
        // Handle other types of errors
        throw new Error(error.message); // Generic error handling
    }

    revalidatePath('/', 'layout');
    redirect('/');
}

export async function navigateToAuth() {
    revalidatePath('/authentication', 'layout');
    redirect('/authentication');
}

export async function navigateToSignedInHomePage() {
    revalidatePath('/', 'layout');
    redirect('/');
}