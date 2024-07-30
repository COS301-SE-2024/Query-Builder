import '@testing-library/jest-dom/vitest'
import React from 'react';
import ColumnChip from './ColumnChip';
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { column } from '@/interfaces/intermediateJSON';

const columnProp: column = {
    name: "first_name"
}

//basic component rendering tests
describe('Column Chip basic rendering tests', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ColumnChip column={columnProp}/>);
    expect(baseElement).toBeTruthy();
  });
});

describe('Column Chip edit tests', () => {

    it('should be able to open the edit popover', async () => {

        //create a user that can perform actions
        const user = userEvent.setup();

        //render the component
        const { baseElement } = render(<ColumnChip column={columnProp}/>);

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

        //create a user that can perform actions
        const user = userEvent.setup();

        //render the component
        const { baseElement } = render(<ColumnChip column={columnProp}/>);

        //get the edit button
        const button = screen.getAllByLabelText('edit')[0];

        //click the edit button
        await user.click(button);

        //get the average radio button
        const averageRadioButton = screen.getAllByLabelText('Average')[0];

        //click the average radio button
        await user.click(averageRadioButton);

    });

    it('should be able to set the column\'s aggregate function to None', async () => {

        //create a user that can perform actions
        const user = userEvent.setup();

        //render the component
        const { baseElement } = render(<ColumnChip column={columnProp}/>);

        //get the edit button
        const button = screen.getAllByLabelText('edit')[0];

        //click the edit button
        await user.click(button);

        //get the average radio button
        const averageRadioButton = screen.getAllByLabelText('None')[0];

        //click the average radio button
        await user.click(averageRadioButton);

    });

});

describe('Column Chip alias tests', () => {

    it('should be able to give the column an alias', async () => {

        //create a user that can perform actions
        const user = userEvent.setup();

        //render the component
        const { baseElement } = render(<ColumnChip column={columnProp}/>);

        //get the edit button
        const button = screen.getAllByLabelText('edit')[0];

        //click the edit button
        await user.click(button);

    });

});