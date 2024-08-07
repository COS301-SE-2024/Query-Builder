import '@testing-library/jest-dom/vitest'
import React from 'react';
import ColumnChip from './ColumnChip';
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { column, AggregateFunction } from "../../interfaces/intermediateJSON"

//basic component rendering tests
describe('Column Chip basic rendering tests', () => {
  it('should render successfully', () => {

    const columnProp: column = {
        name: "first_name"
    }

    const { baseElement } = render(<ColumnChip column={columnProp}/>);
    expect(baseElement).toBeTruthy();

  });
});

describe('Column Chip edit tests', () => {

    it('should be able to open the edit popover', async () => {

        const columnProp: column = {
            name: "first_name"
        }

        //create a user that can perform actions
        const user = userEvent.setup();

        //render the component
        render(<ColumnChip column={columnProp}/>);

        //get the edit button
        const button = screen.getAllByLabelText('edit')[0];

        //click the edit button
        await user.click(button);

        //get the screen text that should be displayed on the popover and assert that it is in the document
        const text = screen.getByText("Get summary statistics");
        expect(text).toBeInTheDocument();

    });

});

describe('Column Chip aggregate function tests', () => {

    it('should be able to set the column\'s aggregate function to AVG', async () => {

        let columnProp: column = {
            name: "first_name"
        }

        //callback function for column chip to modify columnProp
        function updateColumn(column: column, key: React.Key){

            //modify columnProp
            columnProp = column;

        }

        //create a user that can perform actions
        const user = userEvent.setup();

        //render the component
        render(<ColumnChip column={columnProp} onChange={updateColumn}/>);

        //get the edit button
        const button = screen.getAllByLabelText('edit')[0];

        //click the edit button
        await user.click(button);

        //get the average radio button
        const averageRadioButton = screen.getAllByLabelText('Average')[0];

        //click the average radio button
        await user.click(averageRadioButton);

        //check that columnProp now matches the expectedColumn
        const expectedColumn: column = {
            name: "first_name",
            aggregation: AggregateFunction.AVG
        }

        expect(columnProp).toEqual(expectedColumn);

    });

    it('should be able to set the column\'s aggregate function back to none', async () => {

        let columnProp: column = {
            name: "first_name",
            aggregation: AggregateFunction.AVG
        }

        //callback function for column chip to modify columnProp
        function updateColumn(column: column, key: React.Key){

            //modify columnProp
            columnProp = column;

        }

        //create a user that can perform actions
        const user = userEvent.setup();

        //render the component
        render(<ColumnChip column={columnProp} onChange={updateColumn}/>);

        //get the edit button
        const button = screen.getAllByLabelText('edit')[0];

        //click the edit button
        await user.click(button);

        //get the average radio button
        const noneRadioButton = screen.getAllByLabelText('None')[0];

        //click the average radio button
        await user.click(noneRadioButton);

        //check that columnProp now matches the expectedColumn
        const expectedColumn: column = {
            name: "first_name"
        }

        expect(columnProp).toEqual(expectedColumn);

    });

 });

describe('Column Chip alias tests', () => {

    it('should be able to give the column an alias', async () => {

        let columnProp: column = {
            name: "first_name"
        }

        //callback function for column chip to modify columnProp
        function updateColumn(column: column, key: React.Key){

            //modify columnProp
            columnProp = column;

        }

        //create a user that can perform actions
        const user = userEvent.setup();

        //render the component
        render(<ColumnChip column={columnProp} onChange={updateColumn}/>);

        //get the edit button
        const button = screen.getAllByLabelText('edit')[0];

        //click the edit button
        await user.click(button);

        //get the alias input field
        const aliasInputField = screen.getAllByLabelText('Rename')[0];

        //type an alias into the input field
        await user.type(aliasInputField, "Given Name");

        //check that columnProp now matches the expectedColumn
        const expectedColumn: column = {
            name: "first_name",
            alias: "Given Name"
        }

        expect(columnProp).toEqual(expectedColumn);

    });

    it('should be able to remove a column\'s alias', async () => {

        let columnProp: column = {
            name: "first_name",
            alias: "Given Name"
        }

        //callback function for column chip to modify columnProp
        function updateColumn(column: column, key: React.Key){

            //modify columnProp
            columnProp = column;

        }

        //create a user that can perform actions
        const user = userEvent.setup();

        //render the component
        render(<ColumnChip column={columnProp} onChange={updateColumn}/>);

        //get the edit button
        const button = screen.getAllByLabelText('edit')[0];

        //click the edit button
        await user.click(button);

        //get the alias input field
        const aliasInputField = screen.getAllByLabelText('Rename')[0];

        //remove the alias from the input field
        await user.type(aliasInputField, "{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}");

        //check that columnProp now matches the expectedColumn
        const expectedColumn: column = {
            name: "first_name"
        }

        expect(columnProp).toEqual(expectedColumn);

    });

});