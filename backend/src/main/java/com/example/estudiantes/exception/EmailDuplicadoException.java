package com.example.estudiantes.exception;

public class EmailDuplicadoException extends RuntimeException {

    public EmailDuplicadoException(String email) {
        super("Ya existe un estudiante con el email " + email);
    }
}
