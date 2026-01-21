package com.example.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final EmployeeRoleRepository employeeRoleRepository;
    private final DirectorateRepository directorateRepository;
    private final DivisionRepository divisionRepository;

    public EmployeeController(EmployeeRepository employeeRepository,
                              EmployeeRoleRepository employeeRoleRepository,
                              DirectorateRepository directorateRepository,
                              DivisionRepository divisionRepository) {
        this.employeeRepository = employeeRepository;
        this.employeeRoleRepository = employeeRoleRepository;
        this.directorateRepository = directorateRepository;
        this.divisionRepository = divisionRepository;
    }

    // ----------------------------------------------------
    // 1. CREATE EMPLOYEE (PERSONAL DETAILS ONLY)
    // ----------------------------------------------------
    @PostMapping
    @Transactional
    public ResponseEntity<?> createEmployee(@RequestBody Employee employee) {
        if (employeeRepository.existsById(employee.getEmpId())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Employee already exists");
        }

        attachDirectorateAndDivision(employee, employee);
        Employee savedEmployee = employeeRepository.save(employee);
        
        return ResponseEntity.ok(savedEmployee);
    }

    // ----------------------------------------------------
    // 2. GET ALL EMPLOYEES WITH PAGINATION
    // ----------------------------------------------------
    @GetMapping
    public ResponseEntity<?> getAllEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        List<Employee> allEmployees = employeeRepository.findAll();
        
        // Manual pagination
        int start = page * size;
        int end = Math.min(start + size, allEmployees.size());
        
        if (start >= allEmployees.size()) {
            return ResponseEntity.ok(new PaginatedResponse(List.of(), 0, page, size));
        }
        
        List<Employee> pageContent = allEmployees.subList(start, end);
        
        return ResponseEntity.ok(new PaginatedResponse(
            pageContent,
            allEmployees.size(),
            page,
            size
        ));
    }

    // ----------------------------------------------------
    // 3. GET EMPLOYEE BY ID (PERSONAL DETAILS ONLY)
    // ----------------------------------------------------
    @GetMapping("/{empId}")
    public ResponseEntity<?> getEmployeeById(@PathVariable String empId) {
        Optional<Employee> optionalEmployee = employeeRepository.findById(empId);

        if (optionalEmployee.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Employee not found");
        }

        Employee emp = optionalEmployee.get();
        return ResponseEntity.ok(emp);
    }

    // ----------------------------------------------------
    // 4. LOOKUP (ID + NAME SEARCH) WITH PAGINATION
    // ----------------------------------------------------
    @GetMapping("/lookup")
    public ResponseEntity<?> lookupEmployees(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        List<Employee> results = query.trim().isEmpty() ? 
            employeeRepository.findAll() : 
            employeeRepository.searchByEmpIdOrName(query);
        
        // Manual

        // Manual pagination
        int start = page * size;
        int end = Math.min(start + size, results.size());
        
        if (start >= results.size()) {
            return ResponseEntity.ok(new PaginatedResponse(List.of(), 0, page, size));
        }
        
        List<Employee> pageContent = results.subList(start, end);
        
        return ResponseEntity.ok(new PaginatedResponse(
            pageContent,
            results.size(),
            page,
            size
        ));
    }

    // ----------------------------------------------------
    // 5. GET ALL ROLES FOR AN EMPLOYEE
    // ----------------------------------------------------
    @GetMapping("/{empId}/roles")
    public List<EmployeeRole> getEmployeeRoles(@PathVariable String empId) {
        return employeeRoleRepository.findByEmpIdOrderByFromDateDesc(empId);
    }

    // ----------------------------------------------------
    // 6. ADD NEW ROLE TO EMPLOYEE
    // ----------------------------------------------------
    @PostMapping("/{empId}/roles")
    @Transactional
    public ResponseEntity<?> addRoleToEmployee(
            @PathVariable String empId,
            @RequestBody EmployeeRole roleInput) {
        
        // Verify employee exists
        if (!employeeRepository.existsById(empId)) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Employee not found");
        }

        EmployeeRole newRole = new EmployeeRole();
        newRole.setEmpId(empId);
        newRole.setRoleName(roleInput.getRoleName());
        newRole.setRoleNumber(roleInput.getRoleNumber());
        newRole.setFromDate(roleInput.getFromDate());
        newRole.setToDate(roleInput.getToDate());
        
        // Set directorate and division for the role
        if (roleInput.getDirectorate() != null && roleInput.getDirectorate().getDirectorateId() != null) {
            Directorate d = directorateRepository
                    .findById(roleInput.getDirectorate().getDirectorateId())
                    .orElseThrow(() -> new RuntimeException("Directorate not found"));
            newRole.setDirectorate(d);
        }
        
        if (roleInput.getDivision() != null && roleInput.getDivision().getDivisionId() != null) {
            Division div = divisionRepository
                    .findById(roleInput.getDivision().getDivisionId())
                    .orElseThrow(() -> new RuntimeException("Division not found"));
            newRole.setDivision(div);
        }

        EmployeeRole savedRole = employeeRoleRepository.save(newRole);
        return ResponseEntity.ok(savedRole);
    }

    // ----------------------------------------------------
    // 7. UPDATE EMPLOYEE (PERSONAL DETAILS ONLY)
    // ----------------------------------------------------
    @PutMapping("/{empId}")
    @Transactional
    public ResponseEntity<?> updateEmployee(
            @PathVariable String empId,
            @RequestBody Employee input) {

        Employee existing = employeeRepository.findById(empId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Update personal details only
        existing.setEmpName(input.getEmpName());
        existing.setPhone(input.getPhone());
        existing.setAddress(input.getAddress());
        existing.setAge(input.getAge());
        existing.setGender(input.getGender());
        existing.setEmail(input.getEmail());

        attachDirectorateAndDivision(existing, input);
        Employee savedEmployee = employeeRepository.save(existing);

        return ResponseEntity.ok(savedEmployee);
    }

    // ----------------------------------------------------
    // 8. UPDATE SPECIFIC ROLE
    // ----------------------------------------------------
    @PutMapping("/roles/{roleId}")
    @Transactional
    public ResponseEntity<?> updateRole(
            @PathVariable Long roleId,
            @RequestBody EmployeeRole roleInput) {
        
        EmployeeRole existingRole = employeeRoleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        existingRole.setRoleName(roleInput.getRoleName());
        existingRole.setRoleNumber(roleInput.getRoleNumber());
        existingRole.setFromDate(roleInput.getFromDate());
        existingRole.setToDate(roleInput.getToDate());
        
        // Update directorate and division for the role
        if (roleInput.getDirectorate() != null && roleInput.getDirectorate().getDirectorateId() != null) {
            Directorate d = directorateRepository
                    .findById(roleInput.getDirectorate().getDirectorateId())
                    .orElseThrow(() -> new RuntimeException("Directorate not found"));
            existingRole.setDirectorate(d);
        }
        
        if (roleInput.getDivision() != null && roleInput.getDivision().getDivisionId() != null) {
            Division div = divisionRepository
                    .findById(roleInput.getDivision().getDivisionId())
                    .orElseThrow(() -> new RuntimeException("Division not found"));
            existingRole.setDivision(div);
        }

        EmployeeRole savedRole = employeeRoleRepository.save(existingRole);
        return ResponseEntity.ok(savedRole);
    }

    // ----------------------------------------------------
    // 9. DELETE ROLE
    // ----------------------------------------------------
    @DeleteMapping("/roles/{roleId}")
    @Transactional
    public ResponseEntity<?> deleteRole(@PathVariable Long roleId) {
        if (!employeeRoleRepository.existsById(roleId)) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Role not found");
        }
        
        employeeRoleRepository.deleteById(roleId);
        return ResponseEntity.ok("Role deleted successfully");
    }

    // ----------------------------------------------------
    // 10. DELETE EMPLOYEE
    // ----------------------------------------------------
    @DeleteMapping("/{empId}")
    @Transactional
    public ResponseEntity<?> deleteEmployee(@PathVariable String empId) {
        if (!employeeRepository.existsById(empId)) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Employee not found");
        }
        
        // Roles will be deleted automatically due to CASCADE
        employeeRepository.deleteById(empId);
        return ResponseEntity.ok("Employee deleted successfully");
    }

    // ====================================================
    // HELPER METHODS
    // ====================================================

    private void attachDirectorateAndDivision(Employee target, Employee source) {
        if (source.getDirectorate() != null && source.getDirectorate().getDirectorateId() != null) {
            Directorate d = directorateRepository
                    .findById(source.getDirectorate().getDirectorateId())
                    .orElseThrow(() -> new RuntimeException("Directorate not found"));
            target.setDirectorate(d);
            target.setDirectorateName(d.getName());
        }

        if (source.getDivision() != null && source.getDivision().getDivisionId() != null) {
            Division div = divisionRepository
                    .findById(source.getDivision().getDivisionId())
                    .orElseThrow(() -> new RuntimeException("Division not found"));
            target.setDivision(div);
            target.setDivisionName(div.getName());
        }
    }

    // Inner class for paginated response
    public static class PaginatedResponse {
        private List<Employee> content;
        private long totalElements;
        private int currentPage;
        private int pageSize;
        private int totalPages;

        public PaginatedResponse(List<Employee> content, long totalElements, int currentPage, int pageSize) {
            this.content = content;
            this.totalElements = totalElements;
            this.currentPage = currentPage;
            this.pageSize = pageSize;
            this.totalPages = (int) Math.ceil((double) totalElements / pageSize);
        }

        // Getters
        public List<Employee> getContent() { return content; }
        public long getTotalElements() { return totalElements; }
        public int getCurrentPage() { return currentPage; }
        public int getPageSize() { return pageSize; }
        public int getTotalPages() { return totalPages; }
    }
}