const BASE_URL = `${window.location.origin}/api/estudiantes`

export class ApiError extends Error {
  constructor(mensaje, status, errores = {}) {
    super(mensaje)
    this.status = status
    this.errores = errores
  }
}

async function request(url, options) {
  let response
  try {
    response = await fetch(url, options)
  } catch {
    throw new ApiError('No fue posible conectar con el servidor', 0)
  }

  if (!response.ok) {
    const cuerpo = await response.json().catch(() => ({}))
    throw new ApiError(
      cuerpo.mensaje ?? 'Ocurrió un error inesperado',
      response.status,
      cuerpo.errores,
    )
  }

  return response.status === 204 ? null : response.json()
}

function enviarJson(method, estudiante) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(estudiante),
  }
}

export function listarEstudiantes() {
  return request(BASE_URL)
}

export function crearEstudiante(estudiante) {
  return request(BASE_URL, enviarJson('POST', estudiante))
}

export function actualizarEstudiante(id, estudiante) {
  return request(`${BASE_URL}/${id}`, enviarJson('PUT', estudiante))
}

export function eliminarEstudiante(id) {
  return request(`${BASE_URL}/${id}`, { method: 'DELETE' })
}
