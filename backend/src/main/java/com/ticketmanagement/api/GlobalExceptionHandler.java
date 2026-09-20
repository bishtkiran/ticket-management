package com.ticketmanagement.api;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        List<ApiFieldError> details = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(this::toFieldError)
            .collect(Collectors.toList());

        ApiErrorResponse response = new ApiErrorResponse(
            "VALIDATION_ERROR",
            "Request validation failed.",
            details
        );
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatusException(ResponseStatusException ex) {
        ApiErrorResponse response = new ApiErrorResponse(
            "BUSINESS_ERROR",
            ex.getReason() == null ? "Request failed." : ex.getReason(),
            List.of()
        );
        return ResponseEntity.status(ex.getStatusCode()).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpectedException(Exception ex) {
        ApiErrorResponse response = new ApiErrorResponse(
            "INTERNAL_ERROR",
            "An unexpected error occurred.",
            List.of()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private ApiFieldError toFieldError(FieldError error) {
        return new ApiFieldError(error.getField(), error.getDefaultMessage());
    }
}
