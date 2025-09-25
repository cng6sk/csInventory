package com.cs.csinventory.service;

import com.cs.csinventory.domain.Item;
import com.cs.csinventory.domain.Trade;
import com.cs.csinventory.repo.ItemRepository;
import com.cs.csinventory.repo.TradeRepository;
import com.cs.csinventory.service.dto.DailyFlowDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TradeService {
    private final TradeRepository tradeRepo;
    private final ItemRepository itemRepo;

    @Transactional
    public Item createItem(Item item) {
        return itemRepo.save(item);
    }

    @Transactional
    public Trade createTrade(Trade trade) {
        // 保证引用的 Item 是持久化的
        if (trade.getItem() == null || trade.getItem().getId() == null) {
            throw new IllegalArgumentException("Item id is required");
        }
        Item item = itemRepo.findById(trade.getItem().getId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        trade.setItem(item);
        return tradeRepo.save(trade);
    }

    @Transactional(readOnly = true)
    public List<DailyFlowDTO> dailySummary(OffsetDateTime start, OffsetDateTime end) {
        return tradeRepo.summarizeDaily(start, end).stream().map(row -> {
            var day       = (java.time.LocalDate) row[0];
            var totalBuy  = (java.math.BigDecimal) row[1];
            var totalSell = (java.math.BigDecimal) row[2];
            if (totalBuy == null)  totalBuy  = BigDecimal.ZERO;
            if (totalSell == null) totalSell = BigDecimal.ZERO;
            return new DailyFlowDTO(day, totalBuy, totalSell, totalSell.subtract(totalBuy));
        }).toList();
    }
}
