import { render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, vitest, Mock } from 'vitest';
import React from 'react';
import NaturalLanguage from './NaturalLanguage';
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

vi.mock('next/navigation', () => ({
  useParams: () => ({ databaseServerID: 'mock-database-server-id' })
}));

describe('NaturalLanguage basic rendering tests', () => {
  it('renders without crashing', () => {
    const {baseElement} = render(<NaturalLanguage/>);
    expect(baseElement).toBeTruthy();
  });
});

describe('NaturalLanguage make a query', () => {
  it('can make a natural language query', async () => {

    //Mock out the API calls
    global.fetch = vi.fn((url: string, config: any) => {

      if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/natural-language/query`){
          return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                databaseServerId: "1234",
                queryParams: {
                  language: "sql",
                  query_type: "select",
                  databaseName: "sakila",
                  table: {name: "actor", columns: [{name: "first_name"}, {name: "last_name"}]}
                }
            }),
          })
      }

    }) as Mock;

    //create a user that can perform actions
    const user = userEvent.setup()

    render(<NaturalLanguage/>);

    //Get the input field
    const inputField = screen.getByLabelText("Type your query here");

    //type a natural language query into the input field
    await user.type(inputField, "List all the actors' first and last names");

    //get the query button
    const queryButton = screen.getByText("Query");

    //click the join button
    await user.click(queryButton);
   
  });

  it('can throw an error', async () => {

    //Mock out the API calls
    global.fetch = vi.fn((url: string, config: any) => {

      if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/natural-language/query`){
          return Promise.resolve({
              ok: false,
          })
      }

    }) as Mock;

    //create a user that can perform actions
    const user = userEvent.setup()

    render(<NaturalLanguage/>);

    //Get the input field
    const inputField = screen.getByLabelText("Type your query here");

    //type a natural language query into the input field
    await user.type(inputField, "List all the actors' first and last names");

    //get the query button
    const queryButton = screen.getByText("Query");

    //click the join button
    await user.click(queryButton);
   
  });

});