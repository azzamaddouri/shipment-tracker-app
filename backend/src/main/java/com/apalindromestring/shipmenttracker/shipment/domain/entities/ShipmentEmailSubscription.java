package com.apalindromestring.shipmenttracker.shipment.domain.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "shipment_email_subscriptions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"shipment_id", "email"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentEmailSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private LocalDateTime subscribedAt;
}
