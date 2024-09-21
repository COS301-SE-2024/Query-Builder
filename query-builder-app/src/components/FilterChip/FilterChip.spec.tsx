import '@testing-library/jest-dom/vitest'
import FilterChip from "./FilterChip";
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { primitiveCondition, ComparisonOperator, AggregateFunction } from "../../interfaces/intermediateJSON";
import React from 'react';
import userEvent from '@testing-library/user-event'

//basic component rendering tests
describe('Filter Chip basic rendering tests', () => {
    it('should render successfully', () => {

        const primitiveConditionProp: primitiveCondition = {
            tableName: "employees",
            column: "salary",
            operator: ComparisonOperator.GREATER_THAN,
            value: 10000
        }

        const { baseElement } = render(<FilterChip primitiveCondition={primitiveConditionProp} key={''} />);
        expect(baseElement).toBeTruthy();

    });
});

describe('Filter Chip edit tests', () => {
    it('should be able to open the edit popover', async () => {

        const primitiveConditionProp: primitiveCondition = {
            tableName: "employees",
            column: "salary",
            operator: ComparisonOperator.GREATER_THAN,
            value: 10000
        }

        //create a user that can perform actions
        const user = userEvent.setup();

        //render the component
        render(<FilterChip primitiveCondition={primitiveConditionProp} key={''} />);

        //get the edit button
        const button = screen.getAllByLabelText('edit')[0];

        //click the edit button
        await user.click(button);

        //get the screen text that should be displayed on the popover and assert that it is in the document
        const text = screen.getByText("Use a summary statistic");
        expect(text).toBeInTheDocument();

        //click outside the popover to close it
        await user.click(document.body);

        //make sure that the text in the popover is no longer in the document
        const text2 = screen.queryByText("Use a summary statistic");
        expect(text2).toBeNull();

    })
});

describe('Filter Chip aggregate function tests', () => {

    it('should be able to add an aggregate function to the condition', async () => {

        let primitiveConditionProp: primitiveCondition = {
            tableName: "employees",
            column: "salary",
            operator: ComparisonOperator.GREATER_THAN,
            value: 10000
        }

        //callback function for FilterChip to modify primitiveConditionProp
        function updatePrimitiveCondition(updatedPrimitiveCondition: primitiveCondition){

            //modify columnProp
            primitiveConditionProp = updatedPrimitiveCondition;

        }

        //create a user that can perform actions
        const user = userEvent.setup();

        //render the component
        render(<FilterChip primitiveCondition={primitiveConditionProp} onChange={updatePrimitiveCondition} key={''} />);

        //get the edit button
        const button = screen.getAllByLabelText('edit')[0];

        //click the edit button
        await user.click(button);

        //get the aggregate button
        const aggregateButton = screen.getAllByLabelText('Choose filter aggregate button')[0];

        //click the aggregate button
        await user.click(aggregateButton);

        //get the 'Average' button
        const averageButton = screen.getAllByLabelText('Average')[0];

        //click the 'Average' button
        await user.click(averageButton);

        //check that primitiveConditionProp now matches the expectedPrimitiveCondition
        const expectedPrimitiveCondition: primitiveCondition = {
            tableName: "employees",
            column: "salary",
            operator: ComparisonOperator.GREATER_THAN,
            value: 10000,
            aggregate: AggregateFunction.AVG
        }

        expect(primitiveConditionProp).toEqual(expectedPrimitiveCondition);

    });

    it('should be able to remove an aggregate function from the condition', async () => {

        let primitiveConditionProp: primitiveCondition = {
            tableName: "employees",
            column: "salary",
            operator: ComparisonOperator.GREATER_THAN,
            value: 10000,
            aggregate: AggregateFunction.AVG
        }

        //callback function for FilterChip to modify primitiveConditionProp
        function updatePrimitiveCondition(updatedPrimitiveCondition: primitiveCondition){

            //modify columnProp
            primitiveConditionProp = updatedPrimitiveCondition;

        }

        //create a user that can perform actions
        const user = userEvent.setup();

        //render the component
        render(<FilterChip primitiveCondition={primitiveConditionProp} onChange={updatePrimitiveCondition} key={''} />);

        //get the edit button
        const button = screen.getAllByLabelText('edit')[0];

        //click the edit button
        await user.click(button);

        //get the aggregate button
        const aggregateButton = screen.getAllByLabelText('Choose filter aggregate button')[0];

        //click the aggregate button
        await user.click(aggregateButton);

        //get the 'Average' button
        const averageButton = screen.getAllByLabelText('None')[0];

        //click the 'Average' button
        await user.click(averageButton);

        //check that primitiveConditionProp now matches the expectedPrimitiveCondition
        const expectedPrimitiveCondition: primitiveCondition = {
            tableName: "employees",
            column: "salary",
            operator: ComparisonOperator.GREATER_THAN,
            value: 10000,
        }

        expect(primitiveConditionProp).toEqual(expectedPrimitiveCondition);

    });

});

