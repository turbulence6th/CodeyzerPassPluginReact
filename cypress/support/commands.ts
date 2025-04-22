/// <reference types="cypress" />

export {}

declare global {
    namespace Cypress {
      interface Chainable {
        login(kullaniciAdi: string, sifre: string): Chainable<Element>;
      }
    }
}

Cypress.Commands.add('login', (kullaniciAdi: string, sifre: string) => {

    cy.visit('http://localhost:3000'); 

    cy.get('#url').clear().type('http://localhost:9090'); 
    cy.get('#kullaniciAdi').type(kullaniciAdi); 
    cy.get('#sifre').type(sifre);  
    cy.get('#oturumAc').click(); 

    cy.get('.pi-briefcase', { timeout: 10000 }).should('be.visible');
});