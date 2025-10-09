package com.example.backend.controller;

import com.example.backend.model.PeriodAttendance;
import com.example.backend.repository.PeriodAttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/period-attendance")
public class PeriodAttendanceController {

    @Autowired
    private PeriodAttendanceRepository periodAttendanceRepository;

    @GetMapping
    public List<PeriodAttendance> getAllPeriodAttendance() {
        return periodAttendanceRepository.findAll();
    }

    @GetMapping("/filter")
    public List<PeriodAttendance> getPeriodAttendanceByDeptAndAcademicYear(
            @RequestParam String department,
            @RequestParam String academicYear) {
        return periodAttendanceRepository.findByDepartmentAndAcademicYear(department, academicYear);
    }

    @PostMapping("/submit")
    public ResponseEntity<List<PeriodAttendance>> submitPeriodAttendance(
            @RequestBody List<PeriodAttendance> attendanceRecords) {
        if (attendanceRecords == null || attendanceRecords.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        List<PeriodAttendance> savedRecords = attendanceRecords.stream()
                .map(record -> {
                    Optional<PeriodAttendance> existingRecord = periodAttendanceRepository
                            .findByDateAndRollNoAndTypeAndPeriodName(
                                    record.getDate(), record.getRollNo(), record.getType(), record.getPeriodName());
                    if (existingRecord.isPresent()) {
                        PeriodAttendance existing = existingRecord.get();
                        existing.setStatus(record.getStatus());
                        return periodAttendanceRepository.save(existing);
                    } else {
                        return periodAttendanceRepository.save(record);
                    }
                })
                .toList();
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRecords);
    }

    @DeleteMapping
    public ResponseEntity<Void> deletePeriodAttendance(
            @RequestParam String date,
            @RequestParam String rollNo,
            @RequestParam String type,
            @RequestParam String periodName) { // Make sure this matches frontend `data-name`
        Optional<PeriodAttendance> record = periodAttendanceRepository.findByDateAndRollNoAndTypeAndPeriodName(date,
                rollNo, type, periodName);
        if (record.isPresent()) {
            periodAttendanceRepository.delete(record.get());
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}