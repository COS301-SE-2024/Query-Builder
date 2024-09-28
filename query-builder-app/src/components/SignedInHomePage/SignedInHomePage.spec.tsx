import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignedInHomePage from './SignedInHomePage';
import { describe, it, expect, vi, Mock } from 'vitest';
import userEvent from '@testing-library/user-event'
import * as ServerActions from '../../app/serverActions';
import toast from 'react-hot-toast';

//Mock out Supabase access token retrieval
vi.mock("./../../utils/supabase/client", () => {
  return{
      createClient: vi.fn().mockImplementation(() => {
          return{
              auth: {
              getSession: vi.fn().mockImplementation(() => {
                  return{
                      data: vi.fn().mockReturnThis(),
                      session: vi.fn().mockReturnThis(),
                      access_token: "randomAccessToken"
                  }
              })
          }}
      })
  }
})

//Mock out Next redirects
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {}
}));

//Mock out the API calls
global.fetch = vi.fn((url: string, config: any) => {

  if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/get-org`){
      return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({data: [{
              name: "Mock Org",
              org_id: "MockOrgID",
              db_envs: [
                {
                  name: "Mock Database Server",
                  db_id: "MockDBID"
                }
              ],
              org_members: [
                {
                  role_permissions: {
                    add_dbs: true,
                    is_owner: true,
                    remove_dbs: true,
                    update_dbs: true,
                    invite_users: true,
                    remove_users: true,
                    view_all_dbs: true,
                    view_all_users: true,
                    update_db_access: true,
                    update_user_roles: true
                  }
                }
              ]
            }]}),
      });
  }
  else if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/has-active-connection`){
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({hasActiveConnection: false}),
    });
  }

}) as Mock;

//Spy on navigateToForm
vi.spyOn(ServerActions, 'navigateToForm');

//Spy on toast.error
vi.spyOn(toast, 'error');

//basic component rendering tests
describe('SignedInHomePage basic rendering tests', () => {

  it('should render successfully and display the org and its database server', async () => {

      render(<SignedInHomePage/>);

      const orgText = (await screen.findAllByText('Mock Org'))[0];
      expect(orgText).toBeInTheDocument();

      const serverText = (await screen.findAllByText('Mock Database Server'))[0];
      expect(serverText).toBeInTheDocument();

  });

});

