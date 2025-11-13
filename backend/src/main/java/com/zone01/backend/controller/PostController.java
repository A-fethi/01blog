package com.zone01.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zone01.backend.dto.PostDTO;
import com.zone01.backend.entity.Post;
import com.zone01.backend.entity.User;
import com.zone01.backend.exception.UserNotFoundException;
import com.zone01.backend.service.PostService;
import com.zone01.backend.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final UserService userService;

    public PostController(PostService postService, UserService userService) {
        this.postService = postService;
        this.userService = userService;
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

    @PostMapping
    public ResponseEntity<PostDTO> createPost(
            @Valid @RequestBody PostDTO postDTO,
            @AuthenticationPrincipal User user) {

        User loggedUser = userService.findByUsername(user.getUsername()).orElseThrow();
        Post newPost = postService.createPost(loggedUser.getId(), postDTO);
        return ResponseEntity.ok(new PostDTO(newPost));
    }

    @PutMapping("/{postId}")
    public ResponseEntity<PostDTO> updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody PostDTO postDTO,
            @AuthenticationPrincipal User user) {
        User loggedUser = userService.findByUsername(user.getUsername())
                .orElseThrow(() -> new UserNotFoundException(postId));
        return ResponseEntity.ok(new PostDTO(postService.updatePost(postId, loggedUser, postDTO)));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<PostDTO> deletePost(
            @PathVariable long postId,
            @AuthenticationPrincipal User user) {
        postService.deletePost(postId, user);
        return ResponseEntity.noContent().build();
    }

}
