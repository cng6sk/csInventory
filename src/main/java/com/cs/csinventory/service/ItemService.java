package com.cs.csinventory.service;

import com.cs.csinventory.domain.Item;
import com.cs.csinventory.repo.ItemRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItemService {
    
    private final ItemRepository itemRepository;
    private final ObjectMapper objectMapper;
    private final ItemSaveService itemSaveService;

    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }
    
    @Transactional
    public Item createItem(Item item) {
        return itemRepository.save(item);
    }

    // 主导入方法 - 不使用事务，让每个物品保存使用独立事务
    public ImportResult importItemsFromJson(String jsonData) {
        try {
            // 解析JSON数据
            JsonNode rootNode = objectMapper.readTree(jsonData);
            
            List<String> skippedItems = new ArrayList<>();
            AtomicInteger totalProcessed = new AtomicInteger(0);
            AtomicInteger successCount = new AtomicInteger(0);
            
            // 计算总数量
            int totalItems = rootNode.size();
            log.info("开始导入 {} 个物品", totalItems);
            
            // 遍历JSON中的每个物品
            rootNode.fields().forEachRemaining(entry -> {
                String marketHashName = entry.getKey();
                JsonNode itemData = entry.getValue();
                
                totalProcessed.incrementAndGet();
                
                try {
                    // 获取物品数据
                    String enName = itemData.get("en_name").asText();
                    String cnName = itemData.get("cn_name").asText();
                    Long nameId = itemData.get("name_id").asLong();
                    
                    // 尝试保存物品（使用独立事务）
                    boolean success = itemSaveService.saveItemInNewTransaction(marketHashName, enName, cnName, nameId);
                    
                    if (success) {
                        successCount.incrementAndGet();
                    } else {
                        skippedItems.add(marketHashName + " (已存在或保存失败)");
                    }
                    
                    // 每处理100个记录打印一次日志
                    if (totalProcessed.get() % 100 == 0) {
                        log.info("已处理 {}/{} 个物品, 成功导入 {} 个", 
                               totalProcessed.get(), totalItems, successCount.get());
                    }
                    
                } catch (Exception e) {
                    log.error("处理物品 {} 时出错: {}", marketHashName, e.getMessage());
                    skippedItems.add(marketHashName + " (处理出错: " + e.getMessage() + ")");
                }
            });
            
            log.info("导入完成: 总共 {} 个物品，成功导入 {} 个，跳过 {} 个", 
                   totalItems, successCount.get(), skippedItems.size());
            
            return new ImportResult(successCount.get(), skippedItems.size(), skippedItems, totalItems);
            
        } catch (Exception e) {
            log.error("导入JSON数据失败", e);
            throw new RuntimeException("导入失败: " + e.getMessage());
        }
    }

    // 导入结果DTO - 添加总数量字段
    public static class ImportResult {
        public final int importedCount;
        public final int skippedCount;
        public final List<String> skippedItems;
        public final int totalItems;
        
        public ImportResult(int importedCount, int skippedCount, List<String> skippedItems, int totalItems) {
            this.importedCount = importedCount;
            this.skippedCount = skippedCount;
            this.skippedItems = skippedItems;
            this.totalItems = totalItems;
        }
    }
} 