import DatabaseCredentialsModal from "./DatabaseCredentialsModal";
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vitest, vi, Mock} from 'vitest';
import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { navigateToAuth } from "./../../app/authentication/actions";

//Mock out Supabase access token retrieval
vitest.mock("./../../utils/supabase/client", () => {
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
});

//Spy on navigateToAuth
vitest.mock('./../../app/authentication/actions', () => ({
  navigateToAuth: vi.fn(),
}));

//Mock out the API calls
global.fetch = vi.fn((url: string, config: any) => {

  if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connect`){
      return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({success: true}),
      })
  }
  else if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/save-db-secrets`){
    return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
    })
  } 

}) as Mock;

//basic component rendering tests
describe('DatabaseCredentialsModal basic rendering tests', () => {

    it('should render successfully', () => {
      const { baseElement } = render(<DatabaseCredentialsModal dbServerID="1234" disclosure="" onConnected={() => {}}/>);
      expect(baseElement).toBeTruthy();
    });

    it('should display a heading when opened', () => {
      render(<DatabaseCredentialsModal dbServerID="1234" disclosure={{isOpen: true}} onConnected={() => {}}/>);
      const text = screen.getByText("Connect to your database server");
      expect(text).toBeInTheDocument();
    });

});

//connection tests
describe('DatabaseCredentialsModal basic connection tests', () => {

  it('should allow the user to enter a username and password to connect to a database', async () => {

    //create a user that can perform actions
    const user = userEvent.setup()

    //render the component
    render(<DatabaseCredentialsModal dbServerID="1234" disclosure={{isOpen: true}} onConnected={() => {}}/>);

    //Get the username field
    const usernameField = screen.getByLabelText("Username");

    //type a username into the username field
    await user.type(usernameField, "mockUsername");

    //Get the password field
    const passwordField = screen.getByLabelText("Password");  
    
    //type a password into the password field
    await user.type(passwordField, "mockPassword");

    //should not be able to see the password by default
    const typedPassword = screen.queryByText("mockPassword");
    expect(typedPassword).not.toBeInTheDocument();

    //get the password visibility button
    const passwordVisibilityButton = screen.getByLabelText("toggle password visibility");
    
    //click the password visibility button
    await user.click(passwordVisibilityButton);

    //should be able to see the password now
    const typedPassword2 = screen.queryByText("mockPassword");
    expect(typedPassword2).not.toBeInTheDocument();

    //get the connect button
    const connectButton = screen.getByText("Connect");

    //click the connect button
    await user.click(connectButton);

    //should make an API call with the correct arguments
    expect(fetch).toBeCalledWith(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connect`,
      { 
        credentials: "include",
        method: "PUT",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + undefined
        },
        body: '{"databaseServerID":"1234","databaseServerCredentials":{"username":"mockUsername","password":"mockPassword"}}'
      }
    );

  });

  it('should allow the user to enter a username and password to connect to a database and remember their credentials', async () => {

    //create a user that can perform actions
    const user = userEvent.setup()

    //render the component
    render(<DatabaseCredentialsModal dbServerID="1234" disclosure={{isOpen: true}} onConnected={() => {}}/>);

    //Get the username field
    const usernameField = screen.getByLabelText("Username");

    //type a username into the username field
    await user.type(usernameField, "mockUsername");

    //Get the password field
    const passwordField = screen.getByLabelText("Password");  
    
    //type a password into the password field
    await user.type(passwordField, "mockPassword");

    //get the remember credentials checkbox
    const rememberCredentialsCheckbox = screen.getByLabelText("Remember my database credentials"); 

    //click the remember credentials checkbox
    await user.click(rememberCredentialsCheckbox);

    //get the connect button
    const connectButton = screen.getByText("Connect");

    //click the connect button
    await user.click(connectButton);

    //should make an API call with the correct arguments
    expect(fetch).toBeCalledWith(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connect`,
      { 
        credentials: "include",
        method: "PUT",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + undefined
        },
        body: '{"databaseServerID":"1234","databaseServerCredentials":{"username":"mockUsername","password":"mockPassword"}}'
      }
    );

    //should make a second API call to remember the database credentials
    expect(fetch).toBeCalledWith(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/save-db-secrets`,
      { 
        credentials: "include",
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + undefined
        },
        body: '{"db_id":"1234","db_secrets":"{\\"user\\":\\"mockUsername\\",\\"password\\":\\"mockPassword\\"}"}'
      }
    );

  });

});

describe('DatabaseCredentialsModal error handling tests', () => {

  it('should display an error when the connection is not successful', async () => {

    //Mock out the API calls
    global.fetch = vi.fn((url: string, config: any) => {

      if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connect`){
          return Promise.resolve({
                ok: false,
                json: () => Promise.resolve({response: {message: "Could not connect"}}),
          })
      }

    }) as Mock;

    //create a user that can perform actions
    const user = userEvent.setup()

    //render the component
    render(<DatabaseCredentialsModal dbServerID="1234" disclosure={{isOpen: true}} onConnected={() => {}}/>);

    //Get the username field
    const usernameField = screen.getByLabelText("Username");

    //type a username into the username field
    await user.type(usernameField, "mockUsername");

    //Get the password field
    const passwordField = screen.getByLabelText("Password");  
    
    //type a password into the password field
    await user.type(passwordField, "mockPassword");

    //get the connect button
    const connectButton = screen.getByText("Connect");

    //click the connect button
    await user.click(connectButton);

  });

  it('should display an error when there is no response', async () => {

    //Mock out the API calls
    global.fetch = vi.fn((url: string, config: any) => {

      if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connect`){
          return Promise.resolve({
                ok: false,
                json: () => Promise.resolve({}),
          })
      }

    }) as Mock;

    //create a user that can perform actions
    const user = userEvent.setup()

    //render the component
    render(<DatabaseCredentialsModal dbServerID="1234" disclosure={{isOpen: true}} onConnected={() => {}}/>);

    //Get the username field
    const usernameField = screen.getByLabelText("Username");

    //type a username into the username field
    await user.type(usernameField, "mockUsername");

    //Get the password field
    const passwordField = screen.getByLabelText("Password");  
    
    //type a password into the password field
    await user.type(passwordField, "mockPassword");

    //get the connect button
    const connectButton = screen.getByText("Connect");

    //click the connect button
    await user.click(connectButton);

  });

  it('should navigate to auth when there is no backend session', async () => {

    //Mock out the API calls
    global.fetch = vi.fn((url: string, config: any) => {

      if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connect`){
        return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({success: true}),
        })
      }else if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/save-db-secrets`){
          return Promise.resolve({
                ok: false,
                json: () => Promise.resolve({response: {message: 'You do not have a backend session'}}),
        })
      }

    }) as Mock;

    //create a user that can perform actions
    const user = userEvent.setup()

    //render the component
    render(<DatabaseCredentialsModal dbServerID="1234" disclosure={{isOpen: true}} onConnected={() => {}}/>);

    //Get the username field
    const usernameField = screen.getByLabelText("Username");

    //type a username into the username field
    await user.type(usernameField, "mockUsername");

    //Get the password field
    const passwordField = screen.getByLabelText("Password");  
    
    //type a password into the password field
    await user.type(passwordField, "mockPassword");

    //get the remember credentials checkbox
    const rememberCredentialsCheckbox = screen.getByLabelText("Remember my database credentials"); 

    //click the remember credentials checkbox
    await user.click(rememberCredentialsCheckbox);

    //get the connect button
    const connectButton = screen.getByText("Connect");

    //click the connect button
    await user.click(connectButton);

    //should navigate to auth
    expect(navigateToAuth).toBeCalled();

  });

});