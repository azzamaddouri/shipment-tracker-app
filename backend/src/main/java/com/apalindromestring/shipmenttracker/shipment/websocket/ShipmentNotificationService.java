package com.apalindromestring.shipmenttracker.shipment.websocket;

import com.apalindromestring.shipmenttracker.shipment.domain.dtos.StatusUpdateMessage;
import com.apalindromestring.shipmenttracker.shipment.domain.entities.Shipment;
import com.apalindromestring.shipmenttracker.shipment.domain.enums.ShipmentStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShipmentNotificationService {

    private final SimpMessagingTemplate messagingTemplate;


    public void notifyShipmentUpdate(Shipment shipment) {
        try {
            StatusUpdateMessage message = StatusUpdateMessage.builder()
                    .shipmentId(shipment.getId())
                    .trackingNumber(shipment.getTrackingNumber())
                    .status(shipment.getStatus())
                    .currentLocation(shipment.getCurrentLocation())
                    .timestamp(shipment.getUpdatedAt())
                    .message(getStatusMessage(shipment.getStatus()))
                    .build();

            // Use case - Users watch all shipments
            messagingTemplate.convertAndSend("/topic/shipments", message);

            // Use case - Customer tracks their specific shipment
            messagingTemplate.convertAndSend("/topic/shipments/" + shipment.getId(), message);

            log.info("[WebSocket] Notified shipment update: id={}, status={}",
                    shipment.getId(), shipment.getStatus());

        } catch (Exception e) {

            log.error("[WebSocket] Failed to notify shipment id={}: {}",
                    shipment.getId(), e.getMessage());
        }
    }


    private String getStatusMessage(ShipmentStatus status) {
        return switch (status) {
            case ORDER_PLACED -> "Order has been placed";
            case PROCESSING -> "Order is being processed";
            case PICKED_UP -> "Package has been picked up";
            case IN_TRANSIT -> "Package is in transit";
            case OUT_FOR_DELIVERY -> "Package is out for delivery";
            case DELIVERED -> "Package has been delivered";
            case EXCEPTION -> "Delivery failed";
        };
    }
}
