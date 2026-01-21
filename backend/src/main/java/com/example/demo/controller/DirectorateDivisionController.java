package com.example.demo.controller;

import com.example.demo.model.Directorate;
import com.example.demo.model.Division;
import com.example.demo.repository.DirectorateRepository;
import com.example.demo.repository.DivisionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")  // ← CHANGED FROM 3000 to 5173


public class DirectorateDivisionController {

    private final DirectorateRepository directorateRepo;
    private final DivisionRepository divisionRepo;

    public DirectorateDivisionController(DirectorateRepository dirRepo,
                                         DivisionRepository divRepo) {
        this.directorateRepo = dirRepo;
        this.divisionRepo = divRepo;
    }

    @GetMapping("/directorates")
    public List<Directorate> getAllDirectorates() {
        return directorateRepo.findAll();
    }

    @GetMapping("/divisions")
    public List<Division> getAllDivisions() {
        return divisionRepo.findAll();
    }

    @GetMapping("/divisions/by-directorate/{directorateId}")
    public List<Division> getDivisionsByDirectorate(@PathVariable Long directorateId) {
        return divisionRepo.findByDirectorate_DirectorateId(directorateId);
    }
}