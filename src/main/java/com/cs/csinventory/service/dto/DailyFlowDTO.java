package com.cs.csinventory.service.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyFlowDTO(
        LocalDate day,
        BigDecimal totalBuy,
        BigDecimal totalSell,
        BigDecimal net // totalSell - totalBuy
) { }
