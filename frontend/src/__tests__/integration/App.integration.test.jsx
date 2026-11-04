import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../../App'
import { URL_ESTUDIANTES } from '../../test/mocks/handlers'
import { server } from '../../test/mocks/server'

/**
 * Prueba de integración del frontend: App + componentes + cliente HTTP trabajan juntos.
 * Solo se simula la red con MSW; el backend real no participa.
 */
describe('App (integración)', () => {
  let estudiantes

  beforeEach(() => {
    estudiantes = [
      { id: 1, nombre: 'Ana Pérez', email: 'ana@correo.com', programa: 'Software' },
    ]

    server.use(
      http.get(URL_ESTUDIANTES, () => HttpResponse.json(estudiantes)),
      http.post(URL_ESTUDIANTES, async ({ request }) => {
        const datos = await request.json()
        if (estudiantes.some((e) => e.email === datos.email)) {
          return HttpResponse.json(
            { mensaje: `Ya existe un estudiante con el email ${datos.email}` },
            { status: 409 },
          )
        }
        const creado = { id: estudiantes.length + 1, ...datos }
        estudiantes.push(creado)
        return HttpResponse.json(creado, { status: 201 })
      }),
      http.put(`${URL_ESTUDIANTES}/:id`, async ({ params, request }) => {
        const actualizado = { id: Number(params.id), ...(await request.json()) }
        estudiantes = estudiantes.map((e) => (e.id === actualizado.id ? actualizado : e))
        return HttpResponse.json(actualizado)
      }),
      http.delete(`${URL_ESTUDIANTES}/:id`, ({ params }) => {
        estudiantes = estudiantes.filter((e) => e.id !== Number(params.id))
        return new HttpResponse(null, { status: 204 })
      }),
    )
  })

  it('carga y muestra los estudiantes del servidor', async () => {
    render(<App />)

    expect(await screen.findByText('ana@correo.com')).toBeInTheDocument()
  })

  it('crea un estudiante y lo agrega a la tabla', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('ana@correo.com')

    await user.type(screen.getByLabelText('Nombre'), 'Luis Gómez')
    await user.type(screen.getByLabelText('Email'), 'luis@correo.com')
    await user.type(screen.getByLabelText('Programa'), 'Sistemas')
    await user.click(screen.getByRole('button', { name: 'Crear estudiante' }))

    expect(await screen.findByText('luis@correo.com')).toBeInTheDocument()
    expect(estudiantes).toHaveLength(2)
  })

  it('muestra el conflicto cuando el email ya existe', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('ana@correo.com')

    await user.type(screen.getByLabelText('Nombre'), 'Otra Ana')
    await user.type(screen.getByLabelText('Email'), 'ana@correo.com')
    await user.type(screen.getByLabelText('Programa'), 'Sistemas')
    await user.click(screen.getByRole('button', { name: 'Crear estudiante' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya existe un estudiante con el email ana@correo.com',
    )
  })

  it('edita un estudiante y vuelve al modo de creación', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(await screen.findByRole('button', { name: 'Editar a Ana Pérez' }))
    const programa = screen.getByLabelText('Programa')
    await user.clear(programa)
    await user.type(programa, 'Ingeniería de Sistemas')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    const fila = (await screen.findByText('Ingeniería de Sistemas')).closest('tr')
    expect(within(fila).getByText('ana@correo.com')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nuevo estudiante' })).toBeInTheDocument()
  })

  it('elimina un estudiante después de confirmar', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(await screen.findByRole('button', { name: 'Eliminar a Ana Pérez' }))
    await user.click(screen.getByRole('button', { name: 'Sí' }))

    expect(await screen.findByText('Aún no hay estudiantes registrados.')).toBeInTheDocument()
  })

  it('muestra un error si el servidor falla al cargar', async () => {
    server.use(
      http.get(URL_ESTUDIANTES, () =>
        HttpResponse.json({ mensaje: 'Servidor no disponible' }, { status: 500 }),
      ),
    )

    render(<App />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Servidor no disponible')
  })
})
