package com.apalindromestring.shipmenttracker.shipment.repositories;

import com.apalindromestring.shipmenttracker.shipment.domain.entities.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findShipmentByTrackingNumber(String trackingNumber);
}
