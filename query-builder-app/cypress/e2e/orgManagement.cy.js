import '@testing-library/cypress/add-commands';
describe('Org Management', () => {

  beforeEach(() => {

    //visit home page
    cy.viewport(1920, 1080);
    cy.visit('/');

    //Log in
    cy.get('.sign-in-container')
    .findByLabelText('Email')
    .type(Cypress.env('test_username'), {log: false});
    cy.get('.sign-in-container').findByLabelText('Password').type(Cypress.env('test_password'), {log: false});

    cy.contains('Login').click();

  });

  it('Can add an organisation and delete it again', () => {

    //Add organisation
    cy.contains('+ Add', {timeout: 20000}).click();
    cy.findByLabelText('Organisation Name').type('Cypress Organisation');
    cy.findByLabelText("add new organisation button").click();

    //Assert that the organisation has been added
    cy.contains('Cypress Organisation').should('be.visible');

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
