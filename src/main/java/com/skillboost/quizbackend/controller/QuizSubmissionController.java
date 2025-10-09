package com.skillboost.quizbackend.controller;

import com.skillboost.quizbackend.dto.QuizSubmission;
import com.skillboost.quizbackend.dto.Result;
import com.skillboost.quizbackend.model.QuizQuestion;
import com.skillboost.quizbackend.repository.QuizQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class QuizSubmissionController {

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    @PostMapping("/submit")
    public Result submitQuiz(@RequestBody QuizSubmission submission) {
        List<QuizQuestion> questions = quizQuestionRepository.findBySubtopic_Id(submission.getSubtopicId());

        if (questions.isEmpty()) {
            return new Result(0, 0, 0, "No questions found for this quiz.");
        }

        int score = 0;
        int totalQuestions = questions.size();

        for (QuizSubmission.Answer answer : submission.getAnswers()) {
            QuizQuestion question = questions.stream()
                    .filter(q -> q.getId().equals(answer.getQuestionId()))
                    .findFirst()
                    .orElse(null);

            if (question != null && question.getCorrectAnswerIndex() == answer.getChosenOptionIndex()) {
                score++;
            }
        }

        double percentage = (double) score / totalQuestions * 100;
        String message;
        if (percentage == 100) {
            message = "Outstanding! 🔥 Perfect score!";
        } else if (percentage >= 80) {
            message = "Great job! 🌟";
        } else if (percentage >= 60) {
            message = "Nice! You're getting there.";
        } else if (percentage >= 40) {
            message = "Not bad, review & try again.";
        } else {
            message = "Start from basics and bounce back! 💪";
        }

        return new Result(score, totalQuestions, percentage, message);
    }
}
