// Import required libraries
import {
  assert,
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.224.0/testing/asserts.ts";
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";
import { delay } from "https://deno.land/x/delay@v0.2.0/mod.ts";

// Set up the configuration for the Supabase client
const supabase_url = Deno.env.get("SUPABASE_URL") ?? "";
const supabase_anon_key = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const options = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
};

const client: SupabaseClient = createClient(supabase_url, supabase_anon_key, options);

const test1 = async () => {
}

Deno.test("Test 1", test1);
