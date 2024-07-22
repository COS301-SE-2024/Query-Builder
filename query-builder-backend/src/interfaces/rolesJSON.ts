export interface Role {
  is_owner: boolean;
  add_dbs: boolean;
  update_dbs: boolean;
  remove_dbs: boolean;
  invite_users: boolean;
  remove_users: boolean;
  update_user_roles: boolean;
  view_all_dbs: boolean;
  view_all_users: boolean;
  update_db_access: boolean;
}
