package com.cs.csinventory.service.dto;

import com.cs.csinventory.domain.Trade;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * 包含物品信息的交易DTO
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TradeWithItemDTO {
    private Long id;
    private Long nameId;
    private String cnName;  // 物品中文名称
    private String enName;  // 物品英文名称
    private Trade.Type type;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal totalAmount;
    private OffsetDateTime createdAt;
} 