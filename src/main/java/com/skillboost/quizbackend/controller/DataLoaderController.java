package com.skillboost.quizbackend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillboost.quizbackend.model.QuizQuestion;
import com.skillboost.quizbackend.model.Subtopic;
import com.skillboost.quizbackend.model.Topic;
import com.skillboost.quizbackend.repository.SubtopicRepository;
import com.skillboost.quizbackend.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/data")
public class DataLoaderController {

    @Autowired
    private TopicRepository topicRepository;
    @Autowired
    private SubtopicRepository subtopicRepository;

    @GetMapping("/load")
    public String loadData() {
        ObjectMapper mapper = new ObjectMapper();
        TypeReference<Map<String, TopicData>> typeReference = new TypeReference<>() {
        };
        InputStream inputStream = TypeReference.class.getResourceAsStream("/quiz_data.json");
        try {
            Map<String, TopicData> data = mapper.readValue(inputStream, typeReference);
            data.forEach((topicId, topicData) -> {
                Topic topic = new Topic(topicId, topicData.getTitle(), topicData.getVideoId());
                topicRepository.save(topic);

                if (topicData.getSubtopics() != null) {
                    topicData.getSubtopics().forEach(subtopicData -> {
                        Subtopic subtopic = new Subtopic(subtopicData.getId(), subtopicData.getName(),
                                subtopicData.getVideoId());
                        subtopic.setTopic(topic);

                        if (subtopicData.getQuiz() != null) {
                            subtopic.setQuestions(subtopicData.getQuiz().stream()
                                    .map(q -> new QuizQuestion(q.getQ(), q.getAnswer(), q.getOptions()))
                                    .collect(Collectors.toList()));
                            subtopic.getQuestions().forEach(q -> q.setSubtopic(subtopic));
                        }
                        subtopicRepository.save(subtopic);
                    });
                }
            });
            return "Data loaded successfully!";
        } catch (IOException e) {
            e.printStackTrace();
            return "Error loading data: " + e.getMessage();
        }
    }

    // Helper classes for JSON deserialization
    @lombok.Data
    static class TopicData {
        private String title;
        private String videoId;
        private java.util.List<SubtopicData> subtopics;
    }

    @lombok.Data
    static class SubtopicData {
        private String id;
        private String name;
        private String videoId;
        private java.util.List<QuestionData> quiz;
    }

    @lombok.Data
    static class QuestionData {
        private String q;
        private java.util.List<String> options;
        private int answer;
    }
}