package com.example.demo.repository;

import com.example.demo.model.EmployeeRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRoleRepository extends JpaRepository<EmployeeRole, Long> {

    Optional<EmployeeRole> findFirstByEmpIdOrderByFromDateDesc(String empId);

    List<EmployeeRole> findByEmpIdOrderByFromDateDesc(String empId);

    void deleteByEmpId(String empId);
}
