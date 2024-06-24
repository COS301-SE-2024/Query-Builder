import '@testing-library/cypress/add-commands';
describe('Basic Query', () => {
  it('Does the full flow required to get a query', () => {
    cy.viewport(1920, 1080);
    cy.visit('http://localhost:3000/');

    // Log in
    cy.get('.sign-in-container')
      .findByLabelText('Email')
      .type('test6@example.com');
    cy.get('.sign-in-container').findByLabelText('Password').type('password1');
    cy.contains('Login').click();

    // Add database
    cy.contains('+ Add').click();
    cy.findByLabelText('Database Server Name').type('NewTestDB');
    cy.findByLabelText('URL or Host').type('127.0.0.1');
    cy.findByLabelText('Username').type('root');
    cy.findByLabelText('Password').type('testPassword');
    cy.get('.flex').next().next().contains('Connect').click();
    cy.contains('NewTestDB').click();

    // Query Database
  });
});
