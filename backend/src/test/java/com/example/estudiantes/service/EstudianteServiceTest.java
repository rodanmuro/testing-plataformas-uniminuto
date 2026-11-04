package com.example.estudiantes.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.estudiantes.dto.EstudianteRequest;
import com.example.estudiantes.exception.EmailDuplicadoException;
import com.example.estudiantes.exception.EstudianteNoEncontradoException;
import com.example.estudiantes.model.Estudiante;
import com.example.estudiantes.repository.EstudianteRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/** Prueba unitaria: el repositorio es un mock, no hay Spring ni base de datos. */
@ExtendWith(MockitoExtension.class)
class EstudianteServiceTest {

    @Mock
    private EstudianteRepository repository;

    @InjectMocks
    private EstudianteService service;

    private final EstudianteRequest request =
            new EstudianteRequest("Ana Pérez", "ana@correo.com", "Ingeniería de Software");

    @Test
    void listarDevuelveLosEstudiantesDelRepositorio() {
        Estudiante ana = new Estudiante("Ana Pérez", "ana@correo.com", "Ingeniería de Software");
        when(repository.findAll()).thenReturn(List.of(ana));

        assertThat(service.listar()).containsExactly(ana);
    }

    @Test
    void obtenerLanzaExcepcionSiNoExiste() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.obtener(99L))
                .isInstanceOf(EstudianteNoEncontradoException.class)
                .hasMessageContaining("99");
    }

    @Test
    void crearGuardaElEstudiante() {
        when(repository.existsByEmail("ana@correo.com")).thenReturn(false);
        when(repository.save(any(Estudiante.class))).thenAnswer(inv -> inv.getArgument(0));

        Estudiante creado = service.crear(request);

        assertThat(creado.getNombre()).isEqualTo("Ana Pérez");
        assertThat(creado.getEmail()).isEqualTo("ana@correo.com");
        assertThat(creado.getPrograma()).isEqualTo("Ingeniería de Software");
    }

    @Test
    void crearRechazaEmailDuplicado() {
        when(repository.existsByEmail("ana@correo.com")).thenReturn(true);

        assertThatThrownBy(() -> service.crear(request))
                .isInstanceOf(EmailDuplicadoException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void actualizarModificaLosDatos() {
        Estudiante existente = new Estudiante("Nombre viejo", "viejo@correo.com", "Programa viejo");
        when(repository.findById(1L)).thenReturn(Optional.of(existente));
        when(repository.existsByEmailAndIdNot("ana@correo.com", 1L)).thenReturn(false);
        when(repository.save(existente)).thenReturn(existente);

        Estudiante actualizado = service.actualizar(1L, request);

        assertThat(actualizado.getNombre()).isEqualTo("Ana Pérez");
        assertThat(actualizado.getEmail()).isEqualTo("ana@correo.com");
    }

    @Test
    void actualizarRechazaEmailDeOtroEstudiante() {
        Estudiante existente = new Estudiante("Luis", "luis@correo.com", "Sistemas");
        when(repository.findById(1L)).thenReturn(Optional.of(existente));
        when(repository.existsByEmailAndIdNot("ana@correo.com", 1L)).thenReturn(true);

        assertThatThrownBy(() -> service.actualizar(1L, request))
                .isInstanceOf(EmailDuplicadoException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void eliminarBorraElEstudianteExistente() {
        Estudiante existente = new Estudiante("Luis", "luis@correo.com", "Sistemas");
        when(repository.findById(1L)).thenReturn(Optional.of(existente));

        service.eliminar(1L);

        verify(repository).delete(existente);
    }

    @Test
    void eliminarLanzaExcepcionSiNoExiste() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.eliminar(99L))
                .isInstanceOf(EstudianteNoEncontradoException.class);
        verify(repository, never()).delete(any());
    }
}
