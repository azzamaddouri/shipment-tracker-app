package com.apalindromestring.shipmenttracker.shipment.listeners;

import com.apalindromestring.shipmenttracker.shipment.domain.events.ShipmentStatusEvent;
import com.apalindromestring.shipmenttracker.shipment.websocket.ShipmentNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class ShipmentEventListener {

    private final ShipmentNotificationService notificationService;


    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onShipmentStatusChanged(ShipmentStatusEvent event) {
        log.info("[Event] Shipment event received for id={}", event.shipment().getId());
        notificationService.notifyShipmentUpdate(event.shipment());
    }
}
