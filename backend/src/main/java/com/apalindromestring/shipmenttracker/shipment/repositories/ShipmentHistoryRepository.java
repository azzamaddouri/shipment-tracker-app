package com.apalindromestring.shipmenttracker.shipment.repositories;

import com.apalindromestring.shipmenttracker.shipment.domain.entities.ShipmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShipmentHistoryRepository extends JpaRepository<ShipmentHistory, Long> {

    List<ShipmentHistory> findByShipment_TrackingNumberOrderByTimestampDesc(String trackingNumber);
}
