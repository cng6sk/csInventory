package com.cs.csinventory.repo;

import com.cs.csinventory.domain.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {
    
    // 根据市场哈希名称查找物品
    Optional<Item> findByMarketHashName(String marketHashName);
    
    // 检查nameId是否已存在
    boolean existsByNameId(Long nameId);
    
    // 检查marketHashName是否已存在
    boolean existsByMarketHashName(String marketHashName);
}
