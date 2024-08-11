
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."database_type" AS ENUM (
    'mysql',
    'mongodb',
    'postgresql'
);

ALTER TYPE "public"."database_type" OWNER TO "postgres";

COMMENT ON TYPE "public"."database_type" IS 'All the types of databases we handle';

CREATE TYPE "public"."org_role" AS ENUM (
    'owner',
    'admin',
    'member'
);

ALTER TYPE "public"."org_role" OWNER TO "postgres";

COMMENT ON TYPE "public"."org_role" IS 'This type represents different roles a user can have within an organisation';

CREATE OR REPLACE FUNCTION "public"."give_username"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
    random_string text;
begin
    random_string := substr(md5(random()::text), 1, 8);
    return 'Guest' || random_string;
end;
$$;

ALTER FUNCTION "public"."give_username"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  begin
    insert into public.profiles (user_id, first_name, last_name, email, phone)
    values (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', new.email, new.phone);
    return new;
end;
$$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_profile_email"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE public.profiles
    SET email = NEW.email
    WHERE user_id = NEW.id;
    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_profile_email"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_profile_phone"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE public.profiles
    SET phone = NEW.phone
    WHERE user_id = NEW.id;
    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_profile_phone"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_username"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
    new.username := public.give_username();
    return new;
end;
$$;

ALTER FUNCTION "public"."update_username"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."db_access" (
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "db_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "db_secrets" "text"
);

ALTER TABLE "public"."db_access" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."db_envs" (
    "db_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "db_info" "jsonb" NOT NULL,
    "type" "public"."database_type" NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "host" "text" NOT NULL
);

ALTER TABLE "public"."db_envs" OWNER TO "postgres";

COMMENT ON TABLE "public"."db_envs" IS 'Table storing database';

COMMENT ON COLUMN "public"."db_envs"."host" IS 'Host path of the database';

CREATE TABLE IF NOT EXISTS "public"."org_dbs" (
    "org_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "db_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);

ALTER TABLE "public"."org_dbs" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."org_hashes" (
    "hash_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "hash" "text" NOT NULL
);

ALTER TABLE "public"."org_hashes" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."org_members" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "user_role" "public"."org_role" DEFAULT 'member'::"public"."org_role" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role_permissions" "jsonb",
    "verified" boolean DEFAULT false
);

ALTER TABLE "public"."org_members" OWNER TO "postgres";

COMMENT ON TABLE "public"."org_members" IS 'Table stores information regarding organisations and the members';

CREATE TABLE IF NOT EXISTS "public"."organisations" (
    "org_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "logo" "text" DEFAULT 'https://eckgzmlkenswecvnhezp.supabase.co/storage/v1/object/public/org_logos/default_logo.webp'::"text" NOT NULL,
    "owner_id" "uuid"
);

ALTER TABLE "public"."organisations" OWNER TO "postgres";

COMMENT ON TABLE "public"."organisations" IS 'Table stores organisation information';

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_meta_data" "jsonb",
    "username" "text",
    "first_name" "text",
    "last_name" "text",
    "profile_photo" "text" DEFAULT 'https://eckgzmlkenswecvnhezp.supabase.co/storage/v1/object/public/profile_photos/default_profile.png?t=2024-06-22T17%3A34%3A00.052Z'::"text",
    "email" "text",
    "phone" "text"
);

ALTER TABLE "public"."profiles" OWNER TO "postgres";

COMMENT ON TABLE "public"."profiles" IS 'Table storing user information';

CREATE TABLE IF NOT EXISTS "public"."saved_queries" (
    "query_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "saved_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "parameters" "json" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "db_id" "uuid" NOT NULL,
    "queryTitle" "text"
);

ALTER TABLE "public"."saved_queries" OWNER TO "postgres";

COMMENT ON TABLE "public"."saved_queries" IS 'Table storing queries that have been saved by certain users after being executed on certain database servers.';

COMMENT ON COLUMN "public"."saved_queries"."queryTitle" IS 'This is the title users assign to a given query';

ALTER TABLE ONLY "public"."db_access"
    ADD CONSTRAINT "db_access_pkey" PRIMARY KEY ("user_id", "db_id");

ALTER TABLE ONLY "public"."db_envs"
    ADD CONSTRAINT "db_envs_pkey" PRIMARY KEY ("db_id");

ALTER TABLE ONLY "public"."org_dbs"
    ADD CONSTRAINT "org_dbs_pkey" PRIMARY KEY ("org_id", "db_id");

ALTER TABLE ONLY "public"."org_hashes"
    ADD CONSTRAINT "org_hashes_hash_key" UNIQUE ("hash");

ALTER TABLE ONLY "public"."org_hashes"
    ADD CONSTRAINT "org_hashes_org_id_key" UNIQUE ("org_id");

ALTER TABLE ONLY "public"."org_hashes"
    ADD CONSTRAINT "org_hashes_pkey" PRIMARY KEY ("hash_id");

ALTER TABLE ONLY "public"."org_members"
    ADD CONSTRAINT "org_members_pkey" PRIMARY KEY ("org_id", "user_id");

ALTER TABLE ONLY "public"."organisations"
    ADD CONSTRAINT "organisations_name_key" UNIQUE ("name");

ALTER TABLE ONLY "public"."organisations"
    ADD CONSTRAINT "organisations_pkey" PRIMARY KEY ("org_id");

ALTER TABLE ONLY "public"."saved_queries"
    ADD CONSTRAINT "saved_queries_pkey" PRIMARY KEY ("query_id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");

CREATE OR REPLACE TRIGGER "update_username_trigger" BEFORE INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_username"();

