package com.example.demo.repository;

import com.example.demo.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, String> {

    List<Employee> findByEmpNameContainingIgnoreCase(String empName);

    List<Employee> findByEmpIdContaining(String empId);

    @Query("""
        SELECT e FROM Employee e
        WHERE LOWER(e.empName) LIKE LOWER(CONCAT('%', :query, '%'))
           OR e.empId LIKE CONCAT('%', :query, '%')
    """)
    List<Employee> searchByEmpIdOrName(@Param("query") String query);
}
