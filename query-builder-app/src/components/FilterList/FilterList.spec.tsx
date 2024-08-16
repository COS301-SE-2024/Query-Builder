import FilterList from "./FilterList";
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, Mock} from 'vitest';
import { table } from "../../interfaces/intermediateJSON";
import React from 'react';

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

  if(url == `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/fields`){
      return Promise.resolve({
          json: () => Promise.resolve({ data: [{name: "first_name"}, {name: "last_name"}] }),
      })
  }

}) as Mock;

//basic component rendering tests
describe('FilterList basic rendering tests', () => {

    it('should render successfully', () => {

      const tableProp: table = {
        name: "actor",
        columns: [{name: "first_name"}],
        join: {
          table1MatchingColumnName: "actor_id",
          table2MatchingColumnName: "actor_id",
          table2: {
            name: "film_actor",
            columns: [{name: "film_id"}]
          }
        }
      }
  
      const { baseElement } = render(<FilterList databaseServerID="1234" table={tableProp} condition={undefined}/>);
      expect(baseElement).toBeTruthy();
  
    });
});