import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import EstudianteForm from './EstudianteForm'

async function llenarFormulario(user) {
  await user.type(screen.getByLabelText('Nombre'), 'Ana Pérez')
  await user.type(screen.getByLabelText('Email'), 'ana@correo.com')
  await user.type(screen.getByLabelText('Programa'), 'Software')
}

describe('EstudianteForm', () => {
  it('muestra los errores y no guarda si los datos son inválidos', async () => {
    const user = userEvent.setup()
    const onGuardar = vi.fn()
    render(<EstudianteForm onGuardar={onGuardar} />)

    await user.click(screen.getByRole('button', { name: 'Crear estudiante' }))

    expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('El email es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('El programa es obligatorio')).toBeInTheDocument()
    expect(onGuardar).not.toHaveBeenCalled()
  })

  it('envía los datos y limpia el formulario al crear', async () => {
    const user = userEvent.setup()
    const onGuardar = vi.fn().mockResolvedValue()
    render(<EstudianteForm onGuardar={onGuardar} />)

    await llenarFormulario(user)
    await user.click(screen.getByRole('button', { name: 'Crear estudiante' }))

    expect(onGuardar).toHaveBeenCalledWith({
      nombre: 'Ana Pérez',
      email: 'ana@correo.com',
      programa: 'Software',
    })
    expect(screen.getByLabelText('Nombre')).toHaveValue('')
  })

  it('carga los datos del estudiante en modo edición', async () => {
    const user = userEvent.setup()
    const onCancelar = vi.fn()
    render(
      <EstudianteForm
        estudiante={{ id: 1, nombre: 'Ana', email: 'ana@correo.com', programa: 'Software' }}
        onGuardar={vi.fn()}
        onCancelar={onCancelar}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Editar estudiante' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveValue('ana@correo.com')

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancelar).toHaveBeenCalled()
  })

  it('muestra el error del servidor y conserva lo escrito', async () => {
    const user = userEvent.setup()
    const onGuardar = vi.fn().mockRejectedValue(new Error('Email repetido'))
    render(<EstudianteForm onGuardar={onGuardar} />)

    await llenarFormulario(user)
    await user.click(screen.getByRole('button', { name: 'Crear estudiante' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email repetido')
    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana Pérez')
  })
})
