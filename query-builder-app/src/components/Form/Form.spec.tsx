import { render } from '@testing-library/react';
import Form from './Form';
import React from 'react';
import { describe, it, expect, vi, Mock } from 'vitest';

vi.mock('next/navigation', () => ({
  useParams: () => ({ databaseServerID: 'mock-database-server-id' })
}));

//Mock out Supabase access token retrieval
vi.mock("./../../utils/supabase/client", () => {
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

  if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/schemas`){
      return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({data: [{SCHEMA_NAME: "sakila"}]}),
      })
  }
  else if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/query-management/get-single-query`){
      return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({parameters: {language: "sql", query_type: "select", databaseName: "sakila", table: {name: "actor", columns: [{name: "first_name"}]}}}),
      })
  }


}) as Mock;

//basic component rendering tests
describe('Form basic rendering tests', () => {

    it('should render successfully', () => {

        const {baseElement} = render(<Form/>);
        expect(baseElement).toBeTruthy();

    });

});