package com.zone01.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.zone01.backend.entity.Post;
import com.zone01.backend.entity.Report;
import com.zone01.backend.entity.ReportStatus;
import com.zone01.backend.entity.User;
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

    public ReportService(ReportRepository reportRepository, UserRepository userRepository,
            PostRepository postRepository) {
        this.reportRepository = reportRepository;
        this.UserRepository = userRepository;
        this.postRepository = postRepository;
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

        Report report = new Report(reporter, reported, reason.strip());
        return reportRepository.save(report);
    }

    @Transactional
    public Report createPostReport(User reporter, Long postId, String reason) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        if (post.getAuthor().getId().equals(reporter.getId())) {
            throw new IllegalArgumentException("You cannot report your own post");
        }

        if (reason == null || reason.strip().isEmpty()) {
            throw new IllegalArgumentException("Reason is required");
        }

        Report report = new Report(reporter, post, reason.strip());
        return reportRepository.save(report);
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
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        report.setStatus(status);
        if (status == ReportStatus.RESOLVED || status == ReportStatus.REJECTED) {
            report.setResolvedAt(LocalDateTime.now());
        } else {
            report.setResolvedAt(null);
        }
        return reportRepository.save(report);
    }
}