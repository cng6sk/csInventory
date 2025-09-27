package com.cs.csinventory.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "trades", indexes = {
        @Index(name = "idx_trade_name_id", columnList = "nameId"),
        @Index(name = "idx_trade_time", columnList = "createdAt"),
        @Index(name = "idx_trade_type", columnList = "type")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Trade {

    public enum Type { BUY, SELL }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 物品引用（来自Steam API中的物品ID）
    @Column(nullable = false)
    private Long nameId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 8)
    private Type type;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal unitPrice; // 单价

    @Column(nullable = false)
    private Integer quantity; // 数量

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal totalAmount; // 总金额（冗余字段）

    @Column(nullable = false)
    private OffsetDateTime createdAt; // 创建时间

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        // 计算总金额
        if (unitPrice != null && quantity != null) {
            totalAmount = unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }

    @PreUpdate
    protected void onUpdate() {
        // 更新时重新计算总金额
        if (unitPrice != null && quantity != null) {
            totalAmount = unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }
}
