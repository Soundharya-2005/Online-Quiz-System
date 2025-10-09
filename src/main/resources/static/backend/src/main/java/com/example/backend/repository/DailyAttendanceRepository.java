package com.example.backend.repository;

import com.example.backend.model.DailyAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DailyAttendanceRepository extends JpaRepository<DailyAttendance, Long> {
    Optional<DailyAttendance> findByDateAndRollNo(String date, String rollNo);

    List<DailyAttendance> findByDepartmentAndAcademicYear(String department, String academicYear);

    List<DailyAttendance> findByRollNo(String rollNo);
}