describe('Filter Chip comparison operator tests', () => {

    it('should be able to change the comparison operator for the condition', async () => {

        let primitiveConditionProp: primitiveCondition = {
            tableName: "employees",
            column: "salary",
            operator: ComparisonOperator.GREATER_THAN,
            value: 10000
        }

        //callback function for FilterChip to modify primitiveConditionProp
        function updatePrimitiveCondition(updatedPrimitiveCondition: primitiveCondition){

            //modify columnProp
            primitiveConditionProp = updatedPrimitiveCondition;

        }

        //create a user that can perform actions
        const user = userEvent.setup();

        //render the component
        render(<FilterChip primitiveCondition={primitiveConditionProp} onChange={updatePrimitiveCondition} key={''} />);

        //get the edit button
        const button = screen.getAllByLabelText('edit')[0];

        //click the edit button
        await user.click(button);

        //get the comparison operator button
        const comparisonOperatorButton = screen.getAllByLabelText('Choose comparison operator button')[0];

        //click the comparison operator button
        await user.click(comparisonOperatorButton);

        //get the '<' button
        const lessThanButton = screen.getAllByLabelText('<')[0];

        //click the '<' button
        await user.click(lessThanButton);

        //check that primitiveConditionProp now matches the expectedPrimitiveCondition
        const expectedPrimitiveCondition: primitiveCondition = {
            tableName: "employees",
            column: "salary",
            operator: ComparisonOperator.LESS_THAN,
            value: 10000,
        }

        expect(primitiveConditionProp).toEqual(expectedPrimitiveCondition);

    });

});

