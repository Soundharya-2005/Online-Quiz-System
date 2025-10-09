package com.skillboost.quizbackend.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuizSubmission {
    private String subtopicId;
    private List<Answer> answers;

    @Data
    public static class Answer {
        private Long questionId;
        private int chosenOptionIndex;
    }
}