package com.zone01.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zone01.backend.dto.CommentDTO;
import com.zone01.backend.entity.Comment;
import com.zone01.backend.entity.User;
import com.zone01.backend.service.CommentService;
import com.zone01.backend.service.UserService;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;

    public CommentController(CommentService commentService, UserService userService) {
        this.commentService = commentService;
        this.userService = userService;
    }

    @PostMapping("/post/{postId}")
    public ResponseEntity<CommentDTO> createComment(
            @PathVariable Long postId,
            @RequestBody CommentDTO commentDTO) {
        User currentUser = getCurrentUser();
        Comment newComment = commentService.createComment(currentUser, postId, commentDTO);
        return ResponseEntity.ok(new CommentDTO(newComment));
    }

    private User getCurrentUser() {
        return userService.findById(1L).orElseThrow();
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByPost(@PathVariable Long postId) {
        List<Comment> comments = commentService.getCommentsByPost(postId);
        List<CommentDTO> commentDTOs = comments.stream().map(CommentDTO::new).toList();

        return ResponseEntity.ok(commentDTOs);
    }
}
