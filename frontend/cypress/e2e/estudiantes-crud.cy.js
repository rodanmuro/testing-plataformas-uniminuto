// Flujo completo contra el backend real: navegador -> React -> Spring Boot -> H2.
describe('CRUD de estudiantes', () => {
  beforeEach(function () {
    cy.fixture('estudiantes').as('datos')
    cy.limpiarEstudiantes()
  })

  it('muestra un mensaje cuando no hay estudiantes', () => {
    cy.visit('/')

    cy.contains('h1', 'Gestión de estudiantes')
    cy.get('[data-cy=lista-vacia]').should('be.visible')
  })

  it('crea un estudiante y sigue ahí al recargar la página', function () {
    cy.visit('/')

    cy.llenarFormulario(this.datos.ana)
    cy.get('[data-cy=btn-guardar]').click()

    cy.get('[data-cy=fila-estudiante]').should('have.length', 1)
    cy.get('[data-cy=fila-estudiante]').should('contain', this.datos.ana.email)
    cy.get('[data-cy=input-nombre]').should('have.value', '')

    // Al recargar, los datos vienen del backend: confirma que se guardaron de verdad.
    cy.reload()
    cy.get('[data-cy=fila-estudiante]').should('contain', this.datos.ana.nombre)
  })

  it('lista los estudiantes existentes', function () {
    cy.crearEstudiante(this.datos.ana)
    cy.crearEstudiante(this.datos.luis)

    cy.visit('/')

    cy.get('[data-cy=fila-estudiante]').should('have.length', 2)
  })

  it('edita un estudiante', function () {
    cy.crearEstudiante(this.datos.ana)
    cy.visit('/')

    cy.get('[data-cy=btn-editar]').click()
    cy.contains('h2', 'Editar estudiante')
    cy.get('[data-cy=input-email]').should('have.value', this.datos.ana.email)

    cy.get('[data-cy=input-programa]').clear().type('Ciencia de Datos')
    cy.get('[data-cy=btn-guardar]').click()

    cy.contains('h2', 'Nuevo estudiante')
    cy.get('[data-cy=fila-estudiante]').should('contain', 'Ciencia de Datos')

    cy.reload()
    cy.get('[data-cy=fila-estudiante]').should('contain', 'Ciencia de Datos')
  })

  it('elimina un estudiante después de confirmar', function () {
    cy.crearEstudiante(this.datos.ana)
    cy.crearEstudiante(this.datos.luis)
    cy.visit('/')

    cy.contains('[data-cy=fila-estudiante]', this.datos.ana.email).within(() => {
      cy.get('[data-cy=btn-eliminar]').click()
      cy.get('[data-cy=btn-confirmar-eliminar]').click()
    })

    cy.get('[data-cy=fila-estudiante]').should('have.length', 1)
    cy.contains(this.datos.ana.email).should('not.exist')

    cy.reload()
    cy.get('[data-cy=fila-estudiante]').should('have.length', 1)
  })

  it('no elimina si el usuario se arrepiente', function () {
    cy.crearEstudiante(this.datos.ana)
    cy.visit('/')

    cy.get('[data-cy=btn-eliminar]').click()
    cy.get('[data-cy=btn-cancelar-eliminar]').click()

    cy.reload()
    cy.get('[data-cy=fila-estudiante]').should('have.length', 1)
  })
})
