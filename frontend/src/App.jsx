import { useEffect, useState } from 'react'
import {
  actualizarEstudiante,
  crearEstudiante,
  eliminarEstudiante,
  listarEstudiantes,
} from './api/estudiantesApi'
import EstudianteForm from './components/EstudianteForm'
import EstudianteList from './components/EstudianteList'

export default function App() {
  const [estudiantes, setEstudiantes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [enEdicion, setEnEdicion] = useState(null)

  useEffect(() => {
    listarEstudiantes()
      .then(setEstudiantes)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [])

  async function handleGuardar(datos) {
    if (enEdicion) {
      const actualizado = await actualizarEstudiante(enEdicion.id, datos)
      setEstudiantes((actuales) =>
        actuales.map((e) => (e.id === actualizado.id ? actualizado : e)),
      )
      setEnEdicion(null)
    } else {
      const creado = await crearEstudiante(datos)
      setEstudiantes((actuales) => [...actuales, creado])
    }
  }

  async function handleEliminar(id) {
    setError('')
    try {
      await eliminarEstudiante(id)
      setEstudiantes((actuales) => actuales.filter((e) => e.id !== id))
      if (enEdicion?.id === id) {
        setEnEdicion(null)
      }
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <main className="contenedor">
      <h1>Gestión de estudiantes</h1>

      {error && (
        <p className="alerta" role="alert" data-cy="app-error">
          {error}
        </p>
      )}

      <EstudianteForm
        key={enEdicion?.id ?? 'nuevo'}
        estudiante={enEdicion}
        onGuardar={handleGuardar}
        onCancelar={() => setEnEdicion(null)}
      />

      <section className="tarjeta">
        <h2>Estudiantes</h2>
        {cargando ? (
          <p data-cy="cargando">Cargando...</p>
        ) : (
          <EstudianteList
            estudiantes={estudiantes}
            onEditar={setEnEdicion}
            onEliminar={handleEliminar}
          />
        )}
      </section>
    </main>
  )
}