//query database tests
describe('SignedInHomePage querying tests', () => {

  it('should be able to query a database that has an active connection', async () => {

    //Mock out the API calls
    global.fetch = vi.fn((url: string, config: any) => {

      if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/get-org`){
          return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({data: [{
                  name: "Mock Org",
                  org_id: "MockOrgID",
                  db_envs: [
                    {
                      name: "Mock Database Server",
                      db_id: "MockDBID"
                    }
                  ],
                  org_members: [
                    {
                      role_permissions: {
                        add_dbs: true,
                        is_owner: true,
                        remove_dbs: true,
                        update_dbs: true,
                        invite_users: true,
                        remove_users: true,
                        view_all_dbs: true,
                        view_all_users: true,
                        update_db_access: true,
                        update_user_roles: true
                      }
                    }
                  ]
                }]}),
          });
      }
      else if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/has-active-connection`){
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({hasActiveConnection: true}),
        });
      }

    }) as Mock;

    //create a user that can perform actions
    const user = userEvent.setup();

    //render the component
    render(<SignedInHomePage/>);

    //find the database server link to click
    const serverText = (await screen.findAllByText('Mock Database Server'))[0];

    //click the database server link
    await user.click(serverText);

    //expect to be redirected to the query form
    expect(ServerActions.navigateToForm).toBeCalled();

  });

  it('should be able to query a database that has no active connection, but db secrets saved', async () => {

    //Mock out the API calls
    global.fetch = vi.fn((url: string, config: any) => {

      if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/get-org`){
          return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({data: [{
                  name: "Mock Org",
                  org_id: "MockOrgID",
                  db_envs: [
                    {
                      name: "Mock Database Server",
                      db_id: "MockDBID"
                    }
                  ],
                  org_members: [
                    {
                      role_permissions: {
                        add_dbs: true,
                        is_owner: true,
                        remove_dbs: true,
                        update_dbs: true,
                        invite_users: true,
                        remove_users: true,
                        view_all_dbs: true,
                        view_all_users: true,
                        update_db_access: true,
                        update_user_roles: true
                      }
                    }
                  ]
                }]}),
          });
      }
      else if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/has-active-connection`){
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({hasActiveConnection: false}),
        });
      }
      else if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/has-saved-db-credentials`){
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({saved_db_credentials: true}),
        });
      }
      else if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connect`){
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({success: true}),
        });
      }

    }) as Mock;

    //create a user that can perform actions
    const user = userEvent.setup();

    //render the component
    render(<SignedInHomePage/>);

    //find the database server link to click
    const serverText = (await screen.findAllByText('Mock Database Server'))[0];

    //click the database server link
    await user.click(serverText);

    //expect to be redirected to the query form
    expect(ServerActions.navigateToForm).toBeCalled();

  });

  it('should be able to query a database that has no active connection, and no db secrets saved', async () => {

    //Mock out the API calls
    global.fetch = vi.fn((url: string, config: any) => {

      if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/get-org`){
          return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({data: [{
                  name: "Mock Org",
                  org_id: "MockOrgID",
                  db_envs: [
                    {
                      name: "Mock Database Server",
                      db_id: "MockDBID"
                    }
                  ],
                  org_members: [
                    {
                      role_permissions: {
                        add_dbs: true,
                        is_owner: true,
                        remove_dbs: true,
                        update_dbs: true,
                        invite_users: true,
                        remove_users: true,
                        view_all_dbs: true,
                        view_all_users: true,
                        update_db_access: true,
                        update_user_roles: true
                      }
                    }
                  ]
                }]}),
          });
      }
      else if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/has-active-connection`){
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({hasActiveConnection: false}),
        });
      }
      else if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/has-saved-db-credentials`){
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({saved_db_credentials: false}),
        });
      }
      else if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connect`){
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({success: true}),
        });
      }

    }) as Mock;

    //create a user that can perform actions
    const user = userEvent.setup();

    //render the component
    render(<SignedInHomePage/>);

    //find the database server link to click
    const serverText = (await screen.findAllByText('Mock Database Server'))[0];

    //click the database server link
    await user.click(serverText);

    //expect the DatabaseCredentialsModal to show
    const modalText = (await screen.findAllByText('Connect to your database server'))[0];
    expect(modalText).toBeInTheDocument();

  });

  it('should display an error when connection with saved credentials failed with message', async () => {

    //Mock out the API calls
    global.fetch = vi.fn((url: string, config: any) => {

      if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/get-org`){
          return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({data: [{
                  name: "Mock Org",
                  org_id: "MockOrgID",
                  db_envs: [
                    {
                      name: "Mock Database Server",
                      db_id: "MockDBID"
                    }
                  ],
                  org_members: [
                    {
                      role_permissions: {
                        add_dbs: true,
                        is_owner: true,
                        remove_dbs: true,
                        update_dbs: true,
                        invite_users: true,
                        remove_users: true,
                        view_all_dbs: true,
                        view_all_users: true,
                        update_db_access: true,
                        update_user_roles: true
                      }
                    }
                  ]
                }]}),
          });
      }
      else if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/has-active-connection`){
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({hasActiveConnection: false}),
        });
      }
      else if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/has-saved-db-credentials`){
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({saved_db_credentials: true}),
        });
      }
      else if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connect`){
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({
            response: {
              message: "Can't connect"
            }}),
        });
      }

    }) as Mock;

    //create a user that can perform actions
    const user = userEvent.setup();

    //render the component
    render(<SignedInHomePage/>);

    //find the database server link to click
    const serverText = (await screen.findAllByText('Mock Database Server'))[0];

    //click the database server link
    await user.click(serverText);

    //expect an error
    expect(toast.error).toBeCalled();

  });

  it('should display an error when connection with saved credentials failed without message', async () => {

    //Mock out the API calls
    global.fetch = vi.fn((url: string, config: any) => {

      if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/get-org`){
          return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({data: [{
                  name: "Mock Org",
                  org_id: "MockOrgID",
                  db_envs: [
                    {
                      name: "Mock Database Server",
                      db_id: "MockDBID"
                    }
                  ],
                  org_members: [
                    {
                      role_permissions: {
                        add_dbs: true,
                        is_owner: true,
                        remove_dbs: true,
                        update_dbs: true,
                        invite_users: true,
                        remove_users: true,
                        view_all_dbs: true,
                        view_all_users: true,
                        update_db_access: true,
                        update_user_roles: true
                      }
                    }
                  ]
                }]}),
          });
      }
      else if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/has-active-connection`){
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({hasActiveConnection: false}),
        });
      }
      else if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/has-saved-db-credentials`){
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({saved_db_credentials: true}),
        });
      }
      else if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connect`){
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({})
        });
      }

    }) as Mock;

    //create a user that can perform actions
    const user = userEvent.setup();

    //render the component
    render(<SignedInHomePage/>);

    //find the database server link to click
    const serverText = (await screen.findAllByText('Mock Database Server'))[0];

    //click the database server link
    await user.click(serverText);

    //expect an error
    expect(toast.error).toBeCalled();

  });

});