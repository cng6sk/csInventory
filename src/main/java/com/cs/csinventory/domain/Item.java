package com.cs.csinventory.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "items", indexes = {
        @Index(name = "idx_item_market_hash_name", columnList = "marketHashName"),
        @Index(name = "idx_item_name_id", columnList = "nameId")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Item {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 市场哈希名称，作为唯一标识符（例如：AK-47 | Aquamarine Revenge (Battle-Scarred)）
    @Column(nullable = false, length = 512, unique = true)
    private String marketHashName;

    // 中文名称
    @Column(nullable = false, length = 512)
    private String cnName;

    // 英文名称
    @Column(nullable = false, length = 512)
    private String enName;

    // Steam API中的name_id
    @Column(nullable = false, unique = true)
    private Long nameId;
}
