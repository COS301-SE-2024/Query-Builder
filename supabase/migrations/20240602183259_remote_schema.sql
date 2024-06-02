alter table "public"."users" drop constraint "users_user_id_fkey";

alter table "public"."users" add column "username" text;

alter table "public"."users" alter column "user_id" drop default;

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

alter table "public"."users" add constraint "users_username_key" UNIQUE using index "users_username_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.give_username()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
    random_string text;
begin
    random_string := substr(md5(random()::text), 1, 8);
    return 'Guest' || random_string;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_username()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
    new.username := public.give_username();
    return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  begin
    insert into public.users (user_id, user_meta_data)
    values (new.id, new.raw_user_meta_data);
    return new;
end;
$function$
;

create policy "Enable insert for authenticated users only"
on "public"."users"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable insert for users based on user_id"
on "public"."users"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable read access for all users"
on "public"."users"
as permissive
for select
to public
using (true);


create policy "Users can update their own profile"
on "public"."users"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));


CREATE TRIGGER update_username_trigger BEFORE INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION update_username();


