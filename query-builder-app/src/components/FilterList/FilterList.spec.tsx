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
  else{
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ query_data: [{query_id: "id", queryTitle: "title", parameters: {}}] }),
  })
  }

}) as Mock;

import { condition, primitiveCondition } from "../../interfaces/intermediateJSON";

function isPrimitiveCondition(condition: condition): condition is primitiveCondition {
  return (condition as primitiveCondition).column !== undefined;
}

function cleanCondition(condition: compoundCondition): compoundCondition {
  // Remove `id` from each condition in the `conditions` array
  const cleanedConditions = condition.conditions.map(cond => {
    if (isPrimitiveCondition(cond)) {
      // cond is of type primitiveCondition
      const { id, ...conditionRest } = cond;
      return conditionRest;
    }
    // If not primitiveCondition, return as is
    return cond;
  });

  // Return the cleaned condition with the `id` removed from the root if present
  const { id, ...conditionRest } = condition;

  return {
    ...conditionRest,
    conditions: cleanedConditions
  };
}

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

    const cleanedConditionProp = conditionProp ? cleanCondition(conditionProp) : undefined;
    expect(cleanedConditionProp).toEqual(expectedCondition);

  });
});