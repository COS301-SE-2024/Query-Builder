import React from 'react';
import AddOrganisationModal from './AddOrganisationModal';
import { render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vitest, vi, Mock } from 'vitest';
import userEvent from '@testing-library/user-event'

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
  })

  
//Mock out API calls
global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ data: "mock data" }),
    }),
) as Mock;

//basic component rendering tests
describe('AddOrganisationModal basic rendering tests', () => {
    it('should render successfully', () => {
      const { baseElement } = render(<AddOrganisationModal on_add={()=>{}}/>);
      expect(baseElement).toBeTruthy();
    });
});

//modal popup tests
describe('AddOrganisationModal popup tests', () => {

    it('it should open the modal upon clicking the button', async () => {
  
      //create a user that can perform actions
      const user = userEvent.setup()
  
      //render the component
      render(<AddOrganisationModal on_add={()=>{}}/>);
  
      //get the button to add an organisation
      const button = screen.getByText("+ Add");
  
      //click the button to add the organisation
      await user.click(button);
  
      //get the screen text that should be displayed on the modal and assert that it is in the document
      const text = screen.getByText("Add a new organisation");
      expect(text).toBeInTheDocument();
  
    });

});

describe('add organisation tests', () => {

    it('Should be able to fill out the field and add an organisation', async () => {
  
      //create a user that can perform actions
      const user = userEvent.setup()
  
      //render the component
      render(<AddOrganisationModal on_add={()=>{}}/>);
  
      //get the button to add an organisation
      const button = screen.getByText("+ Add");
  
      //click the button to add an organisation
      await user.click(button);
  
      //Get the Organisation Name Field
      const organisationNameField = screen.getByLabelText("Organisation Name");
    
      //type an Organisation Name into the Organisation Name field
      await user.type(organisationNameField, "Mock Organisation Name");
  
      //get the add button
      const addButton = screen.getByText("Add");
  
      //click the add button
      await user.click(addButton);
  
    })
  
});

describe('join organisation tests', () => {

  it('Should be able to fill out the Organisation Hash Code field and join an organisation', async () => {

    //create a user that can perform actions
    const user = userEvent.setup()

    //render the component
    render(<AddOrganisationModal on_add={()=>{}}/>);

    //get the button to add an organisation
    const button = screen.getByText("+ Add");

    //click the button to add an organisation
    await user.click(button);

    //Get the Organisation Hash Code Field
    const organisationHashCodeField = screen.getByLabelText("Organisation Hash Code");
  
    //type an Organisation Name into the Organisation Name field
    await user.type(organisationHashCodeField, "Mock Hash Code");

    //get the join button
    const joinButton = screen.getByText("Join");

    //click the join button
    await user.click(joinButton);

  })

});