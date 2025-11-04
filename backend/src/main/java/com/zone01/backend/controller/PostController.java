package com.zone01.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zone01.backend.dto.PostDTO;
import com.zone01.backend.entity.Post;
import com.zone01.backend.service.PostService;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts() {
        List<PostDTO> posts = postService.getAllPosts()
                .stream()
                .map(PostDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPostById(@PathVariable Long id) {
        Post post = postService.getPostById(id);
        return ResponseEntity.ok(new PostDTO(post));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<PostDTO> createPost(
            @PathVariable Long userId,
            @RequestBody PostDTO postDTO) {

        Post newPost = postService.createPost(userId, postDTO);
        return ResponseEntity.ok(new PostDTO(newPost));
    }

}
