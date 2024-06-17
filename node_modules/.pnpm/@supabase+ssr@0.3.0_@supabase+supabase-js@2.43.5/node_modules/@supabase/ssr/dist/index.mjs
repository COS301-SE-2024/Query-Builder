// src/createBrowserClient.ts
import { createClient } from "@supabase/supabase-js";
import { mergeDeepRight } from "ramda";

// src/utils/helpers.ts
import { parse, serialize } from "cookie";
function isBrowser() {
  return typeof window !== "undefined" && typeof window.document !== "undefined";
}

// src/utils/constants.ts
var DEFAULT_COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax",
  httpOnly: false,
  maxAge: 60 * 60 * 24 * 365 * 1e3
};

// src/utils/chunker.ts
var MAX_CHUNK_SIZE = 3180;
function createChunks(key, value, chunkSize) {
  const resolvedChunkSize = chunkSize ?? MAX_CHUNK_SIZE;
  let encodedValue = encodeURIComponent(value);
  if (encodedValue.length <= resolvedChunkSize) {
    return [{ name: key, value }];
  }
  const chunks = [];
  while (encodedValue.length > 0) {
    let encodedChunkHead = encodedValue.slice(0, resolvedChunkSize);
    const lastEscapePos = encodedChunkHead.lastIndexOf("%");
    if (lastEscapePos > resolvedChunkSize - 3) {
      encodedChunkHead = encodedChunkHead.slice(0, lastEscapePos);
    }
    let valueHead = "";
    while (encodedChunkHead.length > 0) {
      try {
        valueHead = decodeURIComponent(encodedChunkHead);
        break;
      } catch (error) {
        if (error instanceof URIError && encodedChunkHead.at(-3) === "%" && encodedChunkHead.length > 3) {
          encodedChunkHead = encodedChunkHead.slice(0, encodedChunkHead.length - 3);
        } else {
          throw error;
        }
      }
    }
    chunks.push(valueHead);
    encodedValue = encodedValue.slice(encodedChunkHead.length);
  }
  return chunks.map((value2, i) => ({ name: `${key}.${i}`, value: value2 }));
}
async function combineChunks(key, retrieveChunk) {
  const value = await retrieveChunk(key);
  if (value) {
    return value;
  }
  let values = [];
  for (let i = 0; ; i++) {
    const chunkName = `${key}.${i}`;
    const chunk = await retrieveChunk(chunkName);
    if (!chunk) {
      break;
    }
    values.push(chunk);
  }
  if (values.length > 0) {
    return values.join("");
  }
}
async function deleteChunks(key, retrieveChunk, removeChunk) {
  const value = await retrieveChunk(key);
  if (value) {
    await removeChunk(key);
    return;
  }
  for (let i = 0; ; i++) {
    const chunkName = `${key}.${i}`;
    const chunk = await retrieveChunk(chunkName);
    if (!chunk) {
      break;
    }
    await removeChunk(chunkName);
  }
}

// src/createBrowserClient.ts
import { parse as parse2, serialize as serialize2 } from "cookie";
var cachedBrowserClient;
function createBrowserClient(supabaseUrl, supabaseKey, options) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `Your project's URL and Key are required to create a Supabase client!

Check your Supabase project's API settings to find these values

https://supabase.com/dashboard/project/_/settings/api`
    );
  }
  let cookies = {};
  let isSingleton = true;
  let cookieOptions;
  let userDefinedClientOptions;
  if (options) {
    ({ cookies = {}, isSingleton = true, cookieOptions, ...userDefinedClientOptions } = options);
    cookies = cookies || {};
  }
  if (cookieOptions == null ? void 0 : cookieOptions.name) {
    userDefinedClientOptions.auth = {
      ...userDefinedClientOptions.auth,
      storageKey: cookieOptions.name
    };
  }
  const cookieClientOptions = {
    global: {
      headers: {
        "X-Client-Info": `${"supabase-ssr"}/${"0.3.0"}`
      }
    },
    auth: {
      flowType: "pkce",
      autoRefreshToken: isBrowser(),
      detectSessionInUrl: isBrowser(),
      persistSession: true,
      storage: {
        // this client is used on the browser so cookies can be trusted
        isServer: false,
        getItem: async (key) => {
          const chunkedCookie = await combineChunks(key, async (chunkName) => {
            if (typeof cookies.get === "function") {
              return await cookies.get(chunkName);
            }
            if (isBrowser()) {
              const cookie = parse2(document.cookie);
              return cookie[chunkName];
            }
          });
          return chunkedCookie;
        },
        setItem: async (key, value) => {
          const chunks = await createChunks(key, value);
          await Promise.all(
            chunks.map(async (chunk) => {
              if (typeof cookies.set === "function") {
                await cookies.set(chunk.name, chunk.value, {
                  ...DEFAULT_COOKIE_OPTIONS,
                  ...cookieOptions,
                  maxAge: DEFAULT_COOKIE_OPTIONS.maxAge
                });
              } else {
                if (isBrowser()) {
                  document.cookie = serialize2(chunk.name, chunk.value, {
                    ...DEFAULT_COOKIE_OPTIONS,
                    ...cookieOptions,
                    maxAge: DEFAULT_COOKIE_OPTIONS.maxAge
                  });
                }
              }
            })
          );
        },
        removeItem: async (key) => {
          if (typeof cookies.remove === "function" && typeof cookies.get !== "function") {
            console.log(
              "Removing chunked cookie without a `get` method is not supported.\n\n	When you call the `createBrowserClient` function from the `@supabase/ssr` package, make sure you declare both a `get` and `remove` method on the `cookies` object.\n\nhttps://supabase.com/docs/guides/auth/server-side/creating-a-client"
            );
            return;
          }
          await deleteChunks(
            key,
            async (chunkName) => {
              if (typeof cookies.get === "function") {
                return await cookies.get(chunkName);
              }
              if (isBrowser()) {
                const documentCookies = parse2(document.cookie);
                return documentCookies[chunkName];
              }
            },
            async (chunkName) => {
              if (typeof cookies.remove === "function") {
                await cookies.remove(chunkName, {
                  ...DEFAULT_COOKIE_OPTIONS,
                  ...cookieOptions,
                  maxAge: 0
                });
              } else {
                if (isBrowser()) {
                  document.cookie = serialize2(chunkName, "", {
                    ...DEFAULT_COOKIE_OPTIONS,
                    ...cookieOptions,
                    maxAge: 0
                  });
                }
              }
            }
          );
        }
      }
    }
  };
  const clientOptions = mergeDeepRight(
    cookieClientOptions,
    userDefinedClientOptions
  );
  if (isSingleton) {
    const browser = isBrowser();
    if (browser && cachedBrowserClient) {
      return cachedBrowserClient;
    }
    const client = createClient(
      supabaseUrl,
      supabaseKey,
      clientOptions
    );
    if (browser) {
      cachedBrowserClient = client;
    }
    return client;
  }
  return createClient(supabaseUrl, supabaseKey, clientOptions);
}

