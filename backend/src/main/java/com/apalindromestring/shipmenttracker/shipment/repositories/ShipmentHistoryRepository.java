package com.apalindromestring.shipmenttracker.shipment.repositories;

import com.apalindromestring.shipmenttracker.shipment.domain.entities.ShipmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShipmentHistoryRepository extends JpaRepository<ShipmentHistory, Long> {

    List<ShipmentHistory> findByShipment_TrackingNumberOrderByTimestampDesc(String trackingNumber);
}
