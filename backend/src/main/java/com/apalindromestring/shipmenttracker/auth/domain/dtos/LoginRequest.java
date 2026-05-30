package com.apalindromestring.shipmenttracker.auth.domain.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "Email is required.")
    @Email(message = "Email is invalid.")
    private String email;
    @NotBlank(message = "Password is required.")
    @Size(min = 8, max = 16, message = "Password must be between 8 and 16 characters")
    private String password;

}
