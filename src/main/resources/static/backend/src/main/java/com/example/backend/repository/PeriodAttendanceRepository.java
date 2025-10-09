package com.example.backend.repository;

import com.example.backend.model.PeriodAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PeriodAttendanceRepository extends JpaRepository<PeriodAttendance, Long> {
    Optional<PeriodAttendance> findByDateAndRollNoAndTypeAndPeriodName(String date, String rollNo, String type,
            String periodName);

    List<PeriodAttendance> findByDepartmentAndAcademicYear(String department, String academicYear);

    List<PeriodAttendance> findByRollNo(String rollNo);
}