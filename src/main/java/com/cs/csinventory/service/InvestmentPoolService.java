package com.cs.csinventory.service;

import com.cs.csinventory.domain.Trade;
import com.cs.csinventory.repo.TradeRepository;
import com.cs.csinventory.repo.InventoryRepository;
import com.cs.csinventory.service.dto.InvestmentPoolDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

/**
 * 投资池分析服务 - 将CS物品交易看作动态投资池
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InvestmentPoolService {
    
    private final TradeRepository tradeRepository;
    private final InventoryRepository inventoryRepository;
    
    /**
     * 获取投资池整体表现统计
     */
    @Transactional(readOnly = true)
    public InvestmentPoolDTO getInvestmentPoolStatistics() {
        
        // 1. 获取所有交易记录
        List<Trade> allTrades = tradeRepository.findAll();
        
        if (allTrades.isEmpty()) {
            return createEmptyPool();
        }
        
        // 2. 计算资金流统计
        BigDecimal totalInvestment = calculateTotalInvestment(allTrades);
        BigDecimal totalWithdrawal = calculateTotalWithdrawal(allTrades);
        BigDecimal currentCost = totalInvestment.subtract(totalWithdrawal);
        
        // 3. 计算当前持仓估值 (使用成本价，前端可手动覆盖)
        BigDecimal currentHoldingValue = calculateCurrentHoldingValueByCost();
        
        // 4. 计算收益统计
        BigDecimal absoluteProfit = currentHoldingValue.subtract(currentCost);
        BigDecimal returnRate = currentCost.compareTo(BigDecimal.ZERO) > 0 ? 
            absoluteProfit.divide(currentCost, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal totalValue = totalWithdrawal.add(currentHoldingValue);
        
        // 5. 计算时间统计
        LocalDate firstInvestmentDate = getFirstInvestmentDate(allTrades);
        LocalDate lastTradeDate = getLastTradeDate(allTrades);
        Integer totalInvestmentDays = (int) ChronoUnit.DAYS.between(firstInvestmentDate, LocalDate.now()) + 1;
        
        // 6. 计算交易统计
        Integer totalBuyTrades = (int) allTrades.stream().filter(t -> t.getType() == Trade.Type.BUY).count();
        Integer totalSellTrades = (int) allTrades.stream().filter(t -> t.getType() == Trade.Type.SELL).count();
        Integer totalItems = (int) allTrades.stream().map(Trade::getNameId).distinct().count();
        Integer currentHoldingItems = (int) inventoryRepository.findAll().stream()
            .filter(inv -> inv.getCurrentQuantity() > 0).count();
        
        return InvestmentPoolDTO.builder()
                .totalInvestment(totalInvestment)
                .totalWithdrawal(totalWithdrawal)
                .currentCost(currentCost)
                .currentHoldingValue(currentHoldingValue)
                .absoluteProfit(absoluteProfit)
                .returnRate(returnRate)
                .totalValue(totalValue)
                .firstInvestmentDate(firstInvestmentDate)
                .lastTradeDate(lastTradeDate)
                .totalInvestmentDays(totalInvestmentDays)
                .totalBuyTrades(totalBuyTrades)
                .totalSellTrades(totalSellTrades)
                .totalItems(totalItems)
                .currentHoldingItems(currentHoldingItems)
                .build();
    }
    
    /**
     * 计算累计投入资金 (所有买入金额)
     */
    private BigDecimal calculateTotalInvestment(List<Trade> trades) {
        return trades.stream()
                .filter(trade -> trade.getType() == Trade.Type.BUY)
                .map(Trade::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * 计算累计回收资金 (所有卖出金额)
     */
    private BigDecimal calculateTotalWithdrawal(List<Trade> trades) {
        return trades.stream()
                .filter(trade -> trade.getType() == Trade.Type.SELL)
                .map(Trade::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * 基于成本价计算当前持仓估值
     */
    private BigDecimal calculateCurrentHoldingValueByCost() {
        return inventoryRepository.findAll().stream()
                .filter(inv -> inv.getCurrentQuantity() > 0)
                .map(inv -> inv.getWeightedAverageCost()
                    .multiply(BigDecimal.valueOf(inv.getCurrentQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * 获取首次投资日期
     */
    private LocalDate getFirstInvestmentDate(List<Trade> trades) {
        return trades.stream()
                .filter(trade -> trade.getType() == Trade.Type.BUY)
                .map(trade -> trade.getCreatedAt().toLocalDate())
                .min(LocalDate::compareTo)
                .orElse(LocalDate.now());
    }
    
    /**
     * 获取最后交易日期
     */
    private LocalDate getLastTradeDate(List<Trade> trades) {
        return trades.stream()
                .map(trade -> trade.getCreatedAt().toLocalDate())
                .max(LocalDate::compareTo)
                .orElse(LocalDate.now());
    }
    
    /**
     * 创建空投资池统计
     */
    private InvestmentPoolDTO createEmptyPool() {
        LocalDate now = LocalDate.now();
        return InvestmentPoolDTO.builder()
                .totalInvestment(BigDecimal.ZERO)
                .totalWithdrawal(BigDecimal.ZERO)
                .currentCost(BigDecimal.ZERO)
                .currentHoldingValue(BigDecimal.ZERO)
                .absoluteProfit(BigDecimal.ZERO)
                .returnRate(BigDecimal.ZERO)
                .totalValue(BigDecimal.ZERO)
                .firstInvestmentDate(now)
                .lastTradeDate(now)
                .totalInvestmentDays(0)
                .totalBuyTrades(0)
                .totalSellTrades(0)
                .totalItems(0)
                .currentHoldingItems(0)
                .build();
    }
    
    /**
     * 使用手动输入的市场价值重新计算投资池统计
     */
    public InvestmentPoolDTO getInvestmentPoolStatisticsWithManualValue(BigDecimal manualMarketValue) {
        // 获取基础统计
        List<Trade> allTrades = tradeRepository.findAll();
        
        if (allTrades.isEmpty()) {
            return createEmptyPool();
        }
        
        // 计算资金流统计
        BigDecimal totalInvestment = calculateTotalInvestment(allTrades);
        BigDecimal totalWithdrawal = calculateTotalWithdrawal(allTrades);
        BigDecimal currentCost = totalInvestment.subtract(totalWithdrawal);
        
        // 使用手动输入的市场价值
        BigDecimal currentHoldingValue = manualMarketValue != null ? manualMarketValue : calculateCurrentHoldingValueByCost();
        
        // 计算收益统计
        BigDecimal absoluteProfit = currentHoldingValue.subtract(currentCost);
        BigDecimal returnRate = currentCost.compareTo(BigDecimal.ZERO) > 0 ? 
            absoluteProfit.divide(currentCost, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal totalValue = totalWithdrawal.add(currentHoldingValue);
        
        // 计算时间统计
        LocalDate firstInvestmentDate = getFirstInvestmentDate(allTrades);
        LocalDate lastTradeDate = getLastTradeDate(allTrades);
        Integer totalInvestmentDays = (int) ChronoUnit.DAYS.between(firstInvestmentDate, LocalDate.now()) + 1;
        
        // 计算交易统计
        Integer totalBuyTrades = (int) allTrades.stream().filter(t -> t.getType() == Trade.Type.BUY).count();
        Integer totalSellTrades = (int) allTrades.stream().filter(t -> t.getType() == Trade.Type.SELL).count();
        Integer totalItems = (int) allTrades.stream().map(Trade::getNameId).distinct().count();
        Integer currentHoldingItems = (int) inventoryRepository.findAll().stream()
            .filter(inv -> inv.getCurrentQuantity() > 0).count();
        
        return InvestmentPoolDTO.builder()
                .totalInvestment(totalInvestment)
                .totalWithdrawal(totalWithdrawal)
                .currentCost(currentCost)
                .currentHoldingValue(currentHoldingValue)
                .absoluteProfit(absoluteProfit)
                .returnRate(returnRate)
                .totalValue(totalValue)
                .firstInvestmentDate(firstInvestmentDate)
                .lastTradeDate(lastTradeDate)
                .totalInvestmentDays(totalInvestmentDays)
                .totalBuyTrades(totalBuyTrades)
                .totalSellTrades(totalSellTrades)
                .totalItems(totalItems)
                .currentHoldingItems(currentHoldingItems)
                .build();
    }
} 