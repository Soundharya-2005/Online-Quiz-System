package com.example.backend.repository;

import com.example.backend.model.LeaveRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveRecordRepository extends JpaRepository<LeaveRecord, Long> {
    Optional<LeaveRecord> findByRollNoAndStartDate(String rollNo, String startDate);

    List<LeaveRecord> findByRollNo(String rollNo);

}
