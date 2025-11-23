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
describe('register', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3001/register')
  })

   
  it('cenario 1: verificar se estamos na pagina correta', () => {
    cy.get('[class="page-module__nC61QG__title"]').contains('Cadastre-se')
    
  })

  it('cenario 2: preencher todos os campos corretamente', () => {

    cy.get('[type="text"]').click().type('Joao da Silva')
    cy.get('[type="number"]').click().type('30')
    cy.get('[type="email"]').click().type('joaofemea@gmail.com')
    cy.get('[placeholder="Senha"]').click().type('senha123')
    cy.get('[placeholder="Confirme a senha"]').click().type('senha123')
    cy.get('[type="submit"]').click()
    


  })


  it('cenario 3: inputs inválidos ', () => {
    cy.get('[type="text"]').click().type('123123123')
    cy.get('[type="number"]').click().type('abc')
    cy.get('[type="email"]').click().type('JOAOFEMEAGMAIL.COM')
    cy.get('[placeholder="Senha"]').click().type('senha123!')
    cy.get('[placeholder="Confirme a senha"]').click().type('senha321@')
    cy.get('[type="submit"]').click()
  })
})
