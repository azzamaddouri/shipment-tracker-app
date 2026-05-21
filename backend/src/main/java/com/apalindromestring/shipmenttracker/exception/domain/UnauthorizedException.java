package com.apalindromestring.shipmenttracker.exception.domain;

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
