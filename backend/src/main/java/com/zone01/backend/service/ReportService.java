package com.zone01.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.zone01.backend.entity.Post;
import com.zone01.backend.entity.Report;
import com.zone01.backend.entity.ReportStatus;
import com.zone01.backend.entity.User;
import com.zone01.backend.exception.PostNotFoundException;
import com.zone01.backend.exception.ReportNotFoundException;
import com.zone01.backend.exception.UserNotFoundException;
import com.zone01.backend.repository.PostRepository;
import com.zone01.backend.repository.ReportRepository;
import com.zone01.backend.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class ReportService {
    private final ReportRepository reportRepository;
    private final UserRepository UserRepository;
    private final PostRepository postRepository;
    private final NotificationService notificationService;
    private final UserService userService;

    public ReportService(ReportRepository reportRepository, UserRepository userRepository,
            PostRepository postRepository, NotificationService notificationService, UserService userService) {
        this.reportRepository = reportRepository;
        this.UserRepository = userRepository;
        this.postRepository = postRepository;
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @Transactional
    public Report createReport(User reporter, Long reportedUserId, String reason) {
        if (reporter.getId().equals(reportedUserId)) {
            throw new IllegalArgumentException("You cannot report yourself");
        }

        User reported = UserRepository.findById(reportedUserId)
                .orElseThrow(() -> new UserNotFoundException(reportedUserId));

        if (reason == null || reason.strip().isEmpty()) {
            throw new IllegalArgumentException("Reason is required");
        }

        if (reason.length() > 200) {
            throw new IllegalArgumentException("Reason cannot exceed 200 characters");
        }

        Report report = new Report(reporter, reported, reason.strip());
        Report savedReport = reportRepository.save(report);
        notificationService.createReportNotification(reporter, reportedUserId, "profile", userService.getAllAdmins());
        return savedReport;
    }

    @Transactional
    public Report createPostReport(User reporter, Long postId, String reason) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));

        if (post.getAuthor().getId().equals(reporter.getId())) {
            throw new IllegalArgumentException("You cannot report your own post");
        }

        if (reason == null || reason.strip().isEmpty()) {
            throw new IllegalArgumentException("Reason is required");
        }

        if (reason.length() > 200) {
            throw new IllegalArgumentException("Reason cannot exceed 200 characters");
        }

        Report report = new Report(reporter, post, reason.strip());
        Report savedReport = reportRepository.save(report);
        notificationService.createReportNotification(reporter, postId, "post", userService.getAllAdmins());
        return savedReport;
    }

    public List<Report> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc();
    }

    public long countAllReports() {
        return reportRepository.count();
    }

    public List<Report> getReportsByStatus(ReportStatus status) {
        return reportRepository.findByStatusOrderByCreatedAtAsc(status);
    }

    @Transactional
    public Report updateStatus(Long reportId, ReportStatus status) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ReportNotFoundException(reportId));
        report.setStatus(status);
        if (status == ReportStatus.RESOLVED || status == ReportStatus.REJECTED) {
            report.setResolvedAt(LocalDateTime.now());
        } else {
            report.setResolvedAt(null);
        }
        return reportRepository.save(report);
    }
}