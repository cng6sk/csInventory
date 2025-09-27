package com.cs.csinventory.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "inventory", indexes = {
        @Index(name = "idx_inventory_name_id", columnList = "nameId", unique = true)
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Inventory {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 物品引用（来自Steam API中的物品ID）
    @Column(nullable = false, unique = true)
    private Long nameId;

    // 当前持有数量
    @Column(nullable = false)
    private Integer currentQuantity;

    // 加权平均成本
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal weightedAverageCost;

    // 总投入成本
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal totalInvestmentCost;

    @Column(nullable = false)
    private OffsetDateTime createdAt; // 创建时间

    @Column(nullable = false)
    private OffsetDateTime lastUpdatedAt; // 最后更新时间

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (lastUpdatedAt == null) {
            lastUpdatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdatedAt = OffsetDateTime.now();
    }
} 