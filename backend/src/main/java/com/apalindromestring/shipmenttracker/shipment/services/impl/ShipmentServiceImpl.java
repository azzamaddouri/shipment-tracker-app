package com.apalindromestring.shipmenttracker.shipment.services.impl;

import com.apalindromestring.shipmenttracker.shipment.domain.dtos.CreateShipmentRequest;
import com.apalindromestring.shipmenttracker.shipment.domain.dtos.UpdateStatusRequest;
import com.apalindromestring.shipmenttracker.shipment.domain.entities.Shipment;
import com.apalindromestring.shipmenttracker.shipment.domain.events.ShipmentStatusEvent;
import com.apalindromestring.shipmenttracker.shipment.repositories.ShipmentRepository;
import com.apalindromestring.shipmenttracker.shipment.services.ShipmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public Shipment createShipment(CreateShipmentRequest createShipmentRequest) {
        Shipment newShipment = new Shipment();
        newShipment.setOrigin(createShipmentRequest.getOrigin());
        newShipment.setDestination(createShipmentRequest.getDestination());
        newShipment.setTrackingNumber(generateTrackingNumber());

        Shipment savedShipment = shipmentRepository.save(newShipment);

        eventPublisher.publishEvent(new ShipmentStatusEvent(savedShipment));

        return savedShipment;
    }


    @Override
    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

    public Shipment getShipmentById(Long id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id " + id));
    }

    @Override
    public Shipment getShipmentByTrackingNumber(String trackingNumber) {
        return shipmentRepository.findShipmentByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new RuntimeException("Shipment not found with Tracking Number " + trackingNumber));
    }


    @Override
    @Transactional
    public Shipment updateShipmentStatus(Long id, UpdateStatusRequest updateStatusRequest) {
        Shipment existingShipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id " + id));

        existingShipment.setStatus(updateStatusRequest.getStatus());

        if (updateStatusRequest.getCurrentLocation() != null) {
            existingShipment.setCurrentLocation(updateStatusRequest.getCurrentLocation());
        }
        Shipment savedShipment = shipmentRepository.save(existingShipment);

        eventPublisher.publishEvent(new ShipmentStatusEvent(savedShipment));

        return savedShipment;
    }

    private String generateTrackingNumber() {
        return "TRK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
