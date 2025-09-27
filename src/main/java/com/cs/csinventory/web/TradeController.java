package com.cs.csinventory.web;

import com.cs.csinventory.domain.Inventory;
import com.cs.csinventory.domain.Item;
import com.cs.csinventory.domain.Trade;
import com.cs.csinventory.service.InventoryService;
import com.cs.csinventory.service.ItemService;
import com.cs.csinventory.service.TradeService;
import com.cs.csinventory.service.dto.DailyFlowDTO;
import com.cs.csinventory.service.dto.TradeWithItemDTO;
import com.cs.csinventory.service.dto.InventoryWithItemDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TradeController {

    private final TradeService tradeService;
    private final ItemService itemService;
    private final InventoryService inventoryService;

    // ==================== 物品管理接口 ====================
    
    @GetMapping("/items")
    public List<Item> getAllItems() {
        return itemService.getAllItems();
    }
    
    // 新增：搜索物品接口
    @GetMapping("/items/search")
    public List<Item> searchItems(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "15") int limit
    ) {
        // 限制最大返回数量，避免性能问题
        int actualLimit = Math.min(limit, 50);
        return itemService.searchItems(keyword, actualLimit);
    }
    
    @PostMapping("/items")
    public Item createItem(@RequestBody Item item) {
        return itemService.createItem(item);
    }
    
    @PostMapping("/items/import")
    public ItemService.ImportResult importItems(@RequestBody Map<String, Object> request) {
        String jsonData = (String) request.get("jsonData");
        if (jsonData == null || jsonData.trim().isEmpty()) {
            throw new IllegalArgumentException("JSON数据不能为空");
        }
        return itemService.importItemsFromJson(jsonData);
    }
    
    @PostMapping("/items/import-file")
    public ItemService.ImportResult importItemsFromFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }
        
        // 检查文件类型
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".json")) {
            throw new IllegalArgumentException("只支持JSON文件格式");
        }
        
        // 检查文件大小 (限制为50MB)
        if (file.getSize() > 50 * 1024 * 1024) {
            throw new IllegalArgumentException("文件大小不能超过50MB");
        }
        
        try {
            // 读取文件内容
            String jsonData = new String(file.getBytes(), StandardCharsets.UTF_8);
            return itemService.importItemsFromJson(jsonData);
        } catch (IOException e) {
            throw new RuntimeException("读取文件失败: " + e.getMessage());
        }
    }

    // ==================== 交易管理接口 ====================

    @PostMapping("/trades")
    public Trade createTrade(@RequestBody TradeRequest request) {
        // 构建Trade对象
        Trade trade = Trade.builder()
                .nameId(request.nameId())
                .type(request.type())
                .unitPrice(request.unitPrice())
                .quantity(request.quantity())
                .build();
        
        return tradeService.createTrade(trade);
    }

    @PostMapping("/trades/sell")
    public Trade createSellTrade(@RequestBody SellRequest request) {
        // 验证是否有足够库存
        if (!inventoryService.hasEnoughInventory(request.nameId(), request.quantity())) {
            Integer currentQuantity = inventoryService.getCurrentQuantity(request.nameId());
            throw new IllegalStateException(
                String.format("库存不足，当前持有: %d，尝试卖出: %d", currentQuantity, request.quantity())
            );
        }
        
        // 构建卖出交易
        Trade trade = Trade.builder()
                .nameId(request.nameId())
                .type(Trade.Type.SELL)
                .unitPrice(request.unitPrice())
                .quantity(request.quantity())
                .build();
        
        return tradeService.createTrade(trade);
    }

    @GetMapping("/trades")
    public List<TradeWithItemDTO> getAllTrades() {
        return tradeService.getAllTradesWithItem();
    }

    @GetMapping("/trades/history/{nameId}")
    public List<TradeWithItemDTO> getTradeHistory(@PathVariable Long nameId) {
        return tradeService.getTradeHistoryWithItem(nameId);
    }

    @GetMapping("/trades/date-range")
    public List<TradeWithItemDTO> getTradesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end
    ) {
        return tradeService.getTradesByDateRangeWithItem(start, end);
    }

    // ==================== 库存管理接口 ====================

    @GetMapping("/inventory")
    public List<InventoryWithItemDTO> getAllInventory() {
        return inventoryService.getAllInventoryWithItem();
    }

    @GetMapping("/inventory/{nameId}")
    public InventoryWithItemDTO getInventoryByNameId(@PathVariable Long nameId) {
        return inventoryService.getInventoryWithItemByNameId(nameId)
                .orElse(null);
    }

    @GetMapping("/inventory/{nameId}/quantity")
    public Map<String, Object> getCurrentQuantity(@PathVariable Long nameId) {
        Integer quantity = inventoryService.getCurrentQuantity(nameId);
        return Map.of(
                "nameId", nameId,
                "quantity", quantity
        );
    }

    // ==================== 统计接口 ====================

    @GetMapping("/stats/daily")
    public List<DailyFlowDTO> daily(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end
    ) {
        return tradeService.dailySummary(start, end);
    }

    // ==================== 内部类 ====================

    /**
     * 交易请求DTO
     */
    public record TradeRequest(
            Long nameId,
            Trade.Type type,
            BigDecimal unitPrice,
            Integer quantity
    ) {}

    /**
     * 卖出请求DTO
     */
    public record SellRequest(
            Long nameId,
            BigDecimal unitPrice,
            Integer quantity
    ) {}
}
