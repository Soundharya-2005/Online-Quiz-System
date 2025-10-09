package com.skillboost.quizbackend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class Topic {
    @Id
    private String id;
    private String title;
    private String videoId;

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Subtopic> subtopics;

    public Topic(String id, String title, String videoId) {
        this.id = id;
        this.title = title;
        this.videoId = videoId;
    }
}