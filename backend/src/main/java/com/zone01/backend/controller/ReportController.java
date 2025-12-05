package com.zone01.backend.controller;

import org.springframework.boot.autoconfigure.graphql.GraphQlProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zone01.backend.dto.ReportDTO;
import com.zone01.backend.entity.Report;
import com.zone01.backend.security.AppUserDetails;
import com.zone01.backend.service.ReportService;
import com.zone01.backend.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/users/{userId}")
    public ResponseEntity<ReportDTO> reportUser(
            @PathVariable Long userId,
            @Valid @RequestBody ReportDTO reportDTO,
            @AuthenticationPrincipal AppUserDetails auth) {
        if (auth == null || auth.getUser() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Report report = reportService.createReport(auth.getUser(), userId, reportDTO.getReason());
        return ResponseEntity.status(HttpStatus.CREATED).body(new ReportDTO(report));
    }
}
