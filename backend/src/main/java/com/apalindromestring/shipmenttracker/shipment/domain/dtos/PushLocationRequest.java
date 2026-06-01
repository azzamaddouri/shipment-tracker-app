package com.apalindromestring.shipmenttracker.shipment.domain.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PushLocationRequest {
    @NotNull
    private Double latitude;
    @NotNull
    private Double longitude;
    private String label;
}