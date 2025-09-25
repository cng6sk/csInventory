package com.cs.csinventory.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "trades", indexes = {
        @Index(name = "idx_trade_item", columnList = "item_id"),
        @Index(name = "idx_trade_time", columnList = "occurredAt"),
        @Index(name = "idx_trade_type", columnList = "type")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Trade {

    public enum Type { BUY, SELL }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Item item;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 8)
    private Type type;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal unitPrice; // 单价（你的成交价，统一用 USD 或 CNY，建议统一币种）

    @Column(nullable = false)
    private Integer quantity;

    @Column(length = 128)
    private String platform; // 交易平台（Steam, Buff, igxe…）

    @Column(length = 128)
    private String counterparty; // 对手方（可选）

    @Column(nullable = false)
    private OffsetDateTime occurredAt; // 成交时间（UTC）
}
