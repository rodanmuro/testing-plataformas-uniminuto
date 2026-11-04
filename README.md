# Gestión de estudiantes: pruebas unitarias, de integración y e2e

Material de clase para la asignatura **Plataformas de Desarrollo de Software** de UNIMINUTO.

Aplicación de ejemplo para practicar los distintos niveles de pruebas sobre un CRUD sencillo.

- **backend/**: API REST con Spring Boot 3.5 y base de datos H2 en memoria.
- **frontend/**: aplicación React 19 con Vite que consume la API.
- **frontend/cypress/**: pruebas e2e que recorren toda la aplicación.

## Requisitos

- Java 17 y Maven 3.6.3 o superior
- Node.js 22.12 o superior
- Google Chrome (opcional: Cypress también trae Electron)

## Instalación

```bash
cd frontend
npm install
```

Maven descarga las dependencias del backend la primera vez que se ejecuta.

## Ejecutar la aplicación

En dos terminales:

```bash
cd backend && mvn spring-boot:run     # API en http://localhost:8080
cd frontend && npm run dev            # App en http://localhost:5173
```

La consola de H2 está en http://localhost:8080/h2-console
(JDBC URL `jdbc:h2:mem:estudiantes`, usuario `sa`, sin contraseña).
Los datos se pierden al detener el backend.

### API

| Método | Ruta                    | Respuesta                                 |
| ------ | ----------------------- | ----------------------------------------- |
| GET    | `/api/estudiantes`      | 200 con la lista                          |
| GET    | `/api/estudiantes/{id}` | 200, o 404 si no existe                   |
| POST   | `/api/estudiantes`      | 201, 400 si es inválido, 409 si el email ya existe |
| PUT    | `/api/estudiantes/{id}` | 200, 400, 404 o 409                       |
| DELETE | `/api/estudiantes/{id}` | 204, o 404 si no existe                   |

## La pirámide de pruebas en este proyecto

| Nivel       | Qué es real                         | Qué se simula      | Dónde está                                     | Comando                                     |
| ----------- | ----------------------------------- | ------------------ | ---------------------------------------------- | ------------------------------------------- |
| Unitaria    | Una clase del backend               | Sus dependencias (Mockito) | `backend/src/test/.../service`, `.../controller` | `mvn test`                                  |
| Integración | Spring completo y H2                | Nada               | `backend/src/test/.../integration` (`*IT`)     | `mvn verify` (ejecuta también las unitarias) |
| Unitaria    | Una función o un componente React   | Props y `fetch`    | Junto al código: `src/**/*.test.js(x)`         | `npm run test:unit`                         |
| Integración | Toda la aplicación React            | La red (MSW)       | `src/__tests__/integration`                    | `npm run test:integration`                  |
| E2E         | Navegador, React, Spring Boot y H2  | Nada, salvo en `estudiantes-errores.cy.js` | `frontend/cypress/e2e`      | `npm run e2e`                               |

`npm test` ejecuta las pruebas unitarias y de integración del frontend.

## Pruebas e2e con Cypress

### Modo manual (interfaz gráfica)

Es el modo indicado para escribir pruebas y mostrarlas en clase: se ve el navegador
y se puede revisar cada paso de la prueba.

Con el backend y el frontend en ejecución (ver arriba), en una tercera terminal:

```bash
cd frontend
npm run cy:open
```

Se abre Cypress en Chrome; basta con hacer clic en un spec. Al guardar cambios en el
archivo, la prueba vuelve a ejecutarse sola.

### Modo automático (sin interfaz)

Un solo comando levanta el backend y el frontend, ejecuta todos los specs y apaga los servidores:

```bash
cd frontend
npm run e2e
```

Si los servidores ya están en ejecución, se puede usar `npm run cy:run`.
Para un solo spec: `npx cypress run --spec cypress/e2e/estudiantes-crud.cy.js`.

### Pedirle a Claude Code que las ejecute

Se le puede pedir en lenguaje natural, por ejemplo: "ejecuta las pruebas e2e y explícame
los fallos" o "escribe una prueba e2e que verifique que se puede editar el email".
Claude usa el modo automático y lee el resultado en la terminal.

Desde la extensión de VS Code hay un detalle: los procesos que lanza heredan
`ELECTRON_RUN_AS_NODE=1` y Cypress falla con `bad option: --no-sandbox`. Se resuelve
quitando la variable:

```bash
env -u ELECTRON_RUN_AS_NODE npm run e2e
```

Esto no afecta a las terminales normales, incluida la terminal integrada de VS Code.

### Organización de las pruebas

- `cypress/e2e/estudiantes-crud.cy.js`: crear, listar, editar y eliminar contra el backend real.
- `cypress/e2e/estudiantes-validaciones.cy.js`: validaciones del formulario y email repetido (409).
- `cypress/e2e/estudiantes-errores.cy.js`: fallos del servidor simulados con `cy.intercept`.
- `cypress/support/commands.js`: comandos propios (`cy.limpiarEstudiantes`, `cy.crearEstudiante`, `cy.llenarFormulario`).
- `cypress/fixtures/estudiantes.json`: datos de prueba.

Buenas prácticas aplicadas:

- Los elementos se seleccionan con atributos `data-cy`, que no cambian si cambia el diseño.
- Cada prueba limpia la base de datos antes de empezar, así no depende de las demás.
- Los datos previos se crean por la API; la interfaz solo se usa para lo que se está probando.
- No se usan esperas fijas (`cy.wait(1000)`): Cypress reintenta cada verificación.

Como las pruebas e2e borran todos los estudiantes, los datos cargados a mano se pierden al ejecutarlas.
