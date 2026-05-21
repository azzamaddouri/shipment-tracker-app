package com.apalindromestring.shipmenttracker.auth.services;

import com.apalindromestring.shipmenttracker.auth.security.ShipmentUserDetails;
import com.apalindromestring.shipmenttracker.exception.domain.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;


    public String authenticate(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));
        if (authentication.getPrincipal() instanceof ShipmentUserDetails userDetails) {
            return jwtService.generateToken(userDetails.getUser());

        }
        throw new UnauthorizedException("Authentication failed: unexpected principal type");
    }
}
