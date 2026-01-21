package com.example.demo.repository;

import com.example.demo.model.Division;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DivisionRepository extends JpaRepository<Division, Long> {

    // Correct method matching the controller
    List<Division> findByDirectorate_DirectorateId(Long directorateId);
}
