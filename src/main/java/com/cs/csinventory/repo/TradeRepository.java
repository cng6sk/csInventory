package com.cs.csinventory.repo;

import com.cs.csinventory.domain.Trade;
import com.cs.csinventory.service.dto.TradeWithItemDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface TradeRepository extends JpaRepository<Trade, Long> {
    
    /**
     * 根据物品nameId查找交易记录
     */
    List<Trade> findByNameId(Long nameId);
    
    /**
     * 根据时间范围查找交易记录
     */
    List<Trade> findByCreatedAtBetween(OffsetDateTime start, OffsetDateTime end);
    
    /**
     * 根据物品nameId和时间范围查找交易记录
     */
    List<Trade> findByNameIdAndCreatedAtBetween(Long nameId, OffsetDateTime start, OffsetDateTime end);
    
    /**
     * 查询指定时间范围内的每日交易统计
     */
    @Query(value = """
        SELECT DATE(t.created_at) as trade_date,
               t.type as trade_type,
               SUM(t.quantity) as total_quantity,
               SUM(t.total_amount) as total_amount,
               COUNT(t) as trade_count
        FROM trades t
        WHERE t.created_at BETWEEN :start AND :end
        GROUP BY DATE(t.created_at), t.type
        ORDER BY trade_date DESC, t.type
         """, nativeQuery = true)
     List<Object[]> findDailyTradeSummary(@Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);
    
    /**
     * 获取所有交易记录并包含物品信息
     */
    @Query("""
        SELECT new com.cs.csinventory.service.dto.TradeWithItemDTO(
            t.id, t.nameId, i.cnName, i.enName, t.type, 
            t.unitPrice, t.quantity, t.totalAmount, t.createdAt
        )
        FROM Trade t 
        LEFT JOIN Item i ON t.nameId = i.nameId
        ORDER BY t.createdAt DESC
    """)
    List<TradeWithItemDTO> findAllTradesWithItem();
    
    /**
     * 根据物品nameId查找交易记录并包含物品信息
     */
    @Query("""
        SELECT new com.cs.csinventory.service.dto.TradeWithItemDTO(
            t.id, t.nameId, i.cnName, i.enName, t.type, 
            t.unitPrice, t.quantity, t.totalAmount, t.createdAt
        )
        FROM Trade t 
        LEFT JOIN Item i ON t.nameId = i.nameId
        WHERE t.nameId = :nameId
        ORDER BY t.createdAt DESC
    """)
    List<TradeWithItemDTO> findTradeHistoryWithItem(@Param("nameId") Long nameId);
    
    /**
     * 根据时间范围查找交易记录并包含物品信息
     */
    @Query("""
        SELECT new com.cs.csinventory.service.dto.TradeWithItemDTO(
            t.id, t.nameId, i.cnName, i.enName, t.type, 
            t.unitPrice, t.quantity, t.totalAmount, t.createdAt
        )
        FROM Trade t 
        LEFT JOIN Item i ON t.nameId = i.nameId
        WHERE t.createdAt BETWEEN :start AND :end
        ORDER BY t.createdAt DESC
    """)
    List<TradeWithItemDTO> findTradesByDateRangeWithItem(@Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);
}
