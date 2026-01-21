package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "EMPLOYEE")
public class Employee {

    @Id
    @Column(name = "EMP_ID")
    private String empId;                 // 6-digit Employee ID

    @Column(name = "EMP_NAME")
    private String empName;

    @Column(name = "ADDRESS")
    private String address;

    @Column(name = "PHONE")
    private String phone;

    @Column(name = "AGE")
    private Integer age;

    @Column(name = "GENDER")
    private String gender;

    @Column(name = "NA_FLAG")
    private String naFlag;

    @Column(name = "EMAIL")
    private String email;

    // ---- Directorates / Divisions via foreign keys ----

    @ManyToOne
    @JoinColumn(name = "DIRECTORATE_ID")
    private Directorate directorate;

    @ManyToOne
    @JoinColumn(name = "DIVISION_ID")
    private Division division;
    
    @Column(name = "DIRECTORATE")
    private String directorateName;

    @Column(name = "DIVISION")
    private String divisionName;

    // ---- ROLE FIELDS ARE TRANSIENT (not stored in EMPLOYEE table) ----
    // They will be loaded/saved manually via EMPLOYEE_ROLE table.

    @Transient
    private String roleName;

    @Transient
    private String roleNumber;

    @Transient
    private LocalDate fromDate;

    @Transient
    private LocalDate toDate;
}
