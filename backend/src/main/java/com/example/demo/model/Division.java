package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Division {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long divisionId;

    private String name;

    @ManyToOne
    @JoinColumn(name = "directorate_id")
    private Directorate directorate;
}
