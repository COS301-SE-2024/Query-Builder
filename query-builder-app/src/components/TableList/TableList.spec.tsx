import { table } from "@/interfaces/intermediateJSON";
import { render } from '@testing-library/react';
import { describe, it, expect, vitest, vi, Mock, beforeAll } from 'vitest';
import TableList from "./TableList";
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

    if(url == "http://localhost:55555/api/metadata/tables"){
        return Promise.resolve({
            json: () => Promise.resolve({ data: [{name: "users", qbee_id: 0}, {name: "payments", qbee_id: 1}] }),
        })
    }
    else if(url == "http://localhost:55555/api/metadata/foreign-keys"){
        return Promise.resolve({
            json: () => Promise.resolve({ data: [{name: "payments", qbee_id: 1, REFERENCED_COLUMN_NAME: "id", COLUMN_NAME: "user_id", TABLE_SCHEMA: "sakila"}] }),
        })
    }
    else if(url == "http://localhost:55555/api/metadata/fields"){
        return Promise.resolve({
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
  
      const { baseElement } = render(<TableList databaseName="sakila" table={tableProp} />);
      expect(baseElement).toBeTruthy();
  
    });
});