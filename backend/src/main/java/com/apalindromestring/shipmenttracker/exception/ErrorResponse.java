package com.apalindromestring.shipmenttracker.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        int status,
        String error,
        String message,
        String path,
        LocalDateTime timestamp,
        Map<String, String> validationErrors
) {
    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(status, error, message, path, LocalDateTime.now(), null);
    }

    public static ErrorResponse ofValidation(String path, Map<String, String> errors) {
        return new ErrorResponse(
                400, "Validation Failed",
                "One or more fields are invalid",
                path,
                LocalDateTime.now(),
                errors
        );

    }
}
