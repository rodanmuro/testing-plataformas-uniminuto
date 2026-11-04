// cy.intercept reemplaza la respuesta del backend para provocar fallos
// que serían difíciles de reproducir con el servidor real.
describe('Manejo de errores del servidor', () => {
  it('muestra un mensaje si falla la carga de estudiantes', () => {
    cy.intercept('GET', '/api/estudiantes', {
      statusCode: 500,
      body: { mensaje: 'Servidor no disponible' },
    })

    cy.visit('/')

    cy.get('[data-cy=app-error]').should('have.text', 'Servidor no disponible')
  })

  it('muestra "Cargando..." mientras llega la respuesta', () => {
    cy.intercept('GET', '/api/estudiantes', { delay: 500, body: [] })

    cy.visit('/')

    cy.get('[data-cy=cargando]').should('be.visible')
    cy.get('[data-cy=lista-vacia]').should('be.visible')
    cy.get('[data-cy=cargando]').should('not.exist')
  })

  it('conserva la fila si falla la eliminación', () => {
    const ana = { id: 1, nombre: 'Ana Pérez', email: 'ana@correo.com', programa: 'Software' }
    cy.intercept('GET', '/api/estudiantes', { body: [ana] })
    cy.intercept('DELETE', '/api/estudiantes/1', {
      statusCode: 500,
      body: { mensaje: 'No se pudo eliminar' },
    }).as('eliminar')

    cy.visit('/')
    cy.get('[data-cy=btn-eliminar]').click()
    cy.get('[data-cy=btn-confirmar-eliminar]').click()
    cy.wait('@eliminar')

    cy.get('[data-cy=app-error]').should('have.text', 'No se pudo eliminar')
    cy.get('[data-cy=fila-estudiante]').should('have.length', 1)
  })
})
