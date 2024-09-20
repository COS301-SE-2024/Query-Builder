import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi,  beforeEach, afterEach  } from 'vitest';
import React from 'react';
import OrganisationManagement from './OrganisationManagement';
// import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as ServerActions from '../../app/serverActions';
import { createClient } from './../../utils/supabase/client';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { wait } from '@testing-library/user-event/dist/cjs/utils/index.js';


const getToken = vi.fn().mockResolvedValue('test-token');
const setHashCodeCopyText = vi.fn();

vi.mock('./../../utils/supabase/client', () => ({
    createClient: () => ({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              access_token: 'mock-token',
              user: { id: 'mock-user-id' }
            }
          }
        })
      }
    })
}));

vi.mock('next/navigation', () => ({
    useParams: () => ({ orgServerID: 'mock-org-id' })
}));


vi.mock('OrganisationManagement', () => ({
  ...vi.importActual('OrganisationManagement'), // Import other exports from the module
  getUser: vi.fn(), // Mock the getUser function
}));

//Spy on navigateToForm
vi.spyOn(ServerActions, 'navigateToForm');

vi.spyOn(toast, 'error');

//basic component rendering tests
describe('Organisation management basic rendering tests', () => {
    it('should render successfully', async () => {
      const { baseElement } = render(<OrganisationManagement/>);
      expect(baseElement).toBeTruthy();
  
    });
});

describe('General admin Functionality', () => {
    beforeEach(() => {
        // Mock fetch
        global.fetch = vi.fn().mockImplementation((url) => {
          if (url.includes('get-members')) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                data: [{ profiles: { user_id: 'mock-user-id', profile_photo: 'mock-url', email: 'test@example.com', first_name: 'John', last_name: 'Doe' }, user_role: 'admin', verified: false }]
              })
            });
          }
          else if (url.includes('create-hash')) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                data: [{ hash: 'mock-hash-code' }]
              })
            });
          }
          else if (url.includes('upload-org-logo')) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                publicUrl: 'updated-mock-logo-url'
              })
            });
          }
          else if(url.includes("get-org")){
            return Promise.resolve({
                  ok: true,
                  json: () => Promise.resolve({data: [{
                    created_at: "",
                    logo: "mock-logo-url",
                    name: "Mock Org",
                    org_id: "MockOrgID",
                    db_envs: [
                      {
                        created_at: "",
                        name: "Mock Database Server",
                        db_id: "MockDBID",
                        db_info: "",
                        type: "mysql"
                      }
                    ],
                    org_members: [
                      { profiles: { user_id: 'mock-user-id', profile_photo: 'mock-url', email: 'test@example.com', first_name: 'John', last_name: 'Doe' }, user_role: 'admin', verified: false }
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
          else if (url.includes('update-org')) {
            return Promise.resolve({
              ok: true,
              status: 200
            });
          }
        });
      });

      it('should render organisation info and update test', async () => {
        await waitFor(async() => {
          render(<OrganisationManagement/>);
        });
        

        expect(screen.getByText("Mock Org")).toBeInTheDocument();
        expect(screen.getByTestId("OrganisationLogoImage")).toHaveAttribute("src", 'mock-logo-url');
        // expect(screen.getByText("test@example.com")).toBeInTheDocument();
        const user = userEvent.setup();
        const tabs = screen.getAllByLabelText('orgInfo')[0];
        await user.click(tabs);

        expect(screen.getByTestId("updateOrgLogo")).toHaveAttribute("src", 'mock-logo-url');
        expect(screen.getByTestId("file-input")).toBeTruthy();

        expect(screen.getByTestId("orgName-change")).toBeTruthy();
        expect(screen.getByText("Update")).toBeTruthy();
        const deleteButton = screen.getByText("Leave Organisation");

        expect(deleteButton).toBeTruthy();
        // user.click(deleteButton);

    });

    it('should render members table successfully', async () => {
        await waitFor(async() => {
          render(<OrganisationManagement/>);
        });

        const user = userEvent.setup();
        const tabs = screen.getAllByLabelText('orgMembers')[0];

        await user.click(tabs);

        const orgMembers = screen.getAllByLabelText('Organisation Members Table')[0];

        expect(orgMembers).toBeTruthy();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    // it('should render organisation details for admin', async () => {
    //     // Mock the useParams hook
    //     await waitFor(async() => {
    //       render(<OrganisationManagement/>);
    //     });
    //     // screen.debug(); 

    //     expect(screen.getByText("Mock Org")).toBeInTheDocument();
        
    //     // expect(screen.getByAltText(/Organisation Logo/i)).toHaveAttribute('src', 'mock-logo-url');
    //     // expect(screen.getByText('Share Join Code')).toBeInTheDocument();
    //     // // Wait for the component to fetch and render data
    //     // waitFor(() => {
    //     //   expect(screen.getByTestId('orgName-change')).toBeInTheDocument();
    //     //   expect(screen.getByText(/Delete Organisation/i)).toBeInTheDocument();
    //     });
  });

    // it('should render database table successfully', async () => {
    //   waitFor(async () => {
    //     render(<OrganisationManagement />);
    //   });

    //   const user = userEvent.setup();
    //   const tabs = screen.getAllByLabelText('orgDatabases')[0];

    //   await user.click(tabs);
    //   const serverText = (await screen.findAllByText('Mock Database Server'))[0];

    //   //click the database server link
    //   await user.click(serverText);
  
    //   //expect to be redirected to the query form
    //   // expect(ServerActions.navigateToForm).toBeCalled();
    // });


describe('Owner user Functionality', () => {
  beforeEach(() => {
      // Mock fetch
      global.fetch = vi.fn().mockImplementation((url) => {
        if (url.includes('get-members')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: [{ profiles: { user_id: 'mock-user-id', profile_photo: 'mock-url', email: 'test@example.com', first_name: 'John', last_name: 'Doe' }, user_role: 'owner', verified: false }]
            })
          });
        }
        else if (url.includes('get-org')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({data: [{
              created_at: "alkjfa",
              logo: "mock-logo-url",
              name: "Mock Org",
              org_id: "MockOrgID",
              db_envs: [
                {
                  created_at: "",
                  name: "Mock Database Server",
                  db_id: "MockDBID",
                  db_info: "",
                  type: "mysql"
                }
              ],
              org_members: [
                { profiles: { user_id: 'mock-user-id', profile_photo: 'mock-url', email: 'test@example.com', first_name: 'John', last_name: 'Doe' }, user_role: 'admin', verified: false }
              ]
            }]}),
        });
        }
        else if (url.includes('create-hash')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: [{ hash: 'mock-hash-code' }]
            })
          });
        }
        else if (url.includes('upload-org-logo')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              publicUrl: 'updated-mock-logo-url'
            })
          });
        }
      });
    });

  it('should render organisation info and update test', async () => {
    await waitFor(async() => {
      render(<OrganisationManagement/>);
    });

    const user = userEvent.setup();
    const tabs = screen.getAllByLabelText('orgInfo')[0];
    await user.click(tabs);

    expect(screen.getByTestId("updateOrgLogo")).toHaveAttribute("src", 'mock-logo-url');
    expect(screen.getByTestId("file-input")).toBeTruthy();

    expect(screen.getByTestId("orgName-change")).toBeTruthy();
    expect(screen.getByText("Update")).toBeTruthy();
    const deleteButton = screen.getByText("Delete Organisation");

    expect(deleteButton).toBeTruthy();
    // user.click(deleteButton);

  });

});

