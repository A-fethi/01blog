package com.zone01.backend.dto;

import java.time.LocalDateTime;

import com.zone01.backend.entity.Report;
import com.zone01.backend.entity.ReportStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ReportDTO {
    private Long id;
    private Long reportedId;
    private Long reportedUserId;
    private Long reportedPostId;
    private String reportedUsername;
    private ReportStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    @NotBlank(message = "Reason is required")
    @Size(max = 200, message = "Reason cannot exceed 200 characters")
    private String reason;

    public ReportDTO(Report report) {
        this.id = report.getId();
        this.reportedId = report.getReporter().getId();
        this.reportedUserId = report.getReportedUser().getId();
        this.reportedUsername = report.getReportedUser().getUsername();
        if (report.getReportedPost() != null) {
            this.reportedPostId = report.getReportedPost().getId();
        }
        this.reason = report.getReason();
        this.status = report.getStatus();
        this.createdAt = report.getCreatedAt();
        this.resolvedAt = report.getResolvedAt();
    }
}