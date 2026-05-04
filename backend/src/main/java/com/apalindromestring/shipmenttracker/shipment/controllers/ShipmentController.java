package com.apalindromestring.shipmenttracker.shipment.controllers;

import com.apalindromestring.shipmenttracker.shipment.domain.dtos.UpdateStatusRequest;
import com.apalindromestring.shipmenttracker.shipment.domain.entities.Shipment;
import com.apalindromestring.shipmenttracker.shipment.domain.dtos.ShipmentDto;
import com.apalindromestring.shipmenttracker.shipment.services.ShipmentService;
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

    private final ShipmentService shipmentService;
    private final ShipmentMapper shipmentMapper;

    @PostMapping
    public ResponseEntity<ShipmentDto> createShipment(@Valid @RequestBody ShipmentDto.CreateShipmentRequest createShipmentRequestDto) {

        CreateShipmentRequest createShipmentRequest = shipmentMapper.toCreateShipmentRequest(createShipmentRequestDto);
        Shipment createdShipment = shipmentService.createShipment(createShipmentRequest);
        ShipmentDto shipmentDto = shipmentMapper.toDto(createdShipment);

        return new ResponseEntity<>(shipmentDto, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ShipmentDto>> getAllShipments() {
        List<Shipment> shipments = shipmentService.getAllShipments();
        List<ShipmentDto> shipmentDtos = shipments.stream().map(shipmentMapper::toDto).toList();
        return ResponseEntity.ok(shipmentDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentDto> getShipmentById(@PathVariable Long id) {
        Shipment shipment = shipmentService.getShipmentById(id);
        ShipmentDto shipmentDto = shipmentMapper.toDto(shipment);
        return ResponseEntity.ok(shipmentDto);
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<ShipmentDto> getShipmentByTrackingNumber(@PathVariable String trackingNumber) {
        Shipment shipment = shipmentService.getShipmentByTrackingNumber(trackingNumber);
        ShipmentDto shipmentDto = shipmentMapper.toDto(shipment);
        return ResponseEntity.ok(shipmentDto);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ShipmentDto> updateShipmentStatus(@PathVariable Long id,
                                                            @Valid @RequestBody ShipmentDto.UpdateStatusRequest updateStatusRequestDto) {
        UpdateStatusRequest updateStatusRequest = shipmentMapper.toUpdateStatusRequest(updateStatusRequestDto);
        Shipment updatedShipment = shipmentService.updateShipmentStatus(id, updateStatusRequest);
        ShipmentDto updatedShipmentDto = shipmentMapper.toDto(updatedShipment);
        return ResponseEntity.ok(updatedShipmentDto);
    }
}
