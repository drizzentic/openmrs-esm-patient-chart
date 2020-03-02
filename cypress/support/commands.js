// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
const username = "user1";
const password = "Admin123";
Cypress.Commands.add("login", () => {
  cy.request({
    url: "https://openmrs-spa.org/openmrs/ws/rest/v1/session",
    headers: {
      Authorization: `basic ${btoa(`${username}:${password}`)}`
    }
  }).then(resp => {
    // assert response from server
    expect(resp.status).to.eq(200);
    // go to Dashboard
    cy.visit("https://openmrs-spa.org/openmrs/spa/location");
  });
});
Cypress.Commands.add("logout", () => {
  cy.request({
    url: "https://openmrs-spa.org/openmrs/ws/rest/v1/session",
    method: "DELETE",
    headers: {
      Authorization: `basic ${btoa(`${username}:${password}`)}`
    }
  });
});
