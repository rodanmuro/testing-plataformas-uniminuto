const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validarEstudiante({ nombre, email, programa }) {
  const errores = {}

  if (!nombre.trim()) {
    errores.nombre = 'El nombre es obligatorio'
  }

  if (!email.trim()) {
    errores.email = 'El email es obligatorio'
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errores.email = 'El email no es válido'
  }

  if (!programa.trim()) {
    errores.programa = 'El programa es obligatorio'
  }

  return errores
}
