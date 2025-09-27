package com.cs.csinventory.repo;

import com.cs.csinventory.domain.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {
    
    // 根据市场哈希名称查找物品
    Optional<Item> findByMarketHashName(String marketHashName);
    
    // 根据nameId查找物品
    Optional<Item> findByNameId(Long nameId);
    
    // 检查nameId是否已存在
    boolean existsByNameId(Long nameId);
    
    // 检查marketHashName是否已存在
    boolean existsByMarketHashName(String marketHashName);
    
    // 新增：模糊搜索cnName，限制结果数量
    @Query("SELECT i FROM Item i WHERE i.cnName LIKE %:keyword% ORDER BY i.cnName LIMIT :limit")
    List<Item> findByCnNameContainingIgnoreCaseOrderByCnName(@Param("keyword") String keyword, @Param("limit") int limit);
}
