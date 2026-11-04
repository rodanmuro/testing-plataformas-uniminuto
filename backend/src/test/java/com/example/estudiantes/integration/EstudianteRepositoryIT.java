package com.example.estudiantes.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.estudiantes.model.Estudiante;
import com.example.estudiantes.repository.EstudianteRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

/** Prueba de integración con la base de datos: repositorio real contra H2. */
@DataJpaTest
class EstudianteRepositoryIT {

    @Autowired
    private EstudianteRepository repository;

    @Test
    void existsByEmailDetectaUnEmailGuardado() {
        repository.save(new Estudiante("Ana Pérez", "ana@correo.com", "Software"));

        assertThat(repository.existsByEmail("ana@correo.com")).isTrue();
        assertThat(repository.existsByEmail("otro@correo.com")).isFalse();
    }

    @Test
    void existsByEmailAndIdNotIgnoraAlPropioEstudiante() {
        Estudiante ana = repository.save(new Estudiante("Ana Pérez", "ana@correo.com", "Software"));
        Estudiante luis = repository.save(new Estudiante("Luis Gómez", "luis@correo.com", "Sistemas"));

        assertThat(repository.existsByEmailAndIdNot("ana@correo.com", ana.getId())).isFalse();
        assertThat(repository.existsByEmailAndIdNot("ana@correo.com", luis.getId())).isTrue();
    }

    @Test
    void laBaseDeDatosRechazaEmailsRepetidos() {
        repository.saveAndFlush(new Estudiante("Ana Pérez", "ana@correo.com", "Software"));

        assertThatThrownBy(() -> repository.saveAndFlush(
                new Estudiante("Otra Ana", "ana@correo.com", "Sistemas")))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
