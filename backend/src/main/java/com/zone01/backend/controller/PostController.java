package com.zone01.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.zone01.backend.dto.PostDTO;
import com.zone01.backend.entity.Post;
import com.zone01.backend.entity.User;
import com.zone01.backend.security.AppUserDetails;
import com.zone01.backend.service.PostService;
import com.zone01.backend.service.FileStorageService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final FileStorageService fileStorageService;

    public PostController(PostService postService, FileStorageService fileStorageService) {
        this.postService = postService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts(@AuthenticationPrincipal AppUserDetails auth) {
        User currentUser = (auth != null) ? auth.getUser() : null;
        return ResponseEntity.ok(postService.getAllPostsDTO(currentUser));
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<PostDTO>> getPostsByUsername(@PathVariable String username,
            @AuthenticationPrincipal AppUserDetails auth) {
        User currentUser = (auth != null) ? auth.getUser() : null;
        return ResponseEntity.ok(postService.getPostsByUsername(username, currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPostById(@PathVariable Long id, @AuthenticationPrincipal AppUserDetails auth) {
        User currentUser = (auth != null) ? auth.getUser() : null;
        return ResponseEntity.ok(postService.getPostDetails(id, currentUser));
    }

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<PostDTO> createPost(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file,
            @AuthenticationPrincipal AppUserDetails auth) {

        if (auth == null || auth.getUser() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User loggedUser = auth.getUser();

        PostDTO postDTO = new PostDTO();
        postDTO.setTitle(title);
        postDTO.setContent(content);

        if (file != null && !file.isEmpty()) {
            String fileName = fileStorageService.storeFile(file);
            postDTO.setMediaUrl("http://localhost:8080/uploads/" + fileName);
        }

        Post newPost = postService.createPost(loggedUser.getId(), postDTO);
        return ResponseEntity.ok(new PostDTO(newPost));
    }

    @PutMapping(value = "/{postId}", consumes = { "multipart/form-data" })
    public ResponseEntity<PostDTO> updatePost(
            @PathVariable Long postId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file,
            @AuthenticationPrincipal AppUserDetails auth) {

        User loggedUser = auth.getUser();
        PostDTO postDTO = new PostDTO();
        postDTO.setTitle(title);
        postDTO.setContent(content);

        if (file != null && !file.isEmpty()) {
            String fileName = fileStorageService.storeFile(file);
            postDTO.setMediaUrl("http://localhost:8080/uploads/" + fileName);
        }

        return ResponseEntity.ok(new PostDTO(postService.updatePost(postId, loggedUser, postDTO)));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<PostDTO> deletePost(
            @PathVariable long postId,
            @AuthenticationPrincipal AppUserDetails auth) {
        User loggedUser = auth.getUser();
        postService.deletePost(postId, loggedUser);
        return ResponseEntity.noContent().build();
    }

}
