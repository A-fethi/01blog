package com.zone01.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zone01.backend.dto.UserDTO;
import com.zone01.backend.entity.User;
import com.zone01.backend.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    public UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserDTO> userDTOs = users.stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(userDTOs);
    }
}
