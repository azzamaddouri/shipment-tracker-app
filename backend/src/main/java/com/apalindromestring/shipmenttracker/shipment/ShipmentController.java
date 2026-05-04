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

    @GetMapping
    public ResponseEntity<List<ShipmentDTO.ShipmentResponse>> getShipments() {
        List<ShipmentDTO.ShipmentResponse> shipments = shipmentService.getAllShipments()
                .stream().map(shipmentMapper::toDto)
                .toList();
        return new ResponseEntity<>(shipments, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentDTO.ShipmentResponse> getShipmentById(@PathVariable Long id) {
        Shipment shipment = shipmentService.getShipmentById(id);
        ShipmentDTO.ShipmentResponse shipmentResponse = shipmentMapper.toDto(shipment);
        return new ResponseEntity<>(shipmentResponse, HttpStatus.OK);
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<ShipmentDTO.ShipmentResponse> getShipmentByTrackingNumber(@PathVariable String trackingNumber) {
        Shipment shipment = shipmentService.getShipmentByTrackingNumber(trackingNumber);
        ShipmentDTO.ShipmentResponse shipmentResponse = shipmentMapper.toDto(shipment);
        return new ResponseEntity<>(shipmentResponse, HttpStatus.OK);
    }

}
