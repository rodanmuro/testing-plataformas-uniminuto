package com.example.estudiantes.service;

import com.example.estudiantes.dto.EstudianteRequest;
import com.example.estudiantes.exception.EmailDuplicadoException;
import com.example.estudiantes.exception.EstudianteNoEncontradoException;
import com.example.estudiantes.model.Estudiante;
import com.example.estudiantes.repository.EstudianteRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EstudianteService {

    private final EstudianteRepository repository;

    public EstudianteService(EstudianteRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Estudiante> listar() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Estudiante obtener(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EstudianteNoEncontradoException(id));
    }

    @Transactional
    public Estudiante crear(EstudianteRequest request) {
        if (repository.existsByEmail(request.email())) {
            throw new EmailDuplicadoException(request.email());
        }
        return repository.save(new Estudiante(request.nombre(), request.email(), request.programa()));
    }

    @Transactional
    public Estudiante actualizar(Long id, EstudianteRequest request) {
        Estudiante estudiante = obtener(id);
        if (repository.existsByEmailAndIdNot(request.email(), id)) {
            throw new EmailDuplicadoException(request.email());
        }
        estudiante.setNombre(request.nombre());
        estudiante.setEmail(request.email());
        estudiante.setPrograma(request.programa());
        return repository.save(estudiante);
    }

    @Transactional
    public void eliminar(Long id) {
        repository.delete(obtener(id));
    }
}
