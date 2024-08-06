"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";

export async function login(email: string, password: string) {
    const supabase = createClient();

    const data = {
        email: email,
        password: password,
    };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
        redirect("/error");
    }
    revalidatePath("/", "layout");
    redirect("/");
}

export async function signup(
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
) {
    const supabase = createClient();

    const data = {
        email: email,
        phone: phone,
        password: password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
            },
            channel: 'sms'
        },
    };

    const { error } = await supabase.auth.signUp(data);

    if (error) {
        redirect("/error");
    }

    revalidatePath('/', 'layout');
    redirect('/');
}