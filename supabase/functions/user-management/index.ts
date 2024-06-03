// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.43.4";

const corse_headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-error-message",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

function return_error(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    headers: {
      ...corse_headers,
      "Content-Type": "application/json",
      "x-error-message": message,
    },
    status,
  });
}

function return_success(data: JSON) {
  return new Response(
    JSON.stringify({
      data: data,
    }),
    {
      headers: { ...corse_headers, "Content-Type": "application/json" },
      status: 200,
    },
  );
}

Deno.serve(async (req: Request) => {
  const { method } = req;

  if (method === "OPTIONS") {
    return new Response("ok", { headers: corse_headers });
  } else if (method === "POST" || method === "PUT") {
    try {
      const auth_header = req.headers.get("Authorization")!;
      if (!auth_header) {
        return await return_error("Authorization header is required", 400);
      }

      const supabase_client: SupabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        {
          global: {
            headers: { Authorization: auth_header },
          },
        },
      );

      const token = auth_header.replace("Bearer ", "");

      const json = await req.text();
      if (!json) {
        return await return_error("Unexpected end of JSON input", 400);
      }

      const body = JSON.parse(json);

      if (!("function_id" in body)) {
        return await return_error("Function ID is required", 400);
      }

      switch (body.function_id) {
        case "update-username":
          return update_username(supabase_client, body, token);
        case "update-password":
          return update_password(supabase_client, body, token);
        default:
          return await return_error("Function ID not found", 400);
      }
    } catch (error) {
      console.error(error);
      return await return_error(error.event_message, 500);
    }
  }

  return new Response(
    JSON.stringify({
      data: "Hello, IDK how you got here tbh",
    }),
    {
      headers: { ...corse_headers, "Content-Type": "application/json" },
      status: 418,
    },
  );
});

async function update_username(
  supabase_client: SupabaseClient,
  body: JSON,
  token: string,
) {
  if (!("username" in body)) {
    return await return_error("Username is required", 400);
  }

  const { data: req_data, error: req_error } = await supabase_client.auth
    .getUser(token);
  if (req_error) {
    return await return_error(req_error.message, 500);
  }

  if (!req_data.user) {
    return await return_error("User not found", 404);
  }
  const user = req_data.user;

  const { username } = body;
  const { error: update_error } = await supabase_client
    .from("users")
    .update({ username })
    .eq("user_id", user.id);

  if (update_error) {
    return await return_error(update_error.message, 500);
  }

  const { data: updated_user, error: updated_user_error } =
    await supabase_client
      .from("users")
      .select("*")
      .eq("user_id", user.id)
      .single();

  if (updated_user_error) {
    return await return_error(updated_user_error.message, 500);
  }

  return await return_success(updated_user);
}

async function update_password(
  supabase_client: SupabaseClient,
  body: JSON,
  token: string,
) {
  if (!("password" in body)) {
    return await return_error("Password is required", 400);
  }

  const { data: req_data, error: req_error } = await supabase_client.auth
    .getUser(token);

  if (req_error) {
    return await return_error(req_error.message, 500);
  }

  const user = req_data.user;

  const { password } = body;

  const supabase_client_admin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      global: {
        headers: { Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` },
      },
    },
  );

  const { data: updated_user, error } = await supabase_client_admin.auth.admin
    .updateUserById(
      user.id,
      { password: password as string },
    );

  if (error) {
    return await return_error(error.message, 500);
  }

  return await return_success(JSON.parse(JSON.stringify(updated_user)))
}
/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/user-management' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
