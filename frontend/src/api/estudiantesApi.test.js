import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  crearEstudiante,
  eliminarEstudiante,
  listarEstudiantes,
} from './estudiantesApi'

function respuestaJson(cuerpo, status = 200) {
  return new Response(JSON.stringify(cuerpo), { status })
}

describe('estudiantesApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('listarEstudiantes devuelve el JSON de la respuesta', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuestaJson([{ id: 1 }])))

    await expect(listarEstudiantes()).resolves.toEqual([{ id: 1 }])
  })

  it('crearEstudiante envía un POST con el cuerpo en JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuestaJson({ id: 1 }, 201))
    vi.stubGlobal('fetch', fetchMock)

    await crearEstudiante({ nombre: 'Ana' })

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toMatch(/\/api\/estudiantes$/)
    expect(options.method).toBe('POST')
    expect(options.body).toBe('{"nombre":"Ana"}')
  })

  it('eliminarEstudiante devuelve null con una respuesta 204', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))

    await expect(eliminarEstudiante(1)).resolves.toBeNull()
  })

  it('convierte una respuesta de error en ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(respuestaJson({ mensaje: 'Email repetido' }, 409)),
    )

    const error = await crearEstudiante({}).catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.message).toBe('Email repetido')
    expect(error.status).toBe(409)
  })

  it('informa cuando no hay conexión con el servidor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(listarEstudiantes()).rejects.toThrow('No fue posible conectar con el servidor')
  })
})
