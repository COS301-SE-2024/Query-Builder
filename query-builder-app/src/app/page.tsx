import LandingPage from '@/components/LandingPage/LandingPage';
import { createClient } from '@supabase/supabase-js';

export default function Page() {
  const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseAnonKey: string =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // todo : 1. get userdata from supabase using getUser()
  // todo : 2. conditional rendering based on return from supabase
  if()
	{
		return <LandingPage></LandingPage>;
	}
	else
	{
		// return <></> Keanu's stuff
	}
}
