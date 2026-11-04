describe('Validaciones del formulario', () => {
  beforeEach(function () {
    cy.fixture('estudiantes').as('datos')
    cy.limpiarEstudiantes()
  })

  it('exige los campos obligatorios', () => {
    cy.visit('/')

    cy.get('[data-cy=btn-guardar]').click()

    cy.get('[data-cy=error-nombre]').should('have.text', 'El nombre es obligatorio')
    cy.get('[data-cy=error-email]').should('have.text', 'El email es obligatorio')
    cy.get('[data-cy=error-programa]').should('have.text', 'El programa es obligatorio')
    cy.get('[data-cy=lista-vacia]').should('be.visible')
  })

  it('rechaza un email con formato inválido', function () {
    cy.visit('/')

    cy.llenarFormulario({ ...this.datos.ana, email: 'correo-invalido' })
    cy.get('[data-cy=btn-guardar]').click()

    cy.get('[data-cy=error-email]').should('have.text', 'El email no es válido')
    cy.get('[data-cy=lista-vacia]').should('be.visible')
  })

  // Esta regla solo la conoce el backend: el error viaja por toda la aplicación.
  it('muestra el error del backend si el email ya existe', function () {
    cy.crearEstudiante(this.datos.ana)
    cy.visit('/')

    cy.llenarFormulario({ ...this.datos.luis, email: this.datos.ana.email })
    cy.get('[data-cy=btn-guardar]').click()

    cy.get('[data-cy=form-error]').should(
      'have.text',
      `Ya existe un estudiante con el email ${this.datos.ana.email}`,
    )
    cy.get('[data-cy=fila-estudiante]').should('have.length', 1)
  })

  it('descarta los cambios al cancelar la edición', function () {
    cy.crearEstudiante(this.datos.ana)
    cy.visit('/')

    cy.get('[data-cy=btn-editar]').click()
    cy.get('[data-cy=input-nombre]').clear().type('Nombre descartado')
    cy.get('[data-cy=btn-cancelar]').click()

    cy.contains('h2', 'Nuevo estudiante')
    cy.get('[data-cy=input-nombre]').should('have.value', '')
    cy.get('[data-cy=fila-estudiante]').should('contain', this.datos.ana.nombre)
  })
})
