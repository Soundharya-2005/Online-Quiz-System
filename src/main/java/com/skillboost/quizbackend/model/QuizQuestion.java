package com.skillboost.quizbackend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class QuizQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Use @Column to increase the length of the column.
    // This resolves the "data too long" error for long questions.
    @Column(length = 1000)
    private String questionText;

    private int correctAnswerIndex;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subtopic_id")
    @JsonBackReference
    private Subtopic subtopic;

    @ElementCollection
    @CollectionTable(name = "question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option_text")
    private List<String> options;

    public QuizQuestion(String questionText, int correctAnswerIndex, List<String> options) {
        this.questionText = questionText;
        this.correctAnswerIndex = correctAnswerIndex;
        this.options = options;
    }
}