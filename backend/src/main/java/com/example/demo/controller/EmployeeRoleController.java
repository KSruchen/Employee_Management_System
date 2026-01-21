package com.example.demo.controller;

import com.example.demo.model.EmployeeRole;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.repository.EmployeeRoleRepository;

import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/employee-roles")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeRoleController {

    private final EmployeeRepository employeeRepository;
    private final EmployeeRoleRepository employeeRoleRepository;

    public EmployeeRoleController(EmployeeRepository employeeRepository,
                                  EmployeeRoleRepository employeeRoleRepository) {
        this.employeeRepository = employeeRepository;
        this.employeeRoleRepository = employeeRoleRepository;
    }

    // ----------------------------------------------------
    // 1. ROLE HISTORY
    // ----------------------------------------------------
    @GetMapping("/{empId}")
    public ResponseEntity<?> getRoles(@PathVariable String empId) {

        if (!employeeRepository.existsById(empId)) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Employee not found");
        }

        List<EmployeeRole> roles =
                employeeRoleRepository.findByEmpIdOrderByFromDateDesc(empId);

        return ResponseEntity.ok(roles);
    }

    // ----------------------------------------------------
    // 2. ADD NEW ROLE (AUTO CLOSE OLD)
    // ----------------------------------------------------
    @PostMapping("/{empId}")
    @Transactional
    public ResponseEntity<?> addRole(@PathVariable String empId,
                                     @RequestBody EmployeeRole newRole) {

        if (!employeeRepository.existsById(empId)) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Employee not found");
        }

        if (newRole.getFromDate() == null) recall: {
            return ResponseEntity
                    .badRequest()
                    .body("From Date is required");
        }

        employeeRoleRepository
                .findFirstByEmpIdOrderByFromDateDesc(empId)
                .ifPresent(oldRole -> {
                    if (oldRole.getToDate() == null) {
                        oldRole.setToDate(newRole.getFromDate().minusDays(1));
                        employeeRoleRepository.save(oldRole);
                    }
                });

        EmployeeRole role = new EmployeeRole();
        role.setEmpId(empId);
        role.setRoleName(newRole.getRoleName());
        role.setRoleNumber(newRole.getRoleNumber());
        role.setFromDate(newRole.getFromDate());
        role.setToDate(null);

        employeeRoleRepository.save(role);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(role);
    }
}
