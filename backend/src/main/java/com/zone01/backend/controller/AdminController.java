package com.zone01.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zone01.backend.dto.ReportDTO;
import com.zone01.backend.dto.UserDTO;
import com.zone01.backend.entity.Post;
import com.zone01.backend.entity.Role;
import com.zone01.backend.entity.User;
import com.zone01.backend.security.AppUserDetails;
import com.zone01.backend.service.PostService;
import com.zone01.backend.service.ReportService;
import com.zone01.backend.service.UserService;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final PostService postService;
    private final ReportService reportService;

    public AdminController(UserService userService, PostService postService, ReportService reportService) {
        this.userService = userService;
        this.postService = postService;
        this.reportService = reportService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers(
            @AuthenticationPrincipal AppUserDetails auth) {
        if (auth == null || auth.getUser().getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<User> users = userService.getAllUsers();
        List<UserDTO> userDTOs = users.stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(userDTOs);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            @AuthenticationPrincipal AppUserDetails auth) {
        if (auth == null || auth.getUser().getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userService.getAllUsers().size();
        stats.put("totalUsers", totalUsers);
        stats.put("regularUsers", Math.max(totalUsers - 1L, 0L));

        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal AppUserDetails auth) {
        if (auth == null || auth.getUser().getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (auth.getUser().getId().equals(userId)) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "You cannot delete yourself");
            return ResponseEntity.badRequest().body(error);
        }

        if (!userService.findById(userId).isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not found");
            return ResponseEntity.badRequest().body(error);
        }

        userService.deleteUser(userId);
        Map<String, String> success = new HashMap<>();
        success.put("success", "User deleted successfully");
        return ResponseEntity.ok(success);
    }

    @PostMapping("/users/{userId}/ban")
    public ResponseEntity<UserDTO> banUser(@PathVariable Long userId) {
        User user = userService.banUser(userId);
        return ResponseEntity.ok(new UserDTO(user));
    }

    @PostMapping("/users/{userId}/unban")
    public ResponseEntity<UserDTO> unbanUser(@PathVariable Long userId) {
        User user = userService.unbanUser(userId);
        return ResponseEntity.ok(new UserDTO(user));
    }

    @GetMapping("/posts")
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Map<String, String>> deletePost(@PathVariable Long postId) {
        postService.deletePostAsAdmin(postId);
        return ResponseEntity.ok(Map.of("success", "Post removed"));
    }

    @GetMapping("/reports")
    public ResponseEntity<List<ReportDTO>> getReports() {
        List<ReportDTO> reports = reportService.getAllReports()
                .stream()
                .map(ReportDTO::new)
                .toList();
        return ResponseEntity.ok(reports);
    }
}
