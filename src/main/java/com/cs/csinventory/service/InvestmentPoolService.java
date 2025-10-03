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
        
        // 2. 计算旧版资金流统计 (保留用于兼容)
        BigDecimal totalInvestment = calculateTotalInvestment(allTrades);
        BigDecimal totalWithdrawal = calculateTotalWithdrawal(allTrades);
        BigDecimal currentCost = totalInvestment.subtract(totalWithdrawal);
        
        // 3. 计算静态成本 (当前持仓物品的购买成本总和)
        BigDecimal staticCost = calculateCurrentHoldingValueByCost();
        
        // 4. 计算当前持仓估值 (使用成本价，前端可手动覆盖)
        BigDecimal currentHoldingValue = staticCost;
        
        // 5. 计算新版真实投资统计
        BigDecimal peakNetInvestment = calculatePeakNetInvestment(allTrades);
        BigDecimal netCashFlow = totalInvestment.subtract(totalWithdrawal);
        
        // 6. 计算已实现盈利和未实现盈利
        BigDecimal realizedProfit = calculateRealizedProfit(allTrades);
        BigDecimal unrealizedProfit = currentHoldingValue.subtract(staticCost);
        BigDecimal totalProfit = realizedProfit.add(unrealizedProfit);
        
        // 7. 计算真实收益率
        BigDecimal realReturnRate = peakNetInvestment.compareTo(BigDecimal.ZERO) > 0 ? 
            totalProfit.divide(peakNetInvestment, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        
        // 8. 计算旧版收益统计 (保留用于兼容)
        BigDecimal absoluteProfit = currentHoldingValue.subtract(currentCost);
        BigDecimal returnRate = currentCost.compareTo(BigDecimal.ZERO) > 0 ? 
            absoluteProfit.divide(currentCost, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal totalValue = totalWithdrawal.add(currentHoldingValue);
        
        // 9. 计算时间统计
        LocalDate firstInvestmentDate = getFirstInvestmentDate(allTrades);
        LocalDate lastTradeDate = getLastTradeDate(allTrades);
        Integer totalInvestmentDays = (int) ChronoUnit.DAYS.between(firstInvestmentDate, LocalDate.now()) + 1;
        
        // 10. 计算交易统计
        Integer totalBuyTrades = (int) allTrades.stream().filter(t -> t.getType() == Trade.Type.BUY).count();
        Integer totalSellTrades = (int) allTrades.stream().filter(t -> t.getType() == Trade.Type.SELL).count();
        Integer totalItems = (int) allTrades.stream().map(Trade::getNameId).distinct().count();
        Integer currentHoldingItems = (int) inventoryRepository.findAll().stream()
            .filter(inv -> inv.getCurrentQuantity() > 0).count();
        
        return InvestmentPoolDTO.builder()
                // 旧版字段（兼容）
                .totalInvestment(totalInvestment)
                .totalWithdrawal(totalWithdrawal)
                .currentCost(currentCost)
                .staticCost(staticCost)
                .currentHoldingValue(currentHoldingValue)
                .absoluteProfit(absoluteProfit)
                .returnRate(returnRate)
                .totalValue(totalValue)
                // 新增字段
                .peakNetInvestment(peakNetInvestment)
                .netCashFlow(netCashFlow)
                .realizedProfit(realizedProfit)
                .totalProfit(totalProfit)
                .realReturnRate(realReturnRate)
                // 时间统计
                .firstInvestmentDate(firstInvestmentDate)
                .lastTradeDate(lastTradeDate)
                .totalInvestmentDays(totalInvestmentDays)
                // 交易统计
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
     * 计算峰值净投入 - 历史上投入池中的最大净资金量
     * 这代表了真实的本金投入，排除了盈利再投资的重复计算
     */
    private BigDecimal calculatePeakNetInvestment(List<Trade> trades) {
        // 按时间顺序排序交易
        List<Trade> sortedTrades = trades.stream()
                .sorted((t1, t2) -> t1.getCreatedAt().compareTo(t2.getCreatedAt()))
                .toList();
        
        BigDecimal currentNetInvestment = BigDecimal.ZERO;
        BigDecimal peakNetInvestment = BigDecimal.ZERO;
        
        for (Trade trade : sortedTrades) {
            if (trade.getType() == Trade.Type.BUY) {
                // 买入增加净投入
                currentNetInvestment = currentNetInvestment.add(trade.getTotalAmount());
            } else {
                // 卖出减少净投入
                currentNetInvestment = currentNetInvestment.subtract(trade.getTotalAmount());
            }
            
            // 更新峰值（只有正数才有意义，代表实际投入的钱）
            if (currentNetInvestment.compareTo(peakNetInvestment) > 0) {
                peakNetInvestment = currentNetInvestment;
            }
        }
        
        // 如果峰值为0，说明从未投入过（或者一直是负数），返回第一笔买入的金额
        if (peakNetInvestment.compareTo(BigDecimal.ZERO) == 0 && !sortedTrades.isEmpty()) {
            return sortedTrades.stream()
                    .filter(t -> t.getType() == Trade.Type.BUY)
                    .findFirst()
                    .map(Trade::getTotalAmount)
                    .orElse(BigDecimal.ZERO);
        }
        
        return peakNetInvestment;
    }
    
    /**
     * 计算已实现盈利 - 所有卖出收入减去对应的成本
     * 注意：这里简化计算，使用总卖出 - 总买入 + 当前持仓成本
     */
    private BigDecimal calculateRealizedProfit(List<Trade> trades) {
        BigDecimal totalBuy = calculateTotalInvestment(trades);
        BigDecimal totalSell = calculateTotalWithdrawal(trades);
        BigDecimal currentHoldingCost = calculateCurrentHoldingValueByCost();
        
        // 已实现盈利 = 总卖出 - (总买入 - 当前持仓成本)
        // 即：已卖出的部分赚了多少钱
        return totalSell.subtract(totalBuy.subtract(currentHoldingCost));
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
                .staticCost(BigDecimal.ZERO)
                .currentHoldingValue(BigDecimal.ZERO)
                .peakNetInvestment(BigDecimal.ZERO)
                .netCashFlow(BigDecimal.ZERO)
                .realizedProfit(BigDecimal.ZERO)
                .absoluteProfit(BigDecimal.ZERO)
                .returnRate(BigDecimal.ZERO)
                .totalValue(BigDecimal.ZERO)
                .totalProfit(BigDecimal.ZERO)
                .realReturnRate(BigDecimal.ZERO)
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
        
        // 计算旧版资金流统计 (保留用于兼容)
        BigDecimal totalInvestment = calculateTotalInvestment(allTrades);
        BigDecimal totalWithdrawal = calculateTotalWithdrawal(allTrades);
        BigDecimal currentCost = totalInvestment.subtract(totalWithdrawal);
        
        // 计算静态成本 (始终使用购买成本)
        BigDecimal staticCost = calculateCurrentHoldingValueByCost();
        
        // 使用手动输入的市场价值
        BigDecimal currentHoldingValue = manualMarketValue != null ? manualMarketValue : staticCost;
        
        // 计算新版真实投资统计
        BigDecimal peakNetInvestment = calculatePeakNetInvestment(allTrades);
        BigDecimal netCashFlow = totalInvestment.subtract(totalWithdrawal);
        
        // 计算已实现盈利和未实现盈利
        BigDecimal realizedProfit = calculateRealizedProfit(allTrades);
        BigDecimal unrealizedProfit = currentHoldingValue.subtract(staticCost);
        BigDecimal totalProfit = realizedProfit.add(unrealizedProfit);
        
        // 计算真实收益率
        BigDecimal realReturnRate = peakNetInvestment.compareTo(BigDecimal.ZERO) > 0 ? 
            totalProfit.divide(peakNetInvestment, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        
        // 计算旧版收益统计 (保留用于兼容)
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
                // 旧版字段（兼容）
                .totalInvestment(totalInvestment)
                .totalWithdrawal(totalWithdrawal)
                .currentCost(currentCost)
                .staticCost(staticCost)
                .currentHoldingValue(currentHoldingValue)
                .absoluteProfit(absoluteProfit)
                .returnRate(returnRate)
                .totalValue(totalValue)
                // 新增字段
                .peakNetInvestment(peakNetInvestment)
                .netCashFlow(netCashFlow)
                .realizedProfit(realizedProfit)
                .totalProfit(totalProfit)
                .realReturnRate(realReturnRate)
                // 时间统计
                .firstInvestmentDate(firstInvestmentDate)
                .lastTradeDate(lastTradeDate)
                .totalInvestmentDays(totalInvestmentDays)
                // 交易统计
                .totalBuyTrades(totalBuyTrades)
                .totalSellTrades(totalSellTrades)
                .totalItems(totalItems)
                .currentHoldingItems(currentHoldingItems)
                .build();
    }
} 