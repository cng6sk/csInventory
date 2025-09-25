package com.cs.csinventory.repo;

import com.cs.csinventory.domain.Item;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> { }