// src/createServerClient.ts
import { createClient as createClient2 } from "@supabase/supabase-js";
import { mergeDeepRight as mergeDeepRight2 } from "ramda";
function createServerClient(supabaseUrl, supabaseKey, options) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `Your project's URL and Key are required to create a Supabase client!

Check your Supabase project's API settings to find these values

https://supabase.com/dashboard/project/_/settings/api`
    );
  }
  const { cookies, cookieOptions, ...userDefinedClientOptions } = options;
  if (cookieOptions == null ? void 0 : cookieOptions.name) {
    userDefinedClientOptions.auth = {
      ...userDefinedClientOptions.auth,
      storageKey: cookieOptions.name
    };
  }
  const cookieClientOptions = {
    global: {
      headers: {
        "X-Client-Info": `${"supabase-ssr"}/${"0.3.0"}`
      }
    },
    auth: {
      flowType: "pkce",
      autoRefreshToken: isBrowser(),
      detectSessionInUrl: isBrowser(),
      persistSession: true,
      storage: {
        // to signal to the libraries that these cookies are coming from a server environment and their value should not be trusted
        isServer: true,
        getItem: async (key) => {
          const chunkedCookie = await combineChunks(key, async (chunkName) => {
            if (typeof cookies.get === "function") {
              return await cookies.get(chunkName);
            }
          });
          return chunkedCookie;
        },
        setItem: async (key, value) => {
          const chunks = createChunks(key, value);
          await Promise.all(
            chunks.map(async (chunk) => {
              if (typeof cookies.set === "function") {
                await cookies.set(chunk.name, chunk.value, {
                  ...DEFAULT_COOKIE_OPTIONS,
                  ...cookieOptions,
                  maxAge: DEFAULT_COOKIE_OPTIONS.maxAge
                });
              }
            })
          );
        },
        removeItem: async (key) => {
          if (typeof cookies.remove === "function" && typeof cookies.get !== "function") {
            console.log(
              "Removing chunked cookie without a `get` method is not supported.\n\n	When you call the `createServerClient` function from the `@supabase/ssr` package, make sure you declare both a `get` and `remove` method on the `cookies` object.\n\nhttps://supabase.com/docs/guides/auth/server-side/creating-a-client"
            );
            return;
          }
          deleteChunks(
            key,
            async (chunkName) => {
              if (typeof cookies.get === "function") {
                return await cookies.get(chunkName);
              }
            },
            async (chunkName) => {
              if (typeof cookies.remove === "function") {
                return await cookies.remove(chunkName, {
                  ...DEFAULT_COOKIE_OPTIONS,
                  ...cookieOptions,
                  maxAge: 0
                });
              }
            }
          );
        }
      }
    }
  };
  const clientOptions = mergeDeepRight2(
    cookieClientOptions,
    userDefinedClientOptions
  );
  return createClient2(supabaseUrl, supabaseKey, clientOptions);
}
export {
  DEFAULT_COOKIE_OPTIONS,
  combineChunks,
  createBrowserClient,
  createChunks,
  createServerClient,
  deleteChunks,
  isBrowser,
  parse,
  serialize
};
//# sourceMappingURL=index.mjs.map