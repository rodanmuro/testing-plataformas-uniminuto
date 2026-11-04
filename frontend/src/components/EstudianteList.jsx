import { useState } from 'react'

export default function EstudianteList({ estudiantes, onEditar, onEliminar }) {
  const [idPorEliminar, setIdPorEliminar] = useState(null)

  if (estudiantes.length === 0) {
    return (
      <p className="vacio" data-cy="lista-vacia">
        Aún no hay estudiantes registrados.
      </p>
    )
  }

  return (
    <table data-cy="tabla-estudiantes">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Programa</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {estudiantes.map((estudiante) => (
          <tr key={estudiante.id} data-cy="fila-estudiante">
            <td>{estudiante.nombre}</td>
            <td>{estudiante.email}</td>
            <td>{estudiante.programa}</td>
            <td className="acciones">
              {idPorEliminar === estudiante.id ? (
                <>
                  <span>¿Eliminar?</span>
                  <button
                    type="button"
                    className="peligro"
                    onClick={() => {
                      setIdPorEliminar(null)
                      onEliminar(estudiante.id)
                    }}
                    data-cy="btn-confirmar-eliminar"
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setIdPorEliminar(null)}
                    data-cy="btn-cancelar-eliminar"
                  >
                    No
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onEditar(estudiante)}
                    aria-label={`Editar a ${estudiante.nombre}`}
                    data-cy="btn-editar"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIdPorEliminar(estudiante.id)}
                    aria-label={`Eliminar a ${estudiante.nombre}`}
                    data-cy="btn-eliminar"
                  >
                    Eliminar
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
