package com.example.estudiantes.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.estudiantes.dto.EstudianteRequest;
import com.example.estudiantes.exception.EmailDuplicadoException;
import com.example.estudiantes.exception.EstudianteNoEncontradoException;
import com.example.estudiantes.model.Estudiante;
import com.example.estudiantes.service.EstudianteService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/** Prueba de la capa web: levanta solo el controlador; el servicio es un mock. */
@WebMvcTest(EstudianteController.class)
class EstudianteControllerTest {

    private static final String JSON_VALIDO = """
            {"nombre": "Ana Pérez", "email": "ana@correo.com", "programa": "Ingeniería de Software"}
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EstudianteService service;

    private final Estudiante ana =
            new Estudiante("Ana Pérez", "ana@correo.com", "Ingeniería de Software");

    @Test
    void listarRespondeOkConLosEstudiantes() throws Exception {
        when(service.listar()).thenReturn(List.of(ana));

        mockMvc.perform(get("/api/estudiantes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].email").value("ana@correo.com"));
    }

    @Test
    void obtenerRespondeNotFoundSiNoExiste() throws Exception {
        when(service.obtener(99L)).thenThrow(new EstudianteNoEncontradoException(99L));

        mockMvc.perform(get("/api/estudiantes/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensaje").value("No existe un estudiante con id 99"));
    }

    @Test
    void crearRespondeCreated() throws Exception {
        when(service.crear(any(EstudianteRequest.class))).thenReturn(ana);

        mockMvc.perform(post("/api/estudiantes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(JSON_VALIDO))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Ana Pérez"));
    }

    @Test
    void crearRespondeBadRequestConDatosInvalidos() throws Exception {
        mockMvc.perform(post("/api/estudiantes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre": "", "email": "no-es-email", "programa": ""}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores.nombre").value("El nombre es obligatorio"))
                .andExpect(jsonPath("$.errores.email").value("El email no es válido"))
                .andExpect(jsonPath("$.errores.programa").value("El programa es obligatorio"));

        verifyNoInteractions(service);
    }

    @Test
    void crearRespondeConflictSiElEmailEstaRepetido() throws Exception {
        when(service.crear(any(EstudianteRequest.class)))
                .thenThrow(new EmailDuplicadoException("ana@correo.com"));

        mockMvc.perform(post("/api/estudiantes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(JSON_VALIDO))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensaje").value("Ya existe un estudiante con el email ana@correo.com"));
    }

    @Test
    void actualizarRespondeOk() throws Exception {
        when(service.actualizar(eq(1L), any(EstudianteRequest.class))).thenReturn(ana);

        mockMvc.perform(put("/api/estudiantes/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(JSON_VALIDO))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.programa").value("Ingeniería de Software"));
    }

    @Test
    void eliminarRespondeNoContent() throws Exception {
        mockMvc.perform(delete("/api/estudiantes/1"))
                .andExpect(status().isNoContent());

        verify(service).eliminar(1L);
    }

    @Test
    void eliminarRespondeNotFoundSiNoExiste() throws Exception {
        doThrow(new EstudianteNoEncontradoException(99L)).when(service).eliminar(99L);

        mockMvc.perform(delete("/api/estudiantes/99"))
                .andExpect(status().isNotFound());
    }
}
