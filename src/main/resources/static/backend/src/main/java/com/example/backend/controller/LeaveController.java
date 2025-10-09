package com.example.backend.controller;

import com.example.backend.model.LeaveRecord;
import com.example.backend.model.Student;
import com.example.backend.repository.LeaveRecordRepository;
import com.example.backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {
    @Autowired
    private LeaveRecordRepository leaveRecordRepository;
    @Autowired
    private StudentRepository studentRepository;

    @GetMapping
    public List<LeaveRecord> getAllLeaveRecords() {
        return leaveRecordRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<LeaveRecord> applyLeave(@RequestBody LeaveRecord leaveRecord) {
        Optional<Student> student = studentRepository.findById(leaveRecord.getRollNo());
        if (student.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        if (leaveRecord.getName() == null || leaveRecord.getName().isEmpty()) {
            leaveRecord.setName(student.get().getName());
        }
        LeaveRecord savedLeave = leaveRecordRepository.save(leaveRecord);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLeave);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteLeaveRecord(
            @RequestParam String rollNo,
            @RequestParam String startDate) {
        Optional<LeaveRecord> record = leaveRecordRepository.findByRollNoAndStartDate(rollNo, startDate);
        if (record.isPresent()) {
            leaveRecordRepository.delete(record.get());
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}