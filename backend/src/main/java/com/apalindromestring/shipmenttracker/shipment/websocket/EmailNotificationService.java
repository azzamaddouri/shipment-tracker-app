package com.apalindromestring.shipmenttracker.shipment.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;
    private final ShipmentEmailSubscriptionRepository subscriptionRepository;

    @Value("${spring.mail.from}")
    private String fromAddress;

    public void notifySubscribers(Shipment shipment) {
        List<ShipmentEmailSubscription> subscribers = subscriptionRepository
                .findByShipment(shipment);

        if (subscribers.isEmpty()) return;

        for (ShipmentEmailSubscription sub : subscribers) {
            try {
                sendStatusEmail(sub.getEmail(), shipment);
                log.info("[Email] Sent status update to {} for {}",
                        sub.getEmail(), shipment.getTrackingNumber());
            } catch (Exception e) {
                log.error("[Email] Failed to send to {}: {}", sub.getEmail(), e.getMessage());
            }
        }
    }

    private void sendStatusEmail(String to, Shipment shipment) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("Shipment update — " + shipment.getTrackingNumber());
        message.setText(buildEmailBody(shipment));
        mailSender.send(message);
    }

    private String buildEmailBody(Shipment shipment) {
        return """
                Hi,
                
                Your shipment %s has been updated.
                
                Status:   %s
                Location: %s
                
                Track your shipment:
                https://yourapp.com/track/%s
                
                — Trackr Systems
                """.formatted(
                shipment.getTrackingNumber(),
                shipment.getStatus().name(),
                shipment.getCurrentLocation() != null ? shipment.getCurrentLocation() : "—",
                shipment.getTrackingNumber()
        );
    }
}
