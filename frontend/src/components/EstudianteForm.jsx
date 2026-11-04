import { useState } from 'react'
import { validarEstudiante } from '../utils/validarEstudiante'

const FORMULARIO_VACIO = { nombre: '', email: '', programa: '' }

const CAMPOS = [
  { name: 'nombre', label: 'Nombre' },
  { name: 'email', label: 'Email' },
  { name: 'programa', label: 'Programa' },
]

export default function EstudianteForm({ estudiante, onGuardar, onCancelar }) {
  const [valores, setValores] = useState(estudiante ?? FORMULARIO_VACIO)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)

  const editando = Boolean(estudiante)

  function handleChange(event) {
    const { name, value } = event.target
    setValores((actuales) => ({ ...actuales, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorGeneral('')

    const erroresValidacion = validarEstudiante(valores)
    setErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length > 0) {
      return
    }

    setGuardando(true)
    try {
      await onGuardar({
        nombre: valores.nombre.trim(),
        email: valores.email.trim(),
        programa: valores.programa.trim(),
      })
      if (!editando) {
        setValores(FORMULARIO_VACIO)
      }
    } catch (error) {
      setErrores(error.errores ?? {})
      setErrorGeneral(error.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="tarjeta" onSubmit={handleSubmit} noValidate data-cy="estudiante-form">
      <h2>{editando ? 'Editar estudiante' : 'Nuevo estudiante'}</h2>

      {errorGeneral && (
        <p className="alerta" role="alert" data-cy="form-error">
          {errorGeneral}
        </p>
      )}

      {CAMPOS.map(({ name, label }) => (
        <div className="campo" key={name}>
          <label htmlFor={name}>{label}</label>
          <input
            id={name}
            name={name}
            type="text"
            value={valores[name]}
            onChange={handleChange}
            aria-invalid={Boolean(errores[name])}
            aria-describedby={errores[name] ? `${name}-error` : undefined}
            data-cy={`input-${name}`}
          />
          {errores[name] && (
            <span className="error-campo" id={`${name}-error`} data-cy={`error-${name}`}>
              {errores[name]}
            </span>
          )}
        </div>
      ))}

      <div className="acciones">
        <button type="submit" className="primario" disabled={guardando} data-cy="btn-guardar">
          {editando ? 'Guardar cambios' : 'Crear estudiante'}
        </button>
        {editando && (
          <button type="button" onClick={onCancelar} data-cy="btn-cancelar">
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
