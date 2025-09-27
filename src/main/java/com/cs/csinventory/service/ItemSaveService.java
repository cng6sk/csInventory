package com.cs.csinventory.service;

import com.cs.csinventory.domain.Item;
import com.cs.csinventory.repo.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItemSaveService {
    
    private final ItemRepository itemRepository;

    // 在新事务中保存单个物品
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean saveItemInNewTransaction(String marketHashName, String enName, String cnName, Long nameId) {
        try {
            // 检查是否已存在
            if (itemRepository.existsByMarketHashName(marketHashName)) {
                return false; // 已存在
            }
            
            if (itemRepository.existsByNameId(nameId)) {
                return false; // nameId已存在
            }
            
            // 创建并保存新物品
            Item item = Item.builder()
                    .marketHashName(marketHashName)
                    .enName(enName)
                    .cnName(cnName)
                    .nameId(nameId)
                    .build();
            
            itemRepository.save(item);
            return true; // 保存成功
            
        } catch (DataIntegrityViolationException e) {
            log.warn("保存物品 {} 时发生数据完整性违例: {}", marketHashName, e.getMessage());
            return false; // 数据库约束冲突
        } catch (Exception e) {
            log.error("保存物品 {} 时发生异常: {}", marketHashName, e.getMessage());
            return false; // 其他异常
        }
    }
} 