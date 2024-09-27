import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {

    const res = NextResponse.next();

    const publicUrls = ['/reset']

    if(publicUrls.includes(request.nextUrl.pathname))
    {
        return res;
    }

    const {supabase, response} = createClient(request);
    const {data : {user}} = await supabase.auth.getUser();

    //get the cookie that Express-Session sets on the client
    const sid = cookies().get('connect.sid');

    let hasBackendSession = false;

    //if the cookie exists, then forward it to the backend to check that a session-key exists for the user
    //could we just check the cookie exists without checking for the presence of the session-key with a request?
    if(sid){

        let backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/has-session`, {
            credentials: "include",
            method: "GET",
            headers: {
                Cookie: `${sid!.name}=${sid!.value}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
    
        let backendSessionData = await backendResponse.json();
        hasBackendSession = backendSessionData.has_session;
    }

    //If the user has either no frontend session or no backend session, and they aren't trying to get to the authentication or error page
    //then redirect them to the authentication page to log in
    if((!user || (hasBackendSession === false)) && (!request.nextUrl.pathname.startsWith('/authentication')) && (!request.nextUrl.pathname.startsWith('/error'))){
        return NextResponse.redirect(new URL('/authentication', request.url));
    }

    //The below code was giving an issue with plain login - removing it means logged-in users can still access the auth page, not a biiiig deal
    //if(user && (backendSessionData.has_session === true) && request.nextUrl.pathname.startsWith('/authentication')){
    //    return NextResponse.redirect(new URL('/', request.url));
    //}

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
