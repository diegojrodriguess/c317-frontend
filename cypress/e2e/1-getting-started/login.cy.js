/// <reference types="cypress" />

// Welcome to Cypress!
//
// This spec file contains a variety of sample tests
// for a todo list app that are designed to demonstrate
// the power of writing tests in Cypress.
//
// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

//suite de testes -> conjunto de testes
// 1, 2, 3... cenarios de testes
//suite de testes -> login.cy.js
// login.cy.jjs -> feature _> conjunto de testes sobre essa feature
describe('example to-do app', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3001/login')
  })

  it('cenario 1: escrever um email na caixa de e-mail', () => {
    cy.get('[class="page-module__aydn6q__title"]').contains('Login')
    cy.get('[type="email"]').click().type('joaozinhofemea@gmail.com')
  })

  it('cenario 2: escrever uma senha na caixa de senha', () => {
    cy.get('[class="page-module__aydn6q__title"]').contains('Login')
    cy.get('[type="email"]').click().type('nome@gmail.com')
    cy.get('[type="password"]').click().type('senha123')
  })



})
