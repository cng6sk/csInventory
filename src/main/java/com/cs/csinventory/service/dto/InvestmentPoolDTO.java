package com.cs.csinventory.service.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 投资池统计DTO - 把CS物品交易看作一个动态投资池
 */
@Builder
public record InvestmentPoolDTO(
        // 资金流统计
        BigDecimal totalInvestment,     // 累计投入资金 (所有买入金额总和) - 已废弃，保留用于兼容
        BigDecimal totalWithdrawal,     // 累计回收资金 (所有卖出金额总和)
        BigDecimal currentCost,         // 当前持仓成本 (投入-回收) - 已废弃，保留用于兼容
        BigDecimal staticCost,          // 静态成本 (当前持仓物品的购买成本总和，不受市场价影响)
        BigDecimal currentHoldingValue, // 当前持仓估值 (暂时用成本价，后续接入爬虫)
        
        // 新增：真实投资统计
        BigDecimal peakNetInvestment,   // 峰值净投入 (历史上投入池中的最大净资金，代表真实本金)
        BigDecimal netCashFlow,         // 净现金流 (买入-卖出，正数=资金在池中，负数=已提取盈利)
        BigDecimal realizedProfit,      // 已实现盈利 (所有卖出收入 - 对应成本)
        
        // 收益统计
        BigDecimal absoluteProfit,      // 绝对收益 (持仓估值-持仓成本) - 已废弃，保留用于兼容
        BigDecimal returnRate,          // 收益率 (绝对收益/持仓成本) - 已废弃，保留用于兼容
        BigDecimal totalValue,          // 总价值 (回收资金+持仓估值)
        
        // 新增：真实收益统计
        BigDecimal totalProfit,         // 总盈利 (已实现盈利 + 未实现盈利)
        BigDecimal realReturnRate,      // 真实收益率 (总盈利 / 峰值净投入)
        
        // 时间统计
        LocalDate firstInvestmentDate,  // 首次投资日期
        LocalDate lastTradeDate,        // 最后交易日期
        Integer totalInvestmentDays,    // 总投资天数
        
        // 交易统计
        Integer totalBuyTrades,         // 总买入笔数
        Integer totalSellTrades,        // 总卖出笔数
        Integer totalItems,             // 总物品种类数
        Integer currentHoldingItems     // 当前持有物品种类数
) {
} 