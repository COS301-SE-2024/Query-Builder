// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";

const corse_headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

console.log("Hello from Functions!");

Deno.serve(async (req: Request) => {
  const { url: url, method: method } = req;

  if (method === "OPTIONS") {
    return new Response("ok", { headers: corse_headers });
  } else if (method === "POST" || method === "PUT") {
    try {
      const authHeader = req.headers.get("Authorization")!;

      const supabase_client: SupabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        {
          global: {
            headers: { Authorization: authHeader },
          },
        },
      );

      const taskPath = new URLPattern("/user-management/:id");
      const matchingPath = taskPath.exec(url);
      const function_id = matchingPath ? matchingPath.pathname.groups.function_id : null;
      const body = await req.json();

      if(!function_id || !body) {
        throw new Error("Invalid request");
      }

      // switch(function_id) {
      //   // TODO - Add various sub-functions here
      // }

      return new Response(
        JSON.stringify({
          message: "Hello from Functions!",
        }),
        {
          headers: { ...corse_headers, "Content-Type": "application/json" },
          status: 200,
        },
      );

    } catch (error) {
      console.error(error);
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          headers: { ...corse_headers, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }
  }

  return new Response("Invalid request", { status: 400 });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/user-management' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
