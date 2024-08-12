import React from 'react';
import { render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vitest, vi, Mock } from 'vitest';
import userEvent from '@testing-library/user-event'
import EditUserModal from './EditUserModal';

//Mock out Supabase access token retrieval
vitest.mock("./../../utils/supabase/client", () => {
    return{
        createClient: vi.fn().mockImplementation(() => {
            return{
                auth: {
                getToken: vi.fn().mockImplementation(() => {
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
describe('EditUserModal basic rendering tests', () => {
    it('should render successfully', () => {
      const { baseElement } = render(<EditUserModal org_id={"123"} user_id={"123"} on_add={()=>{}}/>);
      expect(baseElement).toBeTruthy();
    });
});

//modal popup tests
describe('EditUserModal popup tests', () => {

    it('it should open the modal upon clicking the button', async () => {
  
      //create a user that can perform actions
      const user = userEvent.setup()
  
      //render the component
      render(<EditUserModal org_id={"123"} user_id={"123"} on_add={()=>{}}/>);
  
      //get the button to add an organisation
      const editIcon = screen.getByTestId("editUserIcon");
  
      //click the button to add the organisation
      await user.click(editIcon);
  
      //get the screen text that should be displayed on the modal and assert that it is in the document
      const text = screen.getByText("Edit the member");
      expect(text).toBeInTheDocument();

      const dropdownRoles = screen.getByTestId("roleDropdown");
      expect(dropdownRoles).toBeInTheDocument();

      await user.click(dropdownRoles);

      const adminRole = screen.getByTestId("adminRole");
      expect(adminRole).toBeInTheDocument();

      await user.click(adminRole);

      const updateButton = screen.getByTestId("updateRoleButton");
      expect(updateButton).toBeInTheDocument();

      
    });

});