describe('Error Handling of getMembers with 401 status code', () => {

  beforeEach(() => {
    // Mock fetch
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('get-members')) {
        return Promise.resolve({
          ok: false,
          status: 401
        });
      }
      return Promise.reject(new Error('Unknown API call'));
    });
  });

  
  it('renders error message when getMembers throws an error', async () => {
    waitFor(() => {
      render(<OrganisationManagement />);
      screen.debug(); 
    });

    const user = userEvent.setup();
    const tabs = screen.getAllByLabelText('orgMembers')[0];
    await user.click(tabs);
    
    expect(screen.getByText('You are not authorized to view this! Please let an administrator verify your account in the organisation!')).toBeInTheDocument();
    expect(toast.error).toBeCalled();
    // Wait for the error to be handled and check for the error message
    await waitFor(() => {
    });
  });
});

describe('Error Handling of getMembers with 400 status code', () => {

  beforeEach(() => {
    // Mock fetch
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('get-members')) {
        return Promise.resolve({
          ok: false,
          status: 400
        });
      }
      return Promise.reject(new Error('Unknown API call'));
    });
  });

  
  it('renders error message when getMembers throws an error', async () => {
    waitFor(() => {
      render(<OrganisationManagement />);
      screen.debug(); 
    });

    const user = userEvent.setup();
    const tabs = screen.getAllByLabelText('orgMembers')[0];
    await user.click(tabs);
    
    expect(screen.getByText('Error occurred while trying to fetch members, please try again later!')).toBeInTheDocument();
    expect(toast.error).toBeCalled();
    // Wait for the error to be handled and check for the error message
    await waitFor(() => {
    });
  });
});
