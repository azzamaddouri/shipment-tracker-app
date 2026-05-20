package com.apalindromestring.shipmenttracker.auth.services;

import com.apalindromestring.shipmenttracker.auth.domain.entities.User;
import com.apalindromestring.shipmenttracker.auth.repositories.UserRepository;
import com.apalindromestring.shipmenttracker.auth.security.ShipmentUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
        throw new IllegalStateException("Unexpected principal type");
    }
}
