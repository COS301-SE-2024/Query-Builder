import SaveQueryModal from "./SaveQueryModal";
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vitest, vi, Mock } from 'vitest';
import { Query } from "@/interfaces/intermediateJSON";
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest';

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

//Mock out the API calls
global.fetch = vi.fn((url: string, config: any) => {

    if(url == `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/api/query-management/save-query`){
        return Promise.resolve({
            json: () => Promise.resolve({}),
        })
    }

}) as Mock;

//basic component rendering tests
describe('SaveQueryModal basic rendering tests', () => {
    it('should render successfully', () => {

        const queryProp: Query = {
            databaseServerID: "1234",
            queryParams: {
                language: "sql",
                query_type: "select",
                databaseName: "sakila",
                table: {
                    name: "actor",
                    columns: [{name: "first_name"}]
                }
            }
        }

        const { baseElement } = render(<SaveQueryModal query={queryProp} />);
        expect(baseElement).toBeTruthy();
    });
});

//button should say 'Save Query'
describe('SaveQueryModal initial tests', () => {

    it('should display the button to save a query', () => {

        const queryProp: Query = {
            databaseServerID: "1234",
            queryParams: {
                language: "sql",
                query_type: "select",
                databaseName: "sakila",
                table: {
                    name: "actor",
                    columns: [{name: "first_name"}]
                }
            }
        }

        render(<SaveQueryModal query={queryProp} />);

        const text = screen.getByText("Save Query");
        expect(text).toBeInTheDocument();

    });
    
});

describe('SaveQueryModal modal popup tests', () => {

    it('should display the modal when the button is clicked', async () => {

        const queryProp: Query = {
            databaseServerID: "1234",
            queryParams: {
                language: "sql",
                query_type: "select",
                databaseName: "sakila",
                table: {
                    name: "actor",
                    columns: [{name: "first_name"}]
                }
            }
        }

        //create a user that can perform actions
        const user = userEvent.setup()

        //render the component
        render(<SaveQueryModal query={queryProp} />);

        //get the button to open the modal
        const button = screen.getByText("Save Query");

        //click the button to open the modal
        await user.click(button);

        //get the screen text that should be displayed on the modal and assert that it is in the document
        const text = screen.getByText("Save a query");
        expect(text).toBeInTheDocument();

    });
    
});

describe('SaveQueryModal save query tests', () => {

    it('should be able to save a query', async () => {

        const queryProp: Query = {
            databaseServerID: "1234",
            queryParams: {
                language: "sql",
                query_type: "select",
                databaseName: "sakila",
                table: {
                    name: "actor",
                    columns: [{name: "first_name"}]
                }
            }
        }

        //create a user that can perform actions
        const user = userEvent.setup()

        //render the component
        render(<SaveQueryModal query={queryProp} />);

        //get the button to open the modal
        const button = screen.getByText("Save Query");

        //click the button to open the modal
        await user.click(button);

        //get the Query Name input field
        const organisationNameField = screen.getByLabelText("Query Name");

        //type an Organisation Name into the Organisation Name field
        await user.type(organisationNameField, "Mock Query Name");

        //get the "Save" button
        const saveButton = screen.getByText("Save");

        //click the add button
        await user.click(saveButton);

    });
    
});