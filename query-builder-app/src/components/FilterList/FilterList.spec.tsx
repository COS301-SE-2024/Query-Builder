import FilterList from "./FilterList";
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, Mock} from 'vitest';
import { ComparisonOperator, compoundCondition, LogicalOperator, table } from "../../interfaces/intermediateJSON";
import userEvent from '@testing-library/user-event'
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

  if(url == `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metadata/fields`){
      return Promise.resolve({
          ok: true,
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

describe('FilterList filter selection tests', () => {

  it('should allow the user to select a filter', async () => {

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

    let conditionProp: compoundCondition | undefined = undefined;

    //callback function for FilterList to modify the condition
    function updateCondition(condition: compoundCondition){

      //modify conditionProp
      conditionProp = condition;

    }

    render(<FilterList databaseServerID="1234" table={tableProp} condition={conditionProp} onChange={updateCondition}/>);
  
    //create a user that can perform actions
    const user = userEvent.setup();

    //get the add button
    const button = screen.getAllByLabelText('add filter')[0];

    //click the add button
    await user.click(button);

    //find the last_name column
    const userSelection = await screen.findByLabelText("actor - last_name");

    //select the last_name column
    await user.click(userSelection);

    //check that conditionProp now matches the expectedCondition
    const expectedCondition: compoundCondition = {
      operator: LogicalOperator.AND,
      conditions: [
        {
          tableName: "actor",
          column: "last_name",
          operator: ComparisonOperator.EQUAL,
          value: 0
        }
      ]
    }

    expect(conditionProp).toEqual(expectedCondition);

  });
});