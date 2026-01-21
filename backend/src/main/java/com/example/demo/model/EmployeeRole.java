package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "EMPLOYEE_ROLE")
public class EmployeeRole {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roleId;
    
    @Column(nullable = false)
    private String empId;
    
    @Column(nullable = false)
    private String roleName;
    
    @Column(nullable = false)
    private String roleNumber;
    
    @Column(nullable = false)
    private LocalDate fromDate;
    
    private LocalDate toDate;
    
    // NEW: Directorate and Division for each role
    @ManyToOne
    @JoinColumn(name = "DIRECTORATE_ID")
    private Directorate directorate;
    
    @ManyToOne
    @JoinColumn(name = "DIVISION_ID")
    private Division division;
}