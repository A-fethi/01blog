package com.zone01.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zone01.backend.entity.Report;
import com.zone01.backend.entity.ReportStatus;
import com.zone01.backend.entity.User;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findAllByOrderByCreatedAtDesc();
    List<Report> findByStatusOrderByCreatedAtAsc(ReportStatus status);
    List<Report> findByReportedUser(User reportedUser);
}