import { describe, expect, it } from 'vitest'
import { validarEstudiante } from './validarEstudiante'

const valido = { nombre: 'Ana Pérez', email: 'ana@correo.com', programa: 'Software' }

describe('validarEstudiante', () => {
  it('no devuelve errores con datos válidos', () => {
    expect(validarEstudiante(valido)).toEqual({})
  })

  it('exige todos los campos', () => {
    expect(validarEstudiante({ nombre: '', email: '', programa: '' })).toEqual({
      nombre: 'El nombre es obligatorio',
      email: 'El email es obligatorio',
      programa: 'El programa es obligatorio',
    })
  })

  it('trata los espacios en blanco como campo vacío', () => {
    expect(validarEstudiante({ ...valido, nombre: '   ' })).toEqual({
      nombre: 'El nombre es obligatorio',
    })
  })

  it.each(['ana', 'ana@', 'ana@correo', '@correo.com', 'ana perez@correo.com'])(
    'rechaza el email "%s"',
    (email) => {
      expect(validarEstudiante({ ...valido, email })).toEqual({
        email: 'El email no es válido',
      })
    },
  )
})
