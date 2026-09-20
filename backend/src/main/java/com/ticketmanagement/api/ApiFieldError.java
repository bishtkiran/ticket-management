package com.ticketmanagement.api;

public class ApiFieldError {
    private String field;
    private String message;

    public ApiFieldError(String field, String message) {
        this.field = field;
        this.message = message;
    }

    public String getField() {
        return field;
    }

    public String getMessage() {
        return message;
    }
}
