package com.skillboost.quizbackend.repository;

import com.skillboost.quizbackend.model.Subtopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubtopicRepository extends JpaRepository<Subtopic, String> {
}