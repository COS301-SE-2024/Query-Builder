import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vitest, vi, Mock } from 'vitest';
import { table } from "@/interfaces/intermediateJSON";
import TableForm from "./TableForm"
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

//Mock out the API call to retrieve the table's columns
global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ data: [{name: "first_name"}, {name: "last_name"}] }),
    }),
) as Mock;

//basic component rendering tests
describe('TableForm basic rendering tests', () => {
    it('should render successfully', () => {
  
      const tableProp: table = {
          name: "users",
          columns: []
      }
  
      const { baseElement } = render(<TableForm table={tableProp} />);
      expect(baseElement).toBeTruthy();
  
    });
});

describe('TableForm column selection tests', () => {

    it('should be able to select a column and add it to a table', async () => {
  
        let tableProp: table = {
            name: "users",
            columns: []
        }

        //callback function for TableForm to modify table
        function updateTable(table: table){

            //modify tableProp
            tableProp = table;

        }

        //create a user that can perform actions
        const user = userEvent.setup();
    
        //render the TableForm
        render(<TableForm table={tableProp} onChange={updateTable} />);

        //get the add button
        const button = screen.getAllByLabelText('addColumn')[0];

        //click the add button
        await user.click(button);

        //find the first_name column
        const userSelection = screen.getByLabelText("first_name");

        //select the first_name column
        await user.click(userSelection);

        //check that tableProp now matches the expectedTable
        const expectedTable: table = {
            name: "users",
            columns: [{name: "first_name"}]
        }

        expect(tableProp).toEqual(expectedTable);
  
    });

    it('should be able to select a column and remove it from a table', async () => {
  
        let tableProp: table = {
            name: "users",
            columns: [{name: "last_name"}]
        }

        //callback function for TableForm to modify table
        function updateTable(table: table){

            //modify tableProp
            tableProp = table;

        }

        //create a user that can perform actions
        const user = userEvent.setup();
    
        //render the TableForm
        render(<TableForm table={tableProp} onChange={updateTable} />);

        //get the add button
        const button = screen.getAllByLabelText('addColumn')[0];

        //click the add button
        await user.click(button);

        //find the last_name column
        const userSelection = screen.getByLabelText("last_name");

        //select the last_name column
        await user.click(userSelection);

        //check that tableProp now matches the expectedTable
        const expectedTable: table = {
            name: "users",
            columns: []
        }

        expect(tableProp).toEqual(expectedTable);
  
    });

});