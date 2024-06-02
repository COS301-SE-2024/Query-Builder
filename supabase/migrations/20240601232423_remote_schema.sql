
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

CREATE TYPE "public"."org_role" AS ENUM (
    'owner',
    'member'
);

ALTER TYPE "public"."org_role" OWNER TO "postgres";

COMMENT ON TYPE "public"."org_role" IS 'This type represents different roles a user can have within an organisation';

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
  begin
  insert into public.users (id, user_meta_data)
  values (new.id, new.raw_user_meta_data);
  return new;
end;
$$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."db_envs" (
    "db_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "db_info" "jsonb" NOT NULL
);

ALTER TABLE "public"."db_envs" OWNER TO "postgres";

COMMENT ON TABLE "public"."db_envs" IS 'Table storing database';

CREATE TABLE IF NOT EXISTS "public"."org_dbs" (
    "org_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "db_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);

ALTER TABLE "public"."org_dbs" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."org_members" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "user_role" "public"."org_role" DEFAULT 'member'::"public"."org_role" NOT NULL
);

ALTER TABLE "public"."org_members" OWNER TO "postgres";

COMMENT ON TABLE "public"."org_members" IS 'Table stores information regarding organisations and the members';

CREATE TABLE IF NOT EXISTS "public"."organisations" (
    "org_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "logo" "text"
);

ALTER TABLE "public"."organisations" OWNER TO "postgres";

COMMENT ON TABLE "public"."organisations" IS 'Table stores organisation information';

CREATE TABLE IF NOT EXISTS "public"."users" (
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_meta_data" "jsonb"
);

ALTER TABLE "public"."users" OWNER TO "postgres";

COMMENT ON TABLE "public"."users" IS 'Table stores the information for the users of our system';

COMMENT ON COLUMN "public"."users"."user_meta_data" IS 'Other information';

ALTER TABLE ONLY "public"."db_envs"
    ADD CONSTRAINT "db_envs_pkey" PRIMARY KEY ("db_id");

ALTER TABLE ONLY "public"."org_dbs"
    ADD CONSTRAINT "org_dbs_pkey" PRIMARY KEY ("org_id", "db_id");

ALTER TABLE ONLY "public"."org_members"
    ADD CONSTRAINT "org_members_pkey" PRIMARY KEY ("org_id", "user_id");

ALTER TABLE ONLY "public"."organisations"
    ADD CONSTRAINT "organisations_name_key" UNIQUE ("name");

ALTER TABLE ONLY "public"."organisations"
    ADD CONSTRAINT "organisations_pkey" PRIMARY KEY ("org_id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");

ALTER TABLE ONLY "public"."org_dbs"
    ADD CONSTRAINT "org_dbs_db_id_fkey" FOREIGN KEY ("db_id") REFERENCES "public"."db_envs"("db_id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."org_dbs"
    ADD CONSTRAINT "org_dbs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("org_id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."org_members"
    ADD CONSTRAINT "org_members_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("org_id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."org_members"
    ADD CONSTRAINT "org_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."db_envs" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."org_dbs" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."org_members" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."organisations" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."db_envs";

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."org_dbs";

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."org_members";

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."organisations";

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."users";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON TABLE "public"."db_envs" TO "anon";
GRANT ALL ON TABLE "public"."db_envs" TO "authenticated";
GRANT ALL ON TABLE "public"."db_envs" TO "service_role";

GRANT ALL ON TABLE "public"."org_dbs" TO "anon";
GRANT ALL ON TABLE "public"."org_dbs" TO "authenticated";
GRANT ALL ON TABLE "public"."org_dbs" TO "service_role";

GRANT ALL ON TABLE "public"."org_members" TO "anon";
GRANT ALL ON TABLE "public"."org_members" TO "authenticated";
GRANT ALL ON TABLE "public"."org_members" TO "service_role";

GRANT ALL ON TABLE "public"."organisations" TO "anon";
GRANT ALL ON TABLE "public"."organisations" TO "authenticated";
GRANT ALL ON TABLE "public"."organisations" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

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
