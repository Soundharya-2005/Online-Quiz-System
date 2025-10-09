package com.skillboost.quizbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Result {
    private int score;
    private int totalQuestions;
    private double percentage;
    private String message;
}
