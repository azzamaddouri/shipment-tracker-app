package com.apalindromestring.shipmenttracker;

import com.apalindromestring.shipmenttracker.auth.domain.entities.User;
import com.apalindromestring.shipmenttracker.auth.domain.enums.Role;
import com.apalindromestring.shipmenttracker.auth.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@RequiredArgsConstructor
public class ShipmentTrackerApplication implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    public static void main(String[] args) {
        SpringApplication.run(ShipmentTrackerApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        String email = "operator@test.com";
        userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .name("Test User")
                    .email(email)
                    .password(passwordEncoder.encode("testultimate"))
                    .role(Role.OPERATOR)
                    .active(true)
                    .build();
            return userRepository.save(newUser);
        });
        System.out.println("Test user ready: " + email);


        String email_c = "carrier@test.com";
        userRepository.findByEmail(email_c).orElseGet(() -> {
            User newUser1 = User.builder()
                    .name("Test User")
                    .email(email_c)
                    .password(passwordEncoder.encode("testultimate"))
                    .role(Role.CARRIER)
                    .active(true)
                    .build();
            return userRepository.save(newUser1);
        });
        System.out.println("Test user ready: " + email_c);
    }
}
