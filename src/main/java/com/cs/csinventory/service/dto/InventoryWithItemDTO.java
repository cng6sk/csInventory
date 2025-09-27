package com.cs.csinventory.service.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * 包含物品信息的库存DTO
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InventoryWithItemDTO {
    private Long id;
    private Long nameId;
    private String cnName;  // 物品中文名称
    private String enName;  // 物品英文名称
    private Integer currentQuantity;
    private BigDecimal weightedAverageCost;
    private BigDecimal totalInvestmentCost;
    private OffsetDateTime createdAt;
    private OffsetDateTime lastUpdatedAt;
} 