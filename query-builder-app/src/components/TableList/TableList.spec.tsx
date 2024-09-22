import '@testing-library/jest-dom/vitest'
import { table } from "@/interfaces/intermediateJSON";
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vitest, vi, Mock, beforeAll } from 'vitest';
import TableList from "./TableList";
import userEvent from '@testing-library/user-event'
import React from 'react';

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

    if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/tables`){
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([{table_name: "users", qbee_id: 0}, {table_name: "payments", qbee_id: 1}]),
        })
    }
    else if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/foreign-keys`){
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([{table_name: "payments", qbee_id: 1, referenced_column_name: "id", column_name: "user_id", table_schema: "sakila"}]),
        })
    }
    else if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/fields`){
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: [{name: "first_name"}, {name: "last_name"}] }),
        })
    }

}) as Mock;

//basic component rendering tests
describe('TableList basic rendering tests', () => {

    it('should render successfully', () => {
  
      const tableProp: table = {
          name: "users",
          columns: []
      }
  
      const { baseElement } = render(<TableList language='mysql' databaseServerID="1234" databaseName="sakila" table={tableProp} />);
      expect(baseElement).toBeTruthy();
  
    });
});

describe('TableList table selection tests', () => {

    it('should be able to render the "+" button when there are joinable tables', async () => {

        let tableProp: table = {
            name: "",
            columns: []
        }

        //callback function for TableForm to modify table
        function updateTable(table: table){

            //modify tableProp
            tableProp = table;

        }

        //create a user that can perform actions
        const user = userEvent.setup();
    
        //render the TableList
        render(<TableList language='mysql' databaseServerID="1234" databaseName="sakila" table={tableProp} onChange={updateTable} />);

        //get the add button
        //make sure to wait for it to load once joinable tables are fetched from the API
        const button = (await screen.findAllByLabelText('add table button'))[0];

        expect(button).toBeInTheDocument();

    })

});