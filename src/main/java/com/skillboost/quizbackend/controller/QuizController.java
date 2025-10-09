package com.skillboost.quizbackend.controller;

import com.skillboost.quizbackend.model.Topic;
import com.skillboost.quizbackend.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class QuizController {

    @Autowired
    private TopicRepository topicRepository;

    @GetMapping("/topics")
    public List<Topic> getAllTopics() {
        return topicRepository.findAll();
    }

    // Add this new method to handle requests with a topic ID
    @GetMapping("/topics/{topicId}")
    public Optional<Topic> getTopicById(@PathVariable String topicId) {
        return topicRepository.findById(topicId);
    }
}