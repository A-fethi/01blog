package com.zone01.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zone01.backend.dto.LikeDTO;
import com.zone01.backend.entity.Like;
import com.zone01.backend.entity.User;
import com.zone01.backend.service.LikeService;
import com.zone01.backend.service.UserService;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

    private final LikeService likeService;
    private final UserService userService;

    public LikeController(LikeService likeService, UserService userService) {
        this.likeService = likeService;
        this.userService = userService;
    }

    @PostMapping("/post/{postId}")
    public ResponseEntity<LikeDTO> likePost(@PathVariable Long postId) {
        User currentUser = getCurrentUser();
        Like like = likeService.likePost(postId, currentUser);
        LikeDTO likeDTO = new LikeDTO(like);

        return ResponseEntity.status(HttpStatus.CREATED).body(likeDTO);
    }

    @DeleteMapping("/post/{postId}")
    public ResponseEntity<Map<String, String>> unlikePost(@PathVariable Long postId) {
        User currentUser = getCurrentUser();
        likeService.unlikePost(postId, currentUser);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Post unliked successfully");

        return ResponseEntity.ok(response);
    }

    private User getCurrentUser() {
        return userService.findById(1L).orElseThrow();
    }
}
