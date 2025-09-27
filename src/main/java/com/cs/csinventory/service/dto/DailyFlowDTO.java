package com.cs.csinventory.service.dto;

import com.cs.csinventory.domain.Trade;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
public record DailyFlowDTO(
        LocalDate day,
        Trade.Type tradeType,
        Integer totalQuantity,
        BigDecimal totalAmount,
        Integer tradeCount
) {
    // 为了向后兼容，保留原有的构造器
    public DailyFlowDTO(LocalDate day, BigDecimal totalBuy, BigDecimal totalSell, BigDecimal net) {
        this(day, null, 0, totalBuy.add(totalSell), 0);
    }
}
