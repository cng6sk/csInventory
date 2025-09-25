package com.cs.csinventory.web;

import com.cs.csinventory.domain.Item;
import com.cs.csinventory.domain.Trade;
import com.cs.csinventory.service.TradeService;
import com.cs.csinventory.service.dto.DailyFlowDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TradeController {

    private final TradeService tradeService;

    @PostMapping("/items")
    public Item createItem(@RequestBody Item item) {
        if (item.getGame() == null) item.setGame("CS");
        return tradeService.createItem(item);
    }

    @PostMapping("/trades")
    public Trade createTrade(@RequestBody Trade trade) {
        return tradeService.createTrade(trade);
    }

    @GetMapping("/stats/daily")
    public List<DailyFlowDTO> daily(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end
    ) {
        return tradeService.dailySummary(start, end);
    }
}
