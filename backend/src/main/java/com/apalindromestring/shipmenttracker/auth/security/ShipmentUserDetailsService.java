package com.apalindromestring.shipmenttracker.auth.security;

import com.apalindromestring.shipmenttracker.auth.domain.entities.User;
import com.apalindromestring.shipmenttracker.auth.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ShipmentUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;


    @Override
    public ShipmentUserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return new ShipmentUserDetails(user);
    }
}