describe('Filter Chip value tests', () => {
    
    it('should be able to change a number value', async () => {
    
        let primitiveConditionProp: primitiveCondition = {
            tableName: "employees",
            column: "salary",
            operator: ComparisonOperator.GREATER_THAN,
            value: 10000
        }

        //callback function for FilterChip to modify primitiveConditionProp
        function updatePrimitiveCondition(updatedPrimitiveCondition: primitiveCondition){

            //modify columnProp
            primitiveConditionProp = updatedPrimitiveCondition;

        }

        //create a user that can perform actions
        const user = userEvent.setup();

        //render the component
        render(<FilterChip primitiveCondition={primitiveConditionProp} onChange={updatePrimitiveCondition} key={''} />);

        //get the edit button
        const button = screen.getAllByLabelText('edit')[0];

        //click the edit button
        await user.click(button);

        //get the value input field
        const valueInputField = screen.getAllByLabelText('Value input field')[0];

        //remove the current value from the input field
        await user.type(valueInputField, "{backspace}{backspace}{backspace}{backspace}{backspace}");

        //type a new value into the value field
        await user.type(valueInputField, "20000");

        //check that primitiveConditionProp now matches the expectedPrimitiveCondition
        const expectedPrimitiveCondition: primitiveCondition = {
            tableName: "employees",
            column: "salary",
            operator: ComparisonOperator.GREATER_THAN,
            value: 20000,
        }

        expect(primitiveConditionProp).toEqual(expectedPrimitiveCondition);

    });

    it('should be able to change a string value', async () => {
    
        let primitiveConditionProp: primitiveCondition = {
            tableName: "employees",
            column: "name",
            operator: ComparisonOperator.EQUAL,
            value: "Jack"
        }

        //callback function for FilterChip to modify primitiveConditionProp
        function updatePrimitiveCondition(updatedPrimitiveCondition: primitiveCondition){

            //modify columnProp
            primitiveConditionProp = updatedPrimitiveCondition;

        }

        //create a user that can perform actions
        const user = userEvent.setup();

        //render the component
        render(<FilterChip primitiveCondition={primitiveConditionProp} onChange={updatePrimitiveCondition} key={''} />);

        //get the edit button
        const button = screen.getAllByLabelText('edit')[0];

        //click the edit button
        await user.click(button);

        //get the value input field
        const valueInputField = screen.getAllByLabelText('Value input field')[0];

        //remove the current value from the input field
        await user.type(valueInputField, "{backspace}{backspace}{backspace}{backspace}");

        //type a new value into the value field
        await user.type(valueInputField, "Jill");

        //check that primitiveConditionProp now matches the expectedPrimitiveCondition
        const expectedPrimitiveCondition: primitiveCondition = {
            tableName: "employees",
            column: "name",
            operator: ComparisonOperator.EQUAL,
            value: "Jill",
        }

        expect(primitiveConditionProp).toEqual(expectedPrimitiveCondition);

    });

    it('should be able to change a value to true', async () => {
    
        let primitiveConditionProp: primitiveCondition = {
            tableName: "employees",
            column: "married",
            operator: ComparisonOperator.EQUAL,
            value: false
        }

        //callback function for FilterChip to modify primitiveConditionProp
        function updatePrimitiveCondition(updatedPrimitiveCondition: primitiveCondition){

            //modify columnProp
            primitiveConditionProp = updatedPrimitiveCondition;

        }

        //create a user that can perform actions
        const user = userEvent.setup();

        //render the component
        render(<FilterChip primitiveCondition={primitiveConditionProp} onChange={updatePrimitiveCondition} key={''}/>);

        //get the edit button
        const button = screen.getAllByLabelText('edit')[0];

        //click the edit button
        await user.click(button);

        //get the value input field
        const valueInputField = screen.getAllByLabelText('Value input field')[0];

        //remove the current value from the input field
        await user.type(valueInputField, "{backspace}{backspace}{backspace}{backspace}{backspace}");

        //type a new value into the value field
        await user.type(valueInputField, "true");

        //check that primitiveConditionProp now matches the expectedPrimitiveCondition
        const expectedPrimitiveCondition: primitiveCondition = {
            tableName: "employees",
            column: "married",
            operator: ComparisonOperator.EQUAL,
            value: true,
        }

        expect(primitiveConditionProp).toEqual(expectedPrimitiveCondition);

    });

    it('should be able to change a value to false', async () => {
    
        let primitiveConditionProp: primitiveCondition = {
            tableName: "employees",
            column: "married",
            operator: ComparisonOperator.EQUAL,
            value: true
        }

        //callback function for FilterChip to modify primitiveConditionProp
        function updatePrimitiveCondition(updatedPrimitiveCondition: primitiveCondition){

            //modify columnProp
            primitiveConditionProp = updatedPrimitiveCondition;

        }

        //create a user that can perform actions
        const user = userEvent.setup();

        //render the component
        render(<FilterChip primitiveCondition={primitiveConditionProp} onChange={updatePrimitiveCondition} key={''} />);

        //get the edit button
        const button = screen.getAllByLabelText('edit')[0];

        //click the edit button
        await user.click(button);

        //get the value input field
        const valueInputField = screen.getAllByLabelText('Value input field')[0];

        //remove the current value from the input field
        await user.type(valueInputField, "{backspace}{backspace}{backspace}{backspace}");

        //type a new value into the value field
        await user.type(valueInputField, "false");

        //check that primitiveConditionProp now matches the expectedPrimitiveCondition
        const expectedPrimitiveCondition: primitiveCondition = {
            tableName: "employees",
            column: "married",
            operator: ComparisonOperator.EQUAL,
            value: false,
        }

        expect(primitiveConditionProp).toEqual(expectedPrimitiveCondition);

    });

});