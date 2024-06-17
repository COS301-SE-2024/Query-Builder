"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  DEFAULT_COOKIE_OPTIONS: () => DEFAULT_COOKIE_OPTIONS,
  combineChunks: () => combineChunks,
  createBrowserClient: () => createBrowserClient,
  createChunks: () => createChunks,
  createServerClient: () => createServerClient,
  deleteChunks: () => deleteChunks,
  isBrowser: () => isBrowser,
  parse: () => import_cookie.parse,
  serialize: () => import_cookie.serialize
});
module.exports = __toCommonJS(src_exports);

// src/createBrowserClient.ts
var import_supabase_js = require("@supabase/supabase-js");
var import_ramda = require("ramda");

// src/utils/helpers.ts
var import_cookie = require("cookie");
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
var import_cookie2 = require("cookie");
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
              const cookie = (0, import_cookie2.parse)(document.cookie);
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
                  document.cookie = (0, import_cookie2.serialize)(chunk.name, chunk.value, {
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
                const documentCookies = (0, import_cookie2.parse)(document.cookie);
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
                  document.cookie = (0, import_cookie2.serialize)(chunkName, "", {
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
  const clientOptions = (0, import_ramda.mergeDeepRight)(
    cookieClientOptions,
    userDefinedClientOptions
  );
  if (isSingleton) {
    const browser = isBrowser();
    if (browser && cachedBrowserClient) {
      return cachedBrowserClient;
    }
    const client = (0, import_supabase_js.createClient)(
      supabaseUrl,
      supabaseKey,
      clientOptions
    );
    if (browser) {
      cachedBrowserClient = client;
    }
    return client;
  }
  return (0, import_supabase_js.createClient)(supabaseUrl, supabaseKey, clientOptions);
}

// src/createServerClient.ts
var import_supabase_js2 = require("@supabase/supabase-js");
var import_ramda2 = require("ramda");
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
  const clientOptions = (0, import_ramda2.mergeDeepRight)(
    cookieClientOptions,
    userDefinedClientOptions
  );
  return (0, import_supabase_js2.createClient)(supabaseUrl, supabaseKey, clientOptions);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_COOKIE_OPTIONS,
  combineChunks,
  createBrowserClient,
  createChunks,
  createServerClient,
  deleteChunks,
  isBrowser,
  parse,
  serialize
});
//# sourceMappingURL=index.js.map