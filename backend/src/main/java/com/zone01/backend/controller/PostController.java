package com.zone01.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.zone01.backend.dto.PostDTO;
import com.zone01.backend.entity.Post;
import com.zone01.backend.entity.User;
import com.zone01.backend.security.AppUserDetails;
import com.zone01.backend.service.PostService;
import com.zone01.backend.service.FileStorageService;

@RestController
@RequestMapping("/api/posts")
@Validated
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

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/feed")
    public ResponseEntity<List<PostDTO>> getFeedPosts(@AuthenticationPrincipal AppUserDetails auth) {
        return ResponseEntity.ok(postService.getFeedPosts(auth.getUser()));
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

    @PreAuthorize("isAuthenticated()")
    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<PostDTO> createPost(
            @RequestParam("title") @jakarta.validation.constraints.NotBlank(message = "Title is required") @jakarta.validation.constraints.Size(max = 500, message = "Title cannot exceed 500 characters") String title,
            @RequestParam("content") @jakarta.validation.constraints.NotBlank(message = "Content is required") String content,
            @RequestParam(value = "files", required = false) org.springframework.web.multipart.MultipartFile[] files,
            @AuthenticationPrincipal AppUserDetails auth) {

        User loggedUser = auth.getUser();

        PostDTO postDTO = new PostDTO();
        postDTO.setTitle(title);
        postDTO.setContent(content);

        if (files != null && files.length > 0) {
            for (org.springframework.web.multipart.MultipartFile file : files) {
                if (!file.isEmpty()) {
                    if (!fileStorageService.isValidMediaType(file, "image/", "video/")) {
                        throw new RuntimeException("Only images and videos are allowed: " + file.getOriginalFilename());
                    }
                    String fileName = fileStorageService.storeFile(file);
                    com.zone01.backend.dto.PostMediaDTO mediaDTO = new com.zone01.backend.dto.PostMediaDTO();
                    mediaDTO.setMediaUrl("http://localhost:8080/uploads/" + fileName);
                    postDTO.getMedia().add(mediaDTO);
                }
            }
        }

        Post newPost = postService.createPost(loggedUser.getId(), postDTO);
        return ResponseEntity.ok(new PostDTO(newPost));
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping(value = "/{postId}", consumes = { "multipart/form-data" })
    public ResponseEntity<PostDTO> updatePost(
            @PathVariable Long postId,
            @RequestParam("title") @jakarta.validation.constraints.NotBlank(message = "Title is required") @jakarta.validation.constraints.Size(max = 500, message = "Title cannot exceed 500 characters") String title,
            @RequestParam("content") @jakarta.validation.constraints.NotBlank(message = "Content is required") String content,
            @RequestParam(value = "files", required = false) org.springframework.web.multipart.MultipartFile[] files,
            @RequestParam(value = "existingMediaUrls", required = false) String[] existingMediaUrls,
            @AuthenticationPrincipal AppUserDetails auth) {

        User loggedUser = auth.getUser();
        PostDTO postDTO = new PostDTO();
        postDTO.setTitle(title);
        postDTO.setContent(content);

        // Keep existing media
        if (existingMediaUrls != null) {
            for (String url : existingMediaUrls) {
                com.zone01.backend.dto.PostMediaDTO mediaDTO = new com.zone01.backend.dto.PostMediaDTO();
                mediaDTO.setMediaUrl(url);
                postDTO.getMedia().add(mediaDTO);
            }
        }

        // Add new media
        if (files != null && files.length > 0) {
            for (org.springframework.web.multipart.MultipartFile file : files) {
                if (!file.isEmpty()) {
                    if (!fileStorageService.isValidMediaType(file, "image/", "video/")) {
                        throw new RuntimeException("Only images and videos are allowed: " + file.getOriginalFilename());
                    }
                    String fileName = fileStorageService.storeFile(file);
                    com.zone01.backend.dto.PostMediaDTO mediaDTO = new com.zone01.backend.dto.PostMediaDTO();
                    mediaDTO.setMediaUrl("http://localhost:8080/uploads/" + fileName);
                    postDTO.getMedia().add(mediaDTO);
                }
            }
        }

        return ResponseEntity.ok(new PostDTO(postService.updatePost(postId, loggedUser, postDTO)));
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{postId}")
    public ResponseEntity<PostDTO> deletePost(
            @PathVariable long postId,
            @AuthenticationPrincipal AppUserDetails auth) {
        User loggedUser = auth.getUser();
        postService.deletePost(postId, loggedUser);
        return ResponseEntity.noContent().build();
    }

}
