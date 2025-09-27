package com.cs.csinventory.repo;

import com.cs.csinventory.domain.Inventory;
import com.cs.csinventory.service.dto.InventoryWithItemDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    
    /**
     * 根据物品nameId查找库存记录
     */
    Optional<Inventory> findByNameId(Long nameId);
    
    /**
     * 检查指定nameId的物品是否存在库存记录
     */
    boolean existsByNameId(Long nameId);
    
    /**
     * 获取所有库存记录并包含物品信息
     */
    @Query("""
        SELECT new com.cs.csinventory.service.dto.InventoryWithItemDTO(
            inv.id, inv.nameId, i.cnName, i.enName, inv.currentQuantity,
            inv.weightedAverageCost, inv.totalInvestmentCost, inv.createdAt, inv.lastUpdatedAt
        )
        FROM Inventory inv 
        LEFT JOIN Item i ON inv.nameId = i.nameId
        ORDER BY inv.lastUpdatedAt DESC
    """)
    List<InventoryWithItemDTO> findAllInventoryWithItem();
    
    /**
     * 根据nameId查找库存记录并包含物品信息
     */
    @Query("""
        SELECT new com.cs.csinventory.service.dto.InventoryWithItemDTO(
            inv.id, inv.nameId, i.cnName, i.enName, inv.currentQuantity,
            inv.weightedAverageCost, inv.totalInvestmentCost, inv.createdAt, inv.lastUpdatedAt
        )
        FROM Inventory inv 
        LEFT JOIN Item i ON inv.nameId = i.nameId
        WHERE inv.nameId = :nameId
    """)
    Optional<InventoryWithItemDTO> findInventoryWithItemByNameId(@Param("nameId") Long nameId);
} 