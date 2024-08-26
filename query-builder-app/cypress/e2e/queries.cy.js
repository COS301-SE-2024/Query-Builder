import '@testing-library/cypress/add-commands';
describe('Queries', () => {

  it('Can add a database server to an organisation', () => {

    //visit home page
    cy.viewport(1920, 1080);
    cy.visit('/');

    //Log in
    cy.get('.sign-in-container')
    .findByLabelText('Email')
    .type(Cypress.env('test_username'), {log: false});
    cy.get('.sign-in-container').findByLabelText('Password').type(Cypress.env('test_password'), {log: false});

    cy.contains('Login').click();

    //Add organisation
    cy.contains('+ Add').click();
    cy.findByLabelText('Organisation Name').type('Cypress Organisation');
    cy.findByLabelText("add new organisation button").click();

    //Assert that the organisation has been added
    cy.contains('Cypress Organisation').should('be.visible');

    //Click the add button for database servers
    cy.findByLabelText("add database server button").click();

    //Fill in the fields to add the DB server
    cy.findByLabelText('Database Server Name').type('Cypress Sakila');
    cy.findByLabelText('URL or Host').type('127.0.0.1');
    cy.findByLabelText('Username').type(Cypress.env('mysql_username'), {log: false});
    cy.findByLabelText('Password').type(Cypress.env('mysql_password'), {log: false});

    //Click on connect
    cy.findByLabelText("connect new database button").click();

    //Assert that the database server has been added
    cy.contains('Cypress Sakila').should('be.visible');

    //Go to organisation settings
    cy.contains('settings').click();

    //Delete the organisation
    cy.contains('Delete Organisation').click();

    //Assert that the organisation has been deleted
    cy.contains('Home').click();
    cy.contains('Your Organisations').should('be.visible');
    cy.contains('Cypress Organisation').should('not.exist');

  });

  it('Can make a simple database query', () => {

    //visit home page
    cy.viewport(1920, 1080);
    cy.visit('/');

    //Log in
    cy.get('.sign-in-container')
    .findByLabelText('Email')
    .type(Cypress.env('test_username'), {log: false});
    cy.get('.sign-in-container').findByLabelText('Password').type(Cypress.env('test_password'), {log: false});

    cy.contains('Login').click();

    //Add organisation
    cy.contains('+ Add').click();
    cy.findByLabelText('Organisation Name').type('Cypress Organisation');
    cy.findByLabelText("add new organisation button").click();

    //Assert that the organisation has been added
    cy.contains('Cypress Organisation').should('be.visible');

    //Click the add button for database servers
    cy.findByLabelText("add database server button").click();

    //Fill in the fields to add the DB server
    cy.findByLabelText('Database Server Name').type('Cypress Sakila');
    cy.findByLabelText('URL or Host').type('127.0.0.1');
    cy.findByLabelText('Username').type(Cypress.env('mysql_username'), {log: false});
    cy.findByLabelText('Password').type(Cypress.env('mysql_password'), {log: false});

    //Click on connect
    cy.findByLabelText("connect new database button").click();

    //Assert that the database server has been added
    cy.contains('Cypress Sakila').should('be.visible');

    //Click on the database server to open QueryBuilder
    cy.contains('Cypress Sakila').click();

    //Click on the button to choose a database to query
    cy.contains('+').click();

    //Choose the 'sakila' database to query
    cy.contains('sakila').click();

    //Click on the button to choose a table to query
    cy.contains('+').click();

    //Choose the city table
    cy.contains('actor').click();

    //Click on the button to add columns to query
    cy.findByLabelText('addColumn').click();

    //Add columns
    cy.contains('first_name').click();
    cy.contains('last_name').click();

    //Click the query button
    cy.findByLabelText('query button').click();

    //Check that Penelope Guiness is displayed in the actors list
    cy.contains('PENELOPE').should('be.visible');
    cy.contains('GUINESS').should('be.visible');

    //Close the modal
    cy.findByLabelText('Close').click();

    //Navigate back to the signed-in home page
    cy.contains('Home').click();

    //Go to organisation settings
    cy.contains('settings').click();

    //Delete the organisation
    cy.contains('Delete Organisation').click();

    //Assert that the organisation has been deleted
    cy.contains('Home').click();
    cy.contains('Your Organisations').should('be.visible');
    cy.contains('Cypress Organisation').should('not.exist');

  });

});