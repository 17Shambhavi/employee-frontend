package com.employee.employee_management.controller;

import com.employee.employee_management.model.Attendance;
import com.employee.employee_management.model.Employee;
import com.employee.employee_management.model.LeaveRequest;
import com.employee.employee_management.repository.AttendanceRepository;
import com.employee.employee_management.repository.EmployeeRepository;
import com.employee.employee_management.repository.LeaveRequestRepository;
import com.employee.employee_management.security.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminEmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserService userService;

    // Get All Employees
    @GetMapping("/employees")
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // Add Employee
    @PostMapping("/employees")
    public Employee addEmployee(
        @RequestBody Employee employee) {
    return employeeRepository.save(employee);
}

// Delete Employee
@DeleteMapping("/employees/{id}")
public ResponseEntity<?> deleteEmployee(
    @PathVariable Long id) {
    employeeRepository.deleteById(id);
    return ResponseEntity.ok("Deleted!");
}

// Update Employee
@PutMapping("/employees/{id}")
public ResponseEntity<?> updateEmployee(
    @PathVariable Long id,
@RequestBody Employee updatedEmp) {
    return employeeRepository.findById(id)
        .map(emp -> {
            emp.setName(updatedEmp.getName());
            emp.setDepartment(
                updatedEmp.getDepartment());
            emp.setDesignation(
                updatedEmp.getDesignation());
            emp.setEmail(updatedEmp.getEmail());
            emp.setMobileNumber(
                updatedEmp.getMobileNumber());
            emp.setSalary(updatedEmp.getSalary());
            employeeRepository.save(emp);
            return ResponseEntity.ok("Updated!");
        }).orElse(ResponseEntity.status(404)
            .body("Not found!"));
}

// Search by Department
@GetMapping("/employees/department/{dept}")
public List<Employee> getByDepartment(
    @PathVariable String dept) {
    return employeeRepository
        .findByDepartment(dept);
}

// Filter by Salary
@GetMapping("/employees/salary/{salary}")
public List<Employee> getBySalary(
    @PathVariable Double salary) {
    return employeeRepository
        .findBySalaryGreaterThan(salary);
}

// Pending Leaves
@GetMapping("/leaves/pending")
public List<LeaveRequest> getPendingLeaves() {
    return leaveRequestRepository
        .findByStatus("PENDING");
}

// Approve Leave
@PutMapping("/leave/{id}/approve")
public ResponseEntity<?> approveLeave(
    @PathVariable Long id) {
    return leaveRequestRepository.findById(id)
        .map(leave -> {
            leave.setStatus("APPROVED");
            leaveRequestRepository.save(leave);
            return ResponseEntity.ok("Approved!");
        }).orElse(ResponseEntity.status(404)
            .body("Not found!"));
}

// Reject Leave
@PutMapping("/leave/{id}/reject")
public ResponseEntity<?> rejectLeave(
    @PathVariable Long id) {
    return leaveRequestRepository.findById(id)
        .map(leave -> {
            leave.setStatus("REJECTED");
            leaveRequestRepository.save(leave);
            return ResponseEntity.ok("Rejected!");
        }).orElse(ResponseEntity.status(404)
            .body("Not found!"));
}

// Today's Attendance Count
@GetMapping("/attendance/today")
public ResponseEntity<?> getTodayAttendance() {
    List<Attendance> list = attendanceRepository
        .findByDateAndStatus(
            LocalDate.now(), "PRESENT");
    return ResponseEntity.ok(
        Map.of("presentCount", list.size()));
}

// Attendance Insights
@GetMapping("/attendance/insights")
public ResponseEntity<?> getAttendanceInsights() {
    LocalDate today = LocalDate.now();
    LocalDate weekStart = today.minusDays(6);
    List<Attendance> records = attendanceRepository
        .findByDateBetween(weekStart, today);

    long totalRecords = records.size();
    long presentCount = records.stream()
        .filter(a -> "PRESENT"
            .equalsIgnoreCase(a.getStatus()))
        .count();
    long absentCount = totalRecords - presentCount;
    double attendanceRate = totalRecords == 0
        ? 0
        : (presentCount * 100.0 / totalRecords);

    Map<DayOfWeek, Long> absentByDay = records
        .stream()
        .filter(a -> !"PRESENT"
            .equalsIgnoreCase(a.getStatus()))
        .collect(Collectors.groupingBy(
            a -> a.getDate().getDayOfWeek(),
            Collectors.counting()));

    String worstDay = absentByDay.entrySet()
        .stream()
        .max(Map.Entry.comparingByValue())
        .map(e -> e.getKey().toString())
        .orElse(null);

    StringBuilder summary = new StringBuilder();
    if (totalRecords == 0) {
        summary.append(
            "No attendance data recorded " +
            "in the past week.");
    } else {
        summary.append(String.format(
            "Attendance rate for the past " +
            "week was %.0f%%. ", attendanceRate));
        if (attendanceRate >= 90) {
            summary.append(
                "Overall attendance was excellent. ");
        } else if (attendanceRate >= 75) {
            summary.append(
                "Overall attendance was satisfactory. ");
        } else {
            summary.append(
                "Overall attendance needs improvement. ");
        }
        if (worstDay != null) {
            String formattedDay = worstDay.charAt(0)
                + worstDay.substring(1).toLowerCase();
            summary.append(formattedDay)
                .append(" had the highest number " +
                    "of absences this week.");
        }
    }

    Map<String, Object> response = new HashMap<>();
    response.put("summary", summary.toString());
    response.put("attendanceRate",
        Math.round(attendanceRate));
    response.put("totalRecords", totalRecords);
    response.put("presentCount", presentCount);
    response.put("absentCount", absentCount);
    response.put("worstDay", worstDay);

    return ResponseEntity.ok(response);
}

// HR User banana (sirf Admin kar sakta hai)
@PostMapping("/create-hr")
public ResponseEntity<?> createHR(
    @RequestBody Map<String, String> request) {
    String username = request.get("username");
    String password = request.get("password");
    userService.registerUser(
        username, password, null, "HR");
    return ResponseEntity.ok(
        "HR user created successfully!");
}
}