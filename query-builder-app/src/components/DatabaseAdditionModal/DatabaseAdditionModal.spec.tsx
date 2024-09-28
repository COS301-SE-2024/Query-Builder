import { render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vitest, vi, Mock } from 'vitest';
import React from 'react';
import DatabaseAdditionModal from './DatabaseAdditionModal';

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

//Mock out API calls
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: "mock data" }),
  }),
) as Mock;

//basic component rendering tests
describe('DatabaseAdditionModal basic rendering tests', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DatabaseAdditionModal org_id={"1234"} on_add={()=>{}}/>);
    expect(baseElement).toBeTruthy();
  });
});

//button should say + Add
describe('DatabaseAdditionModal initial tests', () => {
  it('should display the button to Add a new database', () => {
    render(<DatabaseAdditionModal org_id={"1234"} on_add={()=>{}}/>);
    const text = screen.getByText("+ Add");
    expect(text).toBeInTheDocument();
  });
});

//click the add button
describe('DatabaseAdditionModal modal popup tests', () => {

  it('it should open the modal upon clicking the button', async () => {

    //create a user that can perform actions
    const user = userEvent.setup();

    //render the component
    render(<DatabaseAdditionModal org_id={"1234"} on_add={()=>{}}/>);

    //get the button to add a database
    const button = screen.getByText("+ Add");

    //click the button to add a database
    await user.click(button);

    //get the screen text that should be displayed on the modal and assert that it is in the document
    const text = screen.getByText("Add a new database server to your organisation");
    expect(text).toBeInTheDocument();

  });

  it('The Database Server Name field should be displayed', async () => {

    //create a user that can perform actions
    const user = userEvent.setup();

    //render the component
    render(<DatabaseAdditionModal org_id={"1234"} on_add={()=>{}}/>);

    //get the button to add a database
    const button = screen.getByText("+ Add");

    //click the button to add a database
    await user.click(button);

    const databaseServerNameField = screen.getByLabelText("Database Server Name");
    expect(databaseServerNameField).toBeInTheDocument();

  });

  it('The URL field should be displayed', async () => {

    //create a user that can perform actions
    const user = userEvent.setup();

    //render the component
    render(<DatabaseAdditionModal org_id={"1234"} on_add={()=>{}}/>);

    //get the button to add a database
    const button = screen.getByText("+ Add");

    //click the button to add a database
    await user.click(button);

    const urlField = screen.getByLabelText("URL or Host");
    expect(urlField).toBeInTheDocument();

  });

});

describe('DatabaseAdditionModal add database tests', () => {

  it('Should be able to fill out the fields and add a database', async () => {

    //create a user that can perform actions
    const user = userEvent.setup();

    //render the component
    render(<DatabaseAdditionModal org_id={"1234"} on_add={()=>{}}/>);

    //get the button to add a database
    const button = screen.getByText("+ Add");

    //click the button to add a database
    await user.click(button);

    //Get the Database Server Name Field
    const databaseServerNameField = screen.getByLabelText("Database Server Name");
  
    //type a Database Server Name into the Database Server Name field
    await user.type(databaseServerNameField, "Mock Database Server Name");

    //get the URL or Host Field
    const urlField = screen.getByLabelText("URL or Host");

    //type a valid URL into the URL or Host Field
    await user.type(urlField, "www.mockurl.com");

    //get the add button
    const addButton = screen.getByText("Add");

    //click the add button
    await user.click(addButton);

  }, {timeout: 10000})

});