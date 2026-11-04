package com.example.estudiantes.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.estudiantes.dto.ErrorResponse;
import com.example.estudiantes.dto.EstudianteRequest;
import com.example.estudiantes.model.Estudiante;
import com.example.estudiantes.repository.EstudianteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/** Prueba de integración completa: HTTP real -> controlador -> servicio -> repositorio -> H2. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class EstudianteApiIT {

    private static final String URL = "/api/estudiantes";

    @Autowired
    private TestRestTemplate rest;

    @Autowired
    private EstudianteRepository repository;

    private final EstudianteRequest ana =
            new EstudianteRequest("Ana Pérez", "ana@correo.com", "Ingeniería de Software");

    @BeforeEach
    void limpiarBaseDeDatos() {
        repository.deleteAll();
    }

    @Test
    void cicloCompletoDeCrearConsultarActualizarYEliminar() {
        ResponseEntity<Estudiante> creado = rest.postForEntity(URL, ana, Estudiante.class);
        assertThat(creado.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        Long id = creado.getBody().getId();
        assertThat(id).isNotNull();

        Estudiante consultado = rest.getForObject(URL + "/" + id, Estudiante.class);
        assertThat(consultado.getEmail()).isEqualTo("ana@correo.com");

        EstudianteRequest cambios =
                new EstudianteRequest("Ana María Pérez", "ana@correo.com", "Sistemas");
        ResponseEntity<Estudiante> actualizado = rest.exchange(
                URL + "/" + id, HttpMethod.PUT, new HttpEntity<>(cambios), Estudiante.class);
        assertThat(actualizado.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(actualizado.getBody().getNombre()).isEqualTo("Ana María Pérez");

        ResponseEntity<Void> eliminado =
                rest.exchange(URL + "/" + id, HttpMethod.DELETE, null, Void.class);
        assertThat(eliminado.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(repository.count()).isZero();
    }

    @Test
    void listarDevuelveLosEstudiantesGuardados() {
        rest.postForEntity(URL, ana, Estudiante.class);
        rest.postForEntity(URL,
                new EstudianteRequest("Luis Gómez", "luis@correo.com", "Sistemas"), Estudiante.class);

        Estudiante[] estudiantes = rest.getForObject(URL, Estudiante[].class);

        assertThat(estudiantes).extracting(Estudiante::getEmail)
                .containsExactlyInAnyOrder("ana@correo.com", "luis@correo.com");
    }

    @Test
    void noPermiteDosEstudiantesConElMismoEmail() {
        rest.postForEntity(URL, ana, Estudiante.class);

        ResponseEntity<ErrorResponse> respuesta = rest.postForEntity(URL, ana, ErrorResponse.class);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(respuesta.getBody().mensaje()).contains("ana@correo.com");
        assertThat(repository.count()).isEqualTo(1);
    }

    @Test
    void rechazaDatosInvalidosSinGuardarNada() {
        EstudianteRequest invalido = new EstudianteRequest("", "no-es-email", "");

        ResponseEntity<ErrorResponse> respuesta = rest.postForEntity(URL, invalido, ErrorResponse.class);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(respuesta.getBody().errores()).containsKeys("nombre", "email", "programa");
        assertThat(repository.count()).isZero();
    }

    @Test
    void respondeNotFoundParaUnIdInexistente() {
        ResponseEntity<ErrorResponse> respuesta =
                rest.getForEntity(URL + "/999999", ErrorResponse.class);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
