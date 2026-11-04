import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import EstudianteList from './EstudianteList'

const ana = { id: 1, nombre: 'Ana Pérez', email: 'ana@correo.com', programa: 'Software' }
const luis = { id: 2, nombre: 'Luis Gómez', email: 'luis@correo.com', programa: 'Sistemas' }

describe('EstudianteList', () => {
  it('muestra un mensaje cuando no hay estudiantes', () => {
    render(<EstudianteList estudiantes={[]} />)

    expect(screen.getByText('Aún no hay estudiantes registrados.')).toBeInTheDocument()
  })

  it('muestra una fila por estudiante', () => {
    render(<EstudianteList estudiantes={[ana, luis]} />)

    expect(screen.getByText('ana@correo.com')).toBeInTheDocument()
    expect(screen.getByText('luis@correo.com')).toBeInTheDocument()
  })

  it('avisa qué estudiante se quiere editar', async () => {
    const user = userEvent.setup()
    const onEditar = vi.fn()
    render(<EstudianteList estudiantes={[ana]} onEditar={onEditar} />)

    await user.click(screen.getByRole('button', { name: 'Editar a Ana Pérez' }))

    expect(onEditar).toHaveBeenCalledWith(ana)
  })

  it('elimina solo después de confirmar', async () => {
    const user = userEvent.setup()
    const onEliminar = vi.fn()
    render(<EstudianteList estudiantes={[ana, luis]} onEliminar={onEliminar} />)

    await user.click(screen.getByRole('button', { name: 'Eliminar a Ana Pérez' }))
    expect(onEliminar).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Sí' }))
    expect(onEliminar).toHaveBeenCalledWith(1)
  })

  it('permite arrepentirse de eliminar', async () => {
    const user = userEvent.setup()
    const onEliminar = vi.fn()
    render(<EstudianteList estudiantes={[ana]} onEliminar={onEliminar} />)

    await user.click(screen.getByRole('button', { name: 'Eliminar a Ana Pérez' }))
    await user.click(screen.getByRole('button', { name: 'No' }))

    expect(onEliminar).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Eliminar a Ana Pérez' })).toBeInTheDocument()
  })
})
