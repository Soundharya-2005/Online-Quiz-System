package com.example.backend.controller;

import com.example.backend.model.DailyAttendance;
import com.example.backend.repository.DailyAttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/daily-attendance")
public class DailyAttendanceController {
    @Autowired
    private DailyAttendanceRepository dailyAttendanceRepository;

    @GetMapping
    public List<DailyAttendance> getAllDailyAttendance() {
        return dailyAttendanceRepository.findAll();
    }

    @GetMapping("/filter")
    public List<DailyAttendance> getDailyAttendanceByDeptAndAcademicYear(
            @RequestParam String department,
            @RequestParam String academicYear) {
        return dailyAttendanceRepository.findByDepartmentAndAcademicYear(department, academicYear);
    }

    @PostMapping("/submit")
    public ResponseEntity<List<DailyAttendance>> submitDailyAttendance(
            @RequestBody List<DailyAttendance> attendanceRecords) {
        if (attendanceRecords == null || attendanceRecords.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }
        List<DailyAttendance> savedRecords = attendanceRecords.stream()
                .map(record -> {
                    Optional<DailyAttendance> existingRecord = dailyAttendanceRepository
                            .findByDateAndRollNo(record.getDate(), record.getRollNo());
                    if (existingRecord.isPresent()) {
                        DailyAttendance existing = existingRecord.get();
                        existing.setStatus(record.getStatus());
                        return dailyAttendanceRepository.save(existing);
                    } else {
                        return dailyAttendanceRepository.save(record);
                    }
                })
                .toList();
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRecords);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteDailyAttendance(
            @RequestParam String date,
            @RequestParam String rollNo) {
        Optional<DailyAttendance> record = dailyAttendanceRepository.findByDateAndRollNo(date, rollNo);
        if (record.isPresent()) {
            dailyAttendanceRepository.delete(record.get());
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}