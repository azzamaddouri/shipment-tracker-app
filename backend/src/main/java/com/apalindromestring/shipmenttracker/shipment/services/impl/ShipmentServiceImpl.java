package com.apalindromestring.shipmenttracker.shipment.services.impl;

import com.apalindromestring.shipmenttracker.exception.domain.ResourceNotFoundException;
import com.apalindromestring.shipmenttracker.shipment.domain.dtos.EmailSubscriptionRequest;
import com.apalindromestring.shipmenttracker.shipment.domain.dtos.CreateShipmentRequest;
import com.apalindromestring.shipmenttracker.shipment.domain.dtos.PushLocationRequest;
import com.apalindromestring.shipmenttracker.shipment.domain.dtos.RoutePointDto;
import com.apalindromestring.shipmenttracker.shipment.domain.dtos.UpdateStatusRequest;
import com.apalindromestring.shipmenttracker.shipment.domain.entities.CarrierLocation;
import com.apalindromestring.shipmenttracker.shipment.domain.entities.Shipment;
import com.apalindromestring.shipmenttracker.shipment.domain.entities.ShipmentEmailSubscription;
import com.apalindromestring.shipmenttracker.shipment.domain.entities.ShipmentHistory;
import com.apalindromestring.shipmenttracker.shipment.domain.events.CarrierLocationEvent;
import com.apalindromestring.shipmenttracker.shipment.domain.events.ShipmentStatusEvent;
import com.apalindromestring.shipmenttracker.shipment.repositories.CarrierLocationRepository;
import com.apalindromestring.shipmenttracker.shipment.repositories.ShipmentEmailSubscriptionRepository;
import com.apalindromestring.shipmenttracker.shipment.repositories.ShipmentHistoryRepository;
import com.apalindromestring.shipmenttracker.shipment.repositories.ShipmentRepository;
import com.apalindromestring.shipmenttracker.shipment.services.ShipmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final ShipmentHistoryRepository shipmentHistoryRepository;
    private final CarrierLocationRepository carrierLocationRepository;
    private final ShipmentEmailSubscriptionRepository shipmentEmailSubscriptionRepository;


    @Override
    @Transactional
    public Shipment createShipment(CreateShipmentRequest createShipmentRequest) {
        Shipment newShipment = new Shipment();
        newShipment.setOrigin(createShipmentRequest.getOrigin());
        newShipment.setDestination(createShipmentRequest.getDestination());
        newShipment.setTrackingNumber(generateTrackingNumber());

        Shipment savedShipment = shipmentRepository.save(newShipment);

        recordHistory(savedShipment, null, "Shipment created");

        eventPublisher.publishEvent(new ShipmentStatusEvent(savedShipment));

        return savedShipment;
    }


    @Override
    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

    public Shipment getShipmentById(Long id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment", "id", id));
    }

    @Override
    public Shipment getShipmentByTrackingNumber(String trackingNumber) {
        return shipmentRepository.findShipmentByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment", "trackingNumber", trackingNumber));
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

        recordHistory(savedShipment, updateStatusRequest.getCurrentLocation(), null);

        eventPublisher.publishEvent(new ShipmentStatusEvent(savedShipment));

        return savedShipment;
    }

    @Override
    public List<Shipment> getRecentPublicActivity() {
        return shipmentRepository.findTop3ByOrderByUpdatedAtDesc();
    }

    @Override
    public List<ShipmentHistory> getShipmentHistory(String trackingNumber) {

        shipmentRepository.findShipmentByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Shipment", "trackingNumber", trackingNumber
                ));
        return shipmentHistoryRepository
                .findByShipment_TrackingNumberOrderByTimestampDesc(trackingNumber);
    }

    @Override
    public List<RoutePointDto> getShipmentRoute(String trackingNumber) {
        shipmentRepository.findShipmentByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Shipment", "trackingNumber", trackingNumber));

        return carrierLocationRepository
                .findByShipment_TrackingNumberOrderByRecordedAtAsc(trackingNumber)
                .stream()
                .map(loc -> RoutePointDto.builder()
                        .latitude(loc.getLatitude())
                        .longitude(loc.getLongitude())
                        .label(loc.getLabel())
                        .recordedAt(loc.getRecordedAt())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public void pushCarrierLocation(String trackingNumber, PushLocationRequest request) {
        Shipment shipment = shipmentRepository
                .findShipmentByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Shipment", "trackingNumber", trackingNumber));

        CarrierLocation location = CarrierLocation.builder()
                .shipment(shipment)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .label(request.getLabel())
                .recordedAt(LocalDateTime.now())
                .build();

        CarrierLocation savedLocation = carrierLocationRepository.save(location);

        eventPublisher.publishEvent(new CarrierLocationEvent(shipment, savedLocation));


    }

    @Override
    public void subscribeToEmailUpdates(
            String trackingNumber,
            EmailSubscriptionRequest request) {
        Shipment shipment = shipmentRepository
                .findShipmentByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Shipment", "trackingNumber", trackingNumber));

        boolean alreadySubscribed = shipmentEmailSubscriptionRepository
                .existsByShipmentAndEmail(shipment, request.getEmail());

        if (!alreadySubscribed) {
            ShipmentEmailSubscription subscription = ShipmentEmailSubscription.builder()
                    .shipment(shipment)
                    .email(request.getEmail())
                    .subscribedAt(LocalDateTime.now())
                    .build();
            shipmentEmailSubscriptionRepository.save(subscription);
            log.info("[Email] {} subscribed to updates for {}", request.getEmail(), trackingNumber);
        }
    }


    private String generateTrackingNumber() {
        return "TRK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void recordHistory(Shipment shipment, String location, String note) {
        ShipmentHistory history = ShipmentHistory.builder()
                .shipment(shipment)
                .status(shipment.getStatus())
                .location(location != null ? location : shipment.getCurrentLocation())
                .note(note)
                .timestamp(LocalDateTime.now())
                .build();
        shipmentHistoryRepository.save(history);
    }
}
