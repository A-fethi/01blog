package com.zone01.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LogoutController {

    @GetMapping("/logout")
    public String logoutPage() {
        return "Logout page endpoint";
    }

    @PostMapping("/logout")
    public String logout() {
        return "User logged out successfully";
    }
}
