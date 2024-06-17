import * as _supabase_supabase_js from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';
import { GenericSchema, SupabaseClientOptions } from '@supabase/supabase-js/dist/module/lib/types';
import { CookieSerializeOptions } from 'cookie';
export { parse, serialize } from 'cookie';

type CookieOptions = Partial<CookieSerializeOptions>;
type CookieOptionsWithName = {
    name?: string;
} & CookieOptions;
type CookieMethods = {
    get?: (key: string) => Promise<string | null | undefined> | string | null | undefined;
    set?: (key: string, value: string, options: CookieOptions) => Promise<void> | void;
    remove?: (key: string, options: CookieOptions) => Promise<void> | void;
};

declare function createBrowserClient<Database = any, SchemaName extends string & keyof Database = 'public' extends keyof Database ? 'public' : string & keyof Database, Schema extends GenericSchema = Database[SchemaName] extends GenericSchema ? Database[SchemaName] : any>(supabaseUrl: string, supabaseKey: string, options?: SupabaseClientOptions<SchemaName> & {
    cookies?: CookieMethods;
    cookieOptions?: CookieOptionsWithName;
    isSingleton?: boolean;
}): SupabaseClient<Database, SchemaName, Schema>;

declare function createServerClient<Database = any, SchemaName extends string & keyof Database = 'public' extends keyof Database ? 'public' : string & keyof Database, Schema extends GenericSchema = Database[SchemaName] extends GenericSchema ? Database[SchemaName] : any>(supabaseUrl: string, supabaseKey: string, options: SupabaseClientOptions<SchemaName> & {
    cookies: CookieMethods;
    cookieOptions?: CookieOptionsWithName;
}): _supabase_supabase_js.SupabaseClient<Database, SchemaName, Schema>;

declare function isBrowser(): boolean;

declare const DEFAULT_COOKIE_OPTIONS: CookieOptions;

interface Chunk {
    name: string;
    value: string;
}
/**
 * create chunks from a string and return an array of object
 */
declare function createChunks(key: string, value: string, chunkSize?: number): Chunk[];
declare function combineChunks(key: string, retrieveChunk: (name: string) => Promise<string | null | undefined> | string | null | undefined): Promise<string | undefined>;
declare function deleteChunks(key: string, retrieveChunk: (name: string) => Promise<string | null | undefined> | string | null | undefined, removeChunk: (name: string) => Promise<void> | void): Promise<void>;

export { CookieMethods, CookieOptions, CookieOptionsWithName, DEFAULT_COOKIE_OPTIONS, combineChunks, createBrowserClient, createChunks, createServerClient, deleteChunks, isBrowser };
