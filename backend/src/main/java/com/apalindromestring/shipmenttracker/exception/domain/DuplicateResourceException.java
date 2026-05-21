package com.apalindromestring.shipmenttracker.exception.domain;

public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
