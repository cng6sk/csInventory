package com.cs.csinventory.repo;

import com.cs.csinventory.domain.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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
} 