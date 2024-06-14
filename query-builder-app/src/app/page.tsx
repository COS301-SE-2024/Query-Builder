'use client';
import LandingPage from '@/components/LandingPage/LandingPage';
import SignedInHomePage from '@/components/SignedInHomePage/SignedInHomePage';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

export default function Page() {
  //Connection to supabase
  const supabaseURL: string = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseANON: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const supabase = createClient(supabaseURL, supabaseANON);

  // Setting up the user hook
  const [user, setUser] = useState<User | null>(null);

  // getUserdata is an asynchronous function used to query supabase for client data
  const getUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  // Will trigger if the user is updated - idk if this is necessary - need to check with Xadrian
  /*
  useEffect(() => {

  }, []);
  */
  
  getUserData();

  // Determining which page to render based on whether the user is logged in or not
  if (user === null) {
    return <LandingPage />;
  } else {
    return <SignedInHomePage />;
  }
}
