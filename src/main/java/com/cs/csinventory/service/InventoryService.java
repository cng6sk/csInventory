package com.cs.csinventory.service;

import com.cs.csinventory.domain.Inventory;
import com.cs.csinventory.domain.Trade;
import com.cs.csinventory.repo.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import com.cs.csinventory.service.dto.InventoryWithItemDTO;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    /**
     * 获取所有库存记录
     */
    @Transactional(readOnly = true)
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }
    
    /**
     * 获取所有库存记录并包含物品信息
     */
    @Transactional(readOnly = true)
    public List<InventoryWithItemDTO> getAllInventoryWithItem() {
        return inventoryRepository.findAllInventoryWithItem();
    }

    /**
     * 根据nameId获取库存记录
     */
    @Transactional(readOnly = true)
    public Optional<Inventory> getInventoryByNameId(Long nameId) {
        return inventoryRepository.findByNameId(nameId);
    }
    
    /**
     * 根据nameId获取库存记录并包含物品信息
     */
    @Transactional(readOnly = true)
    public Optional<InventoryWithItemDTO> getInventoryWithItemByNameId(Long nameId) {
        return inventoryRepository.findInventoryWithItemByNameId(nameId);
    }

    /**
     * 处理买入交易 - 更新库存
     */
    @Transactional
    public Inventory processBuyTrade(Trade trade) {
        if (trade.getType() != Trade.Type.BUY) {
            throw new IllegalArgumentException("只能处理买入交易");
        }

        Optional<Inventory> existingInventory = inventoryRepository.findByNameId(trade.getNameId());
        
        if (existingInventory.isPresent()) {
            // 更新现有库存
            return updateInventoryForBuy(existingInventory.get(), trade);
        } else {
            // 创建新库存记录
            return createNewInventoryForBuy(trade);
        }
    }

    /**
     * 处理卖出交易 - 更新库存
     */
    @Transactional
    public Inventory processSellTrade(Trade trade) {
        if (trade.getType() != Trade.Type.SELL) {
            throw new IllegalArgumentException("只能处理卖出交易");
        }

        Inventory inventory = inventoryRepository.findByNameId(trade.getNameId())
                .orElseThrow(() -> new IllegalStateException("无法卖出未持有的物品，nameId: " + trade.getNameId()));

        if (inventory.getCurrentQuantity() < trade.getQuantity()) {
            throw new IllegalStateException(
                String.format("库存不足，当前持有: %d，尝试卖出: %d", 
                    inventory.getCurrentQuantity(), trade.getQuantity())
            );
        }

        return updateInventoryForSell(inventory, trade);
    }

    /**
     * 创建新库存记录（首次买入）
     */
    private Inventory createNewInventoryForBuy(Trade trade) {
        Inventory inventory = Inventory.builder()
                .nameId(trade.getNameId())
                .currentQuantity(trade.getQuantity())
                .weightedAverageCost(trade.getUnitPrice())
                .totalInvestmentCost(trade.getTotalAmount())
                .build();

        log.info("创建新库存记录，nameId: {}, 数量: {}, 单价: {}", 
                trade.getNameId(), trade.getQuantity(), trade.getUnitPrice());

        return inventoryRepository.save(inventory);
    }

    /**
     * 更新现有库存（追加买入）
     */
    private Inventory updateInventoryForBuy(Inventory inventory, Trade trade) {
        int oldQuantity = inventory.getCurrentQuantity();
        BigDecimal oldTotalCost = inventory.getTotalInvestmentCost();
        
        int newQuantity = oldQuantity + trade.getQuantity();
        BigDecimal newTotalCost = oldTotalCost.add(trade.getTotalAmount());
        
        // 计算加权平均成本
        BigDecimal newWeightedAverageCost = newTotalCost.divide(
                BigDecimal.valueOf(newQuantity), 4, RoundingMode.HALF_UP);

        inventory.setCurrentQuantity(newQuantity);
        inventory.setWeightedAverageCost(newWeightedAverageCost);
        inventory.setTotalInvestmentCost(newTotalCost);

        log.info("更新库存记录，nameId: {}, 数量: {} -> {}, 平均成本: {} -> {}", 
                trade.getNameId(), oldQuantity, newQuantity, 
                inventory.getWeightedAverageCost(), newWeightedAverageCost);

        return inventoryRepository.save(inventory);
    }

    /**
     * 更新库存（卖出）
     */
    private Inventory updateInventoryForSell(Inventory inventory, Trade trade) {
        int oldQuantity = inventory.getCurrentQuantity();
        int newQuantity = oldQuantity - trade.getQuantity();
        
        if (newQuantity == 0) {
            // 全部卖出，删除库存记录
            log.info("全部卖出，删除库存记录，nameId: {}", trade.getNameId());
            inventoryRepository.delete(inventory);
            return null;
        } else {
            // 部分卖出，按比例减少总投入成本
            BigDecimal sellRatio = BigDecimal.valueOf(trade.getQuantity())
                    .divide(BigDecimal.valueOf(oldQuantity), 4, RoundingMode.HALF_UP);
            BigDecimal soldCost = inventory.getTotalInvestmentCost().multiply(sellRatio);
            BigDecimal newTotalCost = inventory.getTotalInvestmentCost().subtract(soldCost);

            inventory.setCurrentQuantity(newQuantity);
            inventory.setTotalInvestmentCost(newTotalCost);
            // 加权平均成本保持不变

            log.info("部分卖出，nameId: {}, 数量: {} -> {}, 剩余总成本: {}", 
                    trade.getNameId(), oldQuantity, newQuantity, newTotalCost);

            return inventoryRepository.save(inventory);
        }
    }

    /**
     * 检查是否有足够库存进行卖出
     */
    public boolean hasEnoughInventory(Long nameId, Integer quantity) {
        Optional<Inventory> inventory = inventoryRepository.findByNameId(nameId);
        return inventory.map(inv -> inv.getCurrentQuantity() >= quantity).orElse(false);
    }

    /**
     * 获取当前持有数量
     */
    public Integer getCurrentQuantity(Long nameId) {
        return inventoryRepository.findByNameId(nameId)
                .map(Inventory::getCurrentQuantity)
                .orElse(0);
    }
} 