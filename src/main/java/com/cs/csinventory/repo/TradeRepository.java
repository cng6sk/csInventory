package com.cs.csinventory.repo;

import com.cs.csinventory.domain.Trade;
// import com.cs.csinventory.domain.Trade.Type;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.List;

public interface TradeRepository extends JpaRepository<Trade, Long> {

    // 简易日报统计：按日汇总买卖额与净额（仅示例，统计口径可扩展）
    @Query("""
      select
        date(t.occurredAt) as day,
        sum(case when t.type = com.cs.csinventory.domain.Trade$Type.BUY  then t.unitPrice * t.quantity else 0 end) as totalBuy,
        sum(case when t.type = com.cs.csinventory.domain.Trade$Type.SELL then t.unitPrice * t.quantity else 0 end) as totalSell
      from Trade t
      where t.occurredAt between :start and :end
      group by date(t.occurredAt)
      order by day asc
    """)
    List<Object[]> summarizeDaily(OffsetDateTime start, OffsetDateTime end);
}
