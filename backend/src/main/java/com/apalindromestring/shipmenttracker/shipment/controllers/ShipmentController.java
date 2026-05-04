package com.apalindromestring.shipmenttracker.shipment.controllers;

import com.apalindromestring.shipmenttracker.shipment.domain.entities.Shipment;
import com.apalindromestring.shipmenttracker.shipment.domain.dtos.ShipmentDto;
import com.apalindromestring.shipmenttracker.shipment.services.impl.ShipmentServiceImpl;
import com.apalindromestring.shipmenttracker.shipment.domain.dtos.CreateShipmentRequest;
import com.apalindromestring.shipmenttracker.shipment.mappers.ShipmentMapper;
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

    private final ShipmentServiceImpl shipmentServiceImpl;
    private final ShipmentMapper shipmentMapper;

    @PostMapping
    public ResponseEntity<ShipmentDto> createShipment(@Valid @RequestBody ShipmentDto.CreateShipmentRequest request) {

        CreateShipmentRequest createShipmentRequest = shipmentMapper.toCreateShipmentRequest(request);
        Shipment createdShipment = shipmentServiceImpl.createShipment(createShipmentRequest);
        ShipmentDto shipmentDto = shipmentMapper.toDto(createdShipment);

        return new ResponseEntity<>(shipmentDto, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ShipmentDto>> getAllShipments() {
        List<Shipment> shipments = shipmentServiceImpl.getAllShipments();
        List<ShipmentDto> shipmentDtos = shipments.stream().map(shipmentMapper::toDto).toList();
        return ResponseEntity.ok(shipmentDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentDto> getShipmentById(@PathVariable Long id) {
        Shipment shipment = shipmentServiceImpl.getShipmentById(id);
        ShipmentDto shipmentDto = shipmentMapper.toDto(shipment);
        return ResponseEntity.ok(shipmentDto);
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<ShipmentDto> getShipmentByTrackingNumber(@PathVariable String trackingNumber) {
        Shipment shipment = shipmentServiceImpl.getShipmentByTrackingNumber(trackingNumber);
        ShipmentDto shipmentDto = shipmentMapper.toDto(shipment);
        return ResponseEntity.ok(shipmentDto);
    }
}
