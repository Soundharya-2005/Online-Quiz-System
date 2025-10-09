package com.example.backend.controller;

import com.example.backend.model.Student;
import com.example.backend.repository.DailyAttendanceRepository;
import com.example.backend.repository.LeaveRecordRepository;
import com.example.backend.repository.PeriodAttendanceRepository;
import com.example.backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private DailyAttendanceRepository dailyAttendanceRepository;
    @Autowired
    private PeriodAttendanceRepository periodAttendanceRepository;
    @Autowired
    private LeaveRecordRepository leaveRecordRepository;

    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @GetMapping("/{rollNo}")
    public ResponseEntity<Student> getStudentByRollNo(@PathVariable String rollNo) {
        Optional<Student> student = studentRepository.findById(rollNo);
        return student.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> addStudent(@RequestBody Student student) {
        if (studentRepository.existsById(student.getRollNo())) {
            return new ResponseEntity<>("Student with this Roll Number already exists.", HttpStatus.CONFLICT);
        }
        try {
            Student savedStudent = studentRepository.save(student);
            return new ResponseEntity<>(savedStudent, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to add student: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{originalRollNo}")
    public ResponseEntity<?> updateStudent(@PathVariable String originalRollNo, @RequestBody Student student) {
        if (!studentRepository.existsById(originalRollNo)) {
            return new ResponseEntity<>("Original student not found.", HttpStatus.NOT_FOUND);
        }
        if (!originalRollNo.equals(student.getRollNo())) {
            if (studentRepository.existsById(student.getRollNo())) {
                return new ResponseEntity<>("New Roll Number conflicts with an existing student.", HttpStatus.CONFLICT);
            }
            try {
                Optional<Student> existingStudentOpt = studentRepository.findById(originalRollNo);
                if (existingStudentOpt.isPresent()) {
                    Student existingStudent = existingStudentOpt.get();
                    existingStudent.setRollNo(student.getRollNo());
                    existingStudent.setName(student.getName());
                    existingStudent.setDepartment(student.getDepartment());
                    existingStudent.setAcademicYear(student.getAcademicYear());
                    Student updatedStudent = studentRepository.save(existingStudent);
                    return new ResponseEntity<>(updatedStudent, HttpStatus.OK);
                } else {
                    return new ResponseEntity<>("Student not found for update.", HttpStatus.NOT_FOUND);
                }
            } catch (Exception e) {
                return new ResponseEntity<>("Failed to update student: " + e.getMessage(),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            try {
                Student updatedStudent = studentRepository.save(student);
                return new ResponseEntity<>(updatedStudent, HttpStatus.OK);
            } catch (Exception e) {
                return new ResponseEntity<>("Failed to update student: " + e.getMessage(),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @DeleteMapping("/{rollNo}")
    public ResponseEntity<Void> deleteStudent(@PathVariable String rollNo) {
        if (!studentRepository.existsById(rollNo)) {
            return ResponseEntity.notFound().build();
        }
        dailyAttendanceRepository.deleteAll(dailyAttendanceRepository.findByRollNo(rollNo));
        periodAttendanceRepository.deleteAll(periodAttendanceRepository.findByRollNo(rollNo));
        leaveRecordRepository.deleteAll(leaveRecordRepository.findByRollNo(rollNo));
        studentRepository.deleteById(rollNo);
        return ResponseEntity.noContent().build();
    }

    @Transactional
    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAllStudentsAndRecords() {
        dailyAttendanceRepository.deleteAll();
        periodAttendanceRepository.deleteAll();
        leaveRecordRepository.deleteAll();
        studentRepository.deleteAll();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/department/{department}/academicYear/{academicYear}")
    public ResponseEntity<List<Student>> getStudentsByDepartmentAndAcademicYear(
            @PathVariable String department,
            @PathVariable String academicYear) {
        List<Student> students = studentRepository.findByDepartmentAndAcademicYear(department, academicYear);
        if (students.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(students);
    }
}