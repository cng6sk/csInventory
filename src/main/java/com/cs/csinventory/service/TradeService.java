package com.cs.csinventory.service;

import com.cs.csinventory.domain.Trade;
import com.cs.csinventory.repo.ItemRepository;
import com.cs.csinventory.repo.TradeRepository;
import com.cs.csinventory.service.dto.DailyFlowDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TradeService {
    
    private final TradeRepository tradeRepository;
    private final ItemRepository itemRepository;
    private final InventoryService inventoryService;

    /**
     * 创建交易记录并同步更新库存
     */
    @Transactional
    public Trade createTrade(Trade trade) {
        // 验证必要字段
        if (trade.getNameId() == null) {
            throw new IllegalArgumentException("nameId不能为空");
        }
        if (trade.getType() == null) {
            throw new IllegalArgumentException("交易类型不能为空");
        }
        if (trade.getUnitPrice() == null || trade.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("单价必须大于0");
        }
        if (trade.getQuantity() == null || trade.getQuantity() <= 0) {
            throw new IllegalArgumentException("数量必须大于0");
        }

        // 验证物品是否存在
        boolean itemExists = itemRepository.findByNameId(trade.getNameId()).isPresent();
        if (!itemExists) {
            throw new IllegalArgumentException("物品不存在，nameId: " + trade.getNameId());
        }

        // 如果是卖出，检查库存是否足够
        if (trade.getType() == Trade.Type.SELL) {
            if (!inventoryService.hasEnoughInventory(trade.getNameId(), trade.getQuantity())) {
                Integer currentQuantity = inventoryService.getCurrentQuantity(trade.getNameId());
                throw new IllegalStateException(
                    String.format("库存不足，当前持有: %d，尝试卖出: %d", currentQuantity, trade.getQuantity())
                );
            }
        }

        // 保存交易记录
        Trade savedTrade = tradeRepository.save(trade);
        log.info("创建交易记录，ID: {}, nameId: {}, 类型: {}, 数量: {}, 单价: {}", 
                savedTrade.getId(), trade.getNameId(), trade.getType(), 
                trade.getQuantity(), trade.getUnitPrice());

        // 同步更新库存
        try {
            if (trade.getType() == Trade.Type.BUY) {
                inventoryService.processBuyTrade(savedTrade);
            } else {
                inventoryService.processSellTrade(savedTrade);
            }
        } catch (Exception e) {
            log.error("库存更新失败，回滚交易，交易ID: {}", savedTrade.getId(), e);
            throw new RuntimeException("库存更新失败: " + e.getMessage(), e);
        }

        return savedTrade;
    }

    /**
     * 获取指定物品的交易历史
     */
    @Transactional(readOnly = true)
    public List<Trade> getTradeHistory(Long nameId) {
        return tradeRepository.findByNameId(nameId);
    }

    /**
     * 获取指定时间范围的交易记录
     */
    @Transactional(readOnly = true)
    public List<Trade> getTradesByDateRange(OffsetDateTime start, OffsetDateTime end) {
        return tradeRepository.findByCreatedAtBetween(start, end);
    }

    /**
     * 获取每日交易统计
     */
    @Transactional(readOnly = true)
    public List<DailyFlowDTO> dailySummary(OffsetDateTime start, OffsetDateTime end) {
        List<Object[]> rawData = tradeRepository.findDailyTradeSummary(start, end);
        
        return rawData.stream().map(row -> {
            LocalDate tradeDate = (LocalDate) row[0];
            Trade.Type tradeType = (Trade.Type) row[1];
            Long totalQuantity = (Long) row[2];
            BigDecimal totalAmount = (BigDecimal) row[3];
            Long tradeCount = (Long) row[4];
            
            return DailyFlowDTO.builder()
                    .day(tradeDate)
                    .tradeType(tradeType)
                    .totalQuantity(totalQuantity.intValue())
                    .totalAmount(totalAmount != null ? totalAmount : BigDecimal.ZERO)
                    .tradeCount(tradeCount.intValue())
                    .build();
        }).toList();
    }

    /**
     * 获取所有交易记录
     */
    @Transactional(readOnly = true)
    public List<Trade> getAllTrades() {
        return tradeRepository.findAll();
    }
}
