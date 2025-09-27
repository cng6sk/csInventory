package com.cs.csinventory.web;

import com.cs.csinventory.domain.Inventory;
import com.cs.csinventory.domain.Item;
import com.cs.csinventory.domain.Trade;
import com.cs.csinventory.service.InventoryService;
import com.cs.csinventory.service.ItemService;
import com.cs.csinventory.service.TradeService;
import com.cs.csinventory.service.dto.DailyFlowDTO;
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

    @GetMapping("/trades")
    public List<Trade> getAllTrades() {
        return tradeService.getAllTrades();
    }

    @GetMapping("/trades/history/{nameId}")
    public List<Trade> getTradeHistory(@PathVariable Long nameId) {
        return tradeService.getTradeHistory(nameId);
    }

    @GetMapping("/trades/date-range")
    public List<Trade> getTradesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end
    ) {
        return tradeService.getTradesByDateRange(start, end);
    }

    // ==================== 库存管理接口 ====================

    @GetMapping("/inventory")
    public List<Inventory> getAllInventory() {
        return inventoryService.getAllInventory();
    }

    @GetMapping("/inventory/{nameId}")
    public Inventory getInventoryByNameId(@PathVariable Long nameId) {
        return inventoryService.getInventoryByNameId(nameId)
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
}
