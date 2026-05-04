package com.apalindromestring.shipmenttracker.shipment;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;
    private final ShipmentMapper shipmentMapper;

    @PostMapping
    public ResponseEntity<ShipmentDTO.ShipmentResponse> createShipment(@Valid @RequestBody ShipmentDTO.CreateShipmentRequest request) {
        Shipment shipmentToCreate = shipmentMapper.toEntity(request);
        Shipment savedShipment = shipmentService.createShipment(shipmentToCreate);

        return new ResponseEntity<>(shipmentMapper.toDto(savedShipment), HttpStatus.CREATED);
    }
}
