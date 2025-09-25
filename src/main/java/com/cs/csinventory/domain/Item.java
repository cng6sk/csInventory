package com.cs.csinventory.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "items", indexes = {
        @Index(name = "idx_item_name", columnList = "name")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Item {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 物品名（例如：AK-47 | Redline）
    @Column(nullable = false, length = 255)
    private String name;

    // 外观（Factory New / Minimal Wear / Field-Tested / Well-Worn / Battle-Scarred）
    @Column(length = 64)
    private String exterior;

    // 游戏（固定 "CS" 或预留字段）
    @Column(length = 32)
    private String game;

    // 市场ID（如 Steam 市场条目ID，可选）
    @Column(length = 128, unique = false)
    private String marketId;
}
