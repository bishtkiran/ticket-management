package com.ticketmanagement.api;

import java.util.List;

public class ApiErrorResponse {
    private ErrorPayload error;

    public ApiErrorResponse(String code, String message, List<ApiFieldError> details) {
        this.error = new ErrorPayload(code, message, details);
    }

    public ErrorPayload getError() {
        return error;
    }

    public static class ErrorPayload {
        private String code;
        private String message;
        private List<ApiFieldError> details;

        public ErrorPayload(String code, String message, List<ApiFieldError> details) {
            this.code = code;
            this.message = message;
            this.details = details;
        }

        public String getCode() {
            return code;
        }

        public String getMessage() {
            return message;
        }

        public List<ApiFieldError> getDetails() {
            return details;
        }
    }
}
