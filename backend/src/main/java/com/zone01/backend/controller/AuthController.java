package com.zone01.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zone01.backend.dto.RegisterDTO;
import com.zone01.backend.dto.UserDTO;
import com.zone01.backend.entity.User;
import com.zone01.backend.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/register")
    public ResponseEntity<Map<String, String>> registerInfo() {
        Map<String, String> info = new HashMap<>();
        info.put("message", "Send POST request to register");
        info.put("method", "POST");
        info.put("endpoint", "/api/auth/register");
        
        return ResponseEntity.ok(info);
    }

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@Valid @RequestBody RegisterDTO registerDTO) {
        User user = userService.registerUser(registerDTO);
        UserDTO userDTO = new UserDTO(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(userDTO);
    }

    @GetMapping("/login")
    public ResponseEntity<Map<String, String>> loginInfo() {
        Map<String, String> info = new HashMap<>();
        info.put("message", "Send POST request to login");
        info.put("method", "POST");
        info.put("endpoint", "/api/auth/login");
        
        return ResponseEntity.ok(info);
    }

    @PostMapping("/login")
    public ResponseEntity<UserDTO> login() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = auth.getName();
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDTO userDTO = new UserDTO(user);
        return ResponseEntity.ok(userDTO);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout successful");
        
        return ResponseEntity.ok(response);
    }
}
