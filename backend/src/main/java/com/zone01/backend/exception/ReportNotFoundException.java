package com.zone01.backend.exception;

public class ReportNotFoundException extends RuntimeException {
    public ReportNotFoundException(Long id) {
        super("Report not found with id: " + id);
    }
}
