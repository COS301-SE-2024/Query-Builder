import { render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest';
import React from 'react';

import DatabaseConnectionModal from './DatabaseConnectionModal';
import { user } from '@nextui-org/theme';

//basic component rendering tests
describe('DatabaseConnectionModal basic rendering tests', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DatabaseConnectionModal/>);
    expect(baseElement).toBeTruthy();
  });
});

//button should say + Add
describe('DatabaseConnectionModal initial tests', () => {
  it('should display the button to Add a new database', () => {
    render(<DatabaseConnectionModal/>);
    const text = screen.getByText("+ Add");
    expect(text).toBeInTheDocument();
  });
});

//click the add button
describe('DatabaseConnectionModal modal popup tests', () => {

  it('it should open the modal upon clicking the button', async () => {

    //create a user that can perform actions
    const user = userEvent.setup()

    //render the component
    render(<DatabaseConnectionModal/>);

    //get the button to add a database
    const button = screen.getByText("+ Add");

    //click the button to add a database
    await user.click(button);

    //get the screen text that should be displayed on the modal and assert that it is in the document
    const text = screen.getByText("Connect to a database");
    expect(text).toBeInTheDocument();

  });

  it('The URL field should be displayed', async () => {

    //create a user that can perform actions
    const user = userEvent.setup()

    //render the component
    render(<DatabaseConnectionModal/>);

    //get the button to add a database
    const button = screen.getByText("+ Add");

    //click the button to add a database
    await user.click(button);

    //get the screen text that should be displayed on the modal and assert that it is in the document
    const urlField = screen.getByLabelText("URL or Host")
    expect(urlField).toBeInTheDocument();

  });

  it('The Username field should be displayed', async () => {

    //create a user that can perform actions
    const user = userEvent.setup()

    //render the component
    render(<DatabaseConnectionModal/>);

    //get the button to add a database
    const button = screen.getByText("+ Add");

    //click the button to add a database
    await user.click(button);

    //get the screen text that should be displayed on the modal and assert that it is in the document
    const usernameField = screen.getByLabelText("Username")
    expect(usernameField).toBeInTheDocument();

  });

  it('The Password field should be displayed', async () => {

    //create a user that can perform actions
    const user = userEvent.setup()

    //render the component
    render(<DatabaseConnectionModal/>);

    //get the button to add a database
    const button = screen.getByText("+ Add");

    //click the button to add a database
    await user.click(button);

    //get the screen text that should be displayed on the modal and assert that it is in the document
    const passwordField = screen.getByLabelText("Password")
    expect(passwordField).toBeInTheDocument();

  });

});