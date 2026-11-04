const API = '/api/estudiantes'

// Deja la base de datos vacía usando la API real, para que cada prueba sea independiente.
Cypress.Commands.add('limpiarEstudiantes', () => {
  cy.request(API).then(({ body }) => {
    body.forEach(({ id }) => cy.request('DELETE', `${API}/${id}`))
  })
})

// Prepara datos por la API: es más rápido y estable que hacerlo por la interfaz.
Cypress.Commands.add('crearEstudiante', (estudiante) => {
  cy.request('POST', API, estudiante)
})

// Llena el formulario como lo haría un usuario.
Cypress.Commands.add('llenarFormulario', ({ nombre, email, programa }) => {
  cy.get('[data-cy=input-nombre]').clear().type(nombre)
  cy.get('[data-cy=input-email]').clear().type(email)
  cy.get('[data-cy=input-programa]').clear().type(programa)
})
