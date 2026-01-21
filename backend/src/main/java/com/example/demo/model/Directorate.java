package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Directorate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long directorateId;

    private String name;
}
