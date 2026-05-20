package com.apalindromestring.shipmenttracker.auth.domain.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "Email is required.")
    private String email;
    @NotBlank(message = "Password is required.")
    private String password;

}
