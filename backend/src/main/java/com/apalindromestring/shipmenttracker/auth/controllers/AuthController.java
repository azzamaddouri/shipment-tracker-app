package com.apalindromestring.shipmenttracker.auth.controllers;

import com.apalindromestring.shipmenttracker.auth.domain.dtos.AuthResponse;
import com.apalindromestring.shipmenttracker.auth.domain.dtos.LoginRequest;
import com.apalindromestring.shipmenttracker.auth.services.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;


    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        String token = authenticationService.authenticate(
                loginRequest.getEmail(), loginRequest.getPassword());
        return ResponseEntity.ok(new AuthResponse(token));
    }

}