ALTER TABLE ONLY "public"."db_access"
    ADD CONSTRAINT "db_access_db_id_fkey" FOREIGN KEY ("db_id") REFERENCES "public"."db_envs"("db_id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."db_access"
    ADD CONSTRAINT "db_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."org_dbs"
    ADD CONSTRAINT "org_dbs_db_id_fkey" FOREIGN KEY ("db_id") REFERENCES "public"."db_envs"("db_id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."org_dbs"
    ADD CONSTRAINT "org_dbs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("org_id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."org_hashes"
    ADD CONSTRAINT "org_hashes_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("org_id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."org_members"
    ADD CONSTRAINT "org_members_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("org_id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."org_members"
    ADD CONSTRAINT "org_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."organisations"
    ADD CONSTRAINT "organisations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."saved_queries"
    ADD CONSTRAINT "saved_queries_db_id_fkey" FOREIGN KEY ("db_id") REFERENCES "public"."db_envs"("db_id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."saved_queries"
    ADD CONSTRAINT "saved_queries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE;

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;

CREATE POLICY "DeleteQueries" ON "public"."saved_queries" FOR DELETE USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."db_access" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."org_hashes" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."org_members" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."organisations" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."saved_queries" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for users based on user_id" ON "public"."profiles" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable read access for all users" ON "public"."db_envs" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."org_dbs" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."org_hashes" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."org_members" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."profiles" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."saved_queries" FOR SELECT USING (true);

CREATE POLICY "Enable read access for owners" ON "public"."organisations" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "owner_id"));

CREATE POLICY "Enable read access for users based on user_id" ON "public"."db_access" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable update for users based on user_id" ON "public"."db_access" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Owners can add dbs" ON "public"."db_envs" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "organisations"."owner_id"
   FROM "public"."organisations"
  WHERE ("organisations"."owner_id" = "auth"."uid"()))));

CREATE POLICY "Owners can add dbs" ON "public"."org_dbs" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "organisations"."owner_id"
   FROM "public"."organisations"
  WHERE ("organisations"."owner_id" = "auth"."uid"()))));

CREATE POLICY "Owners can delete dbs" ON "public"."org_dbs" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "organisations"."owner_id"
   FROM "public"."organisations"
  WHERE ("organisations"."owner_id" = "auth"."uid"()))));

CREATE POLICY "Owners can delete organisations" ON "public"."organisations" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "owner_id"));

CREATE POLICY "Owners can remove dbs" ON "public"."db_envs" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "organisations"."owner_id"
   FROM "public"."organisations"
  WHERE ("organisations"."owner_id" = "auth"."uid"()))));

CREATE POLICY "Owners can remove members" ON "public"."org_members" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "organisations"."owner_id"
   FROM "public"."organisations"
  WHERE ("organisations"."owner_id" = "auth"."uid"()))));

CREATE POLICY "Owners can update dbs" ON "public"."db_envs" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "organisations"."owner_id"
   FROM "public"."organisations"
  WHERE ("organisations"."owner_id" = "auth"."uid"()))));

CREATE POLICY "Owners can update dbs" ON "public"."org_dbs" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "organisations"."owner_id"
   FROM "public"."organisations"
  WHERE ("organisations"."owner_id" = "auth"."uid"()))));

CREATE POLICY "Owners can update members" ON "public"."org_members" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "organisations"."owner_id"
   FROM "public"."organisations"
  WHERE ("organisations"."owner_id" = "auth"."uid"()))));

CREATE POLICY "Owners can update their own orgs" ON "public"."organisations" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "owner_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "owner_id"));

CREATE POLICY "Users can be removed from organisations" ON "public"."org_members" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

ALTER TABLE "public"."db_access" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."db_envs" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."org_dbs" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."org_hashes" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."org_members" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."organisations" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."saved_queries" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."give_username"() TO "anon";
GRANT ALL ON FUNCTION "public"."give_username"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."give_username"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_profile_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile_email"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_profile_phone"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile_phone"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile_phone"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_username"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_username"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_username"() TO "service_role";

GRANT ALL ON TABLE "public"."db_access" TO "anon";
GRANT ALL ON TABLE "public"."db_access" TO "authenticated";
GRANT ALL ON TABLE "public"."db_access" TO "service_role";

GRANT ALL ON TABLE "public"."db_envs" TO "anon";
GRANT ALL ON TABLE "public"."db_envs" TO "authenticated";
GRANT ALL ON TABLE "public"."db_envs" TO "service_role";

GRANT ALL ON TABLE "public"."org_dbs" TO "anon";
GRANT ALL ON TABLE "public"."org_dbs" TO "authenticated";
GRANT ALL ON TABLE "public"."org_dbs" TO "service_role";

GRANT ALL ON TABLE "public"."org_hashes" TO "anon";
GRANT ALL ON TABLE "public"."org_hashes" TO "authenticated";
GRANT ALL ON TABLE "public"."org_hashes" TO "service_role";

GRANT ALL ON TABLE "public"."org_members" TO "anon";
GRANT ALL ON TABLE "public"."org_members" TO "authenticated";
GRANT ALL ON TABLE "public"."org_members" TO "service_role";

GRANT ALL ON TABLE "public"."organisations" TO "anon";
GRANT ALL ON TABLE "public"."organisations" TO "authenticated";
GRANT ALL ON TABLE "public"."organisations" TO "service_role";

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";

GRANT ALL ON TABLE "public"."saved_queries" TO "anon";
GRANT ALL ON TABLE "public"."saved_queries" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_queries" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
