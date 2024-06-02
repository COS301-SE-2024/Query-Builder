// Import required libraries
import {
  assert,
  assertEquals,
  assertExists,
  assertFalse,
} from "https://deno.land/std@0.192.0/testing/asserts.ts";
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.23.0";
import { delay } from "https://deno.land/x/delay@v0.2.0/mod.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

// Set up the configuration for the Supabase client
const env = await load();
const supabase_url = env.SUPABASE_URL;
const supabase_anon_key = env.SUPABASE_ANON_KEY;
const supabase_service_role_key = env.SUPABASE_SERVICE_ROLE_KEY;
const options = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
};

const client: SupabaseClient = createClient(
  supabase_url,
  supabase_anon_key,
  options,
);

function logError(func_error: Error): Promise<void> {
  console.log(func_error);
  // const errorBodyReader = func_error.context.body.getReader();const { value, done } = await errorBodyReader.read();
  // const errorBody = new TextDecoder().decode(value);
  // console.log(errorBody);

  throw new Error("Invalid response: " + func_error.message);
}

const test_no_body = async () => {
  const { error } = await client.functions.invoke("user-management");
  const error_message = error.context.headers.get("x-error-message");
  assertEquals(error_message, "Unexpected end of JSON input");
  await error.context.body.cancel();
};

const test_no_function_id = async () => {
  const { error } = await client.functions.invoke("user-management", {
    body: {},
  });
  const error_message = error.context.headers.get("x-error-message");
  assertEquals(error_message, "Function ID is required");
  await error.context.body.cancel();
};

const test_function_id_not_found = async () => {
  const { error } = await client.functions.invoke("user-management", {
    body: { function_id: "not-found" },
  });
  const error_message = error.context.headers.get("x-error-message");
  assertEquals(error_message, "Function ID not found");
  await error.context.body.cancel();
};

const test_update_username_no_username = async () => {
  const { data: _data, error } = await client.functions.invoke("user-management", {
    body: { function_id: "update-username" },
  });
  const error_message = error.context.headers.get("x-error-message");
  assertEquals(error_message, "Username is required");
  await error.context.body.cancel();
}

const test_update_username = async () => {
  const client_super: SupabaseClient = createClient(
    supabase_url,
    supabase_service_role_key,
    options,
  );

  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).replace(/:/g, "");
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const convertedTime = Array.from(currentTime).map((digit) =>
    alphabet[parseInt(digit) - 1]
  ).join("");

  const email = "test" + convertedTime + "@example.com";
  const password = "password";
  const { data: _create_user, error: create_user_error } = await client_super.auth
    .admin
    .createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

  if (create_user_error) {
    await logError(create_user_error);
  }

  const { data: test_data, error: sign_in_error } = await client.auth
    .signInWithPassword({
      email: email,
      password: password,
    });

  if (sign_in_error) {
    await logError(sign_in_error);
  }
  const _supabase_user_jwt = test_data.session?.access_token;

  const {data: update_data, error: update_error } = await client.functions.invoke("user-management", {
    body: { function_id: "update-username", username: "new-username" },
  });

  if (update_error) {
    await logError(update_error);
  }
  assertEquals(update_data.data.username, "new-username");

  // delete the user
  const { error: delete_error } = await client_super.auth
    .admin
    .deleteUser(test_data.user?.id!);

  if (delete_error) {
    await logError(delete_error);
  }
};

const test_update_password_no_password = async () => {
  const { data: _data, error } = await client.functions.invoke("user-management", {
    body: { function_id: "update-password" },
  });
  const error_message = error.context.headers.get("x-error-message");
  assertEquals(error_message, "Password is required");
  await error.context.body.cancel();
}

const test_update_password = async () => {
  const client_super: SupabaseClient = createClient(
    supabase_url,
    supabase_service_role_key,
    options,
  );

  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).replace(/:/g, "");
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const convertedTime = Array.from(currentTime).map((digit) =>
    alphabet[parseInt(digit) - 1]
  ).join("");

  const email = "test" + convertedTime + "@example.com";
  const password = "password";
  const { data: _create_user, error: create_user_error } = await client_super.auth
    .admin
    .createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

  if (create_user_error) {
    await logError(create_user_error);
  }

  const { data: test_data, error: sign_in_error } = await client.auth
    .signInWithPassword({
      email: email,
      password: password,
    });

  if (sign_in_error) {
    await logError(sign_in_error);
  }
  const _supabase_user_jwt = test_data.session?.access_token;

  const {data: update_data, error: update_error } = await client.functions.invoke("user-management", {
    body: { function_id: "update-password", password: "new-password" },
  });

  if (update_error) {
    await logError(update_error);
  }

  console.log(update_data);
  assertEquals(update_data.data.user.email, email);

  // delete the user
  const { error: delete_error } = await client_super.auth
    .admin
    .deleteUser(test_data.user?.id!);

  if (delete_error) {
    await logError(delete_error);
  }

}

try {
  Deno.test("Test no function body", test_no_body);
  Deno.test("Test no function id", test_no_function_id);
  Deno.test("Test function id not found", test_function_id_not_found);
  Deno.test("Test update-username no username", test_update_username_no_username);
  Deno.test("Test update-username", test_update_username);
  Deno.test("Test update-password no password", test_update_password_no_password);
  Deno.test("Test update-password", test_update_password);
} catch (e) {
  console.error(e);
}
