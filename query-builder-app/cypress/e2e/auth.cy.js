import '@testing-library/cypress/add-commands';

describe('Authentication component', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit('http://localhost:3000/');
  });

  it('should render sign up form', () => {
    cy.contains('Create an account').click();
    cy.get('.sign-up-container').should('be.visible');
  });

  it('should render sign in form', () => {
    cy.get('.sign-in-container').should('be.visible');
  });

  it('should toggle between sign up and sign in forms', () => {
    cy.get('.sign-up-container').should('not.be.visible');
    cy.get('.sign-in-container').should('be.visible');
    cy.contains('Create an account').click();
    cy.get('.sign-in-container').should('not.be.visible');
    cy.get('.sign-up-container').should('be.visible');
    cy.contains('Log in').click();
    cy.get('.sign-up-container').should('not.be.visible');
    cy.get('.sign-in-container').should('be.visible');
  });

  it('should validate sign up form inputs', () => {
    cy.contains('Create an account').click();
    cy.get('.sign-up-container').findByLabelText('First Name').type('John');
    cy.get('.sign-up-container').findByLabelText('Last Name').type('Doe');
    cy.get('.sign-up-container')
      .findByLabelText('Email')
      .type('johndoe@example.com');
    cy.get('.sign-up-container')
      .findByLabelText('Phone Number')
      .type('1234567890');
    cy.get('.sign-up-container').findByLabelText('Password').type('password');

    cy.get('.sign-up-container').find('button').should('not.be.disabled');
  });

  it('should validate sign in form inputs', () => {
    cy.get('.sign-in-container')
      .findByLabelText('Email')
      .type('johndoe@example.com');
    cy.get('.sign-in-container').findByLabelText('Password').type('password');

    cy.get('.sign-in-container').find('button').should('not.be.disabled');
  });

  // it('should submit sign up form', () => {
  //   cy.intercept('POST', '/api/signup', {
  //     statusCode: 200,
  //     body: { success: true },
  //   }).as('signup');

  //   cy.get('.sign-up-container').find('input[name="firstName"]').type('John');
  //   cy.get('.sign-up-container').find('input[name="lastName"]').type('Doe');
  //   cy.get('.sign-up-container')
  //     .find('input[name="email"]')
  //     .type('johndoe@example.com');
  //   cy.get('.sign-up-container').find('input[name="phone"]').type('1234567890');
  //   cy.get('.sign-up-container')
  //     .find('input[name="password"]')
  //     .type('password');

  //   cy.get('.sign-up-container').find('button').click();

  //   cy.wait('@signup').then((interception) => {
  //     expect(interception.response.statusCode).to.equal(200);
  //     expect(interception.response.body.success).to.be.true;
  //   });
  // });

  it('should submit sign in form', () => {
    cy.get('.sign-in-container')
      .findByLabelText('Email')
      .type('test6@example.com');
    cy.get('.sign-in-container').findByLabelText('Password').type('password1');

    cy.contains('Login').click();

    cy.url().should('eq', 'http://localhost:3000/');
  });
});
