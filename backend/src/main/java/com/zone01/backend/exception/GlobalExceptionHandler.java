package com.zone01.backend.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, Object>> handleValidationErrors(
                        MethodArgumentNotValidException ex) {
                Map<String, Object> body = new HashMap<>();
                Map<String, String> errors = new HashMap<>();

                ex.getBindingResult().getAllErrors().forEach(error -> {
                        String fieldName = ((FieldError) error).getField();
                        String errorMessage = error.getDefaultMessage();
                        errors.put(fieldName, errorMessage);
                });

                body.put("timestamp", LocalDateTime.now());
                body.put("status", HttpStatus.BAD_REQUEST.value());
                body.put("error", "Validation Failed");
                body.put("message", "Invalid input data");
                body.put("errors", errors);

                return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(UserNotFoundException.class)
        public ResponseEntity<Map<String, Object>> handleUserNotFound(
                        UserNotFoundException ex,
                        WebRequest request) {
                Map<String, Object> body = createErrorBody(
                                HttpStatus.NOT_FOUND,
                                "Not Found",
                                ex.getMessage(),
                                request);
                return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(UsernameAlreadyExistsException.class)
        public ResponseEntity<Map<String, Object>> handleUsernameExists(
                        UsernameAlreadyExistsException ex,
                        WebRequest request) {
                Map<String, Object> body = createErrorBody(
                                HttpStatus.CONFLICT,
                                "Conflict",
                                ex.getMessage(),
                                request);
                return new ResponseEntity<>(body, HttpStatus.CONFLICT);
        }

        @ExceptionHandler(EmailAlreadyExistsException.class)
        public ResponseEntity<Map<String, Object>> handleEmailExists(
                        EmailAlreadyExistsException ex,
                        WebRequest request) {
                Map<String, Object> body = createErrorBody(
                                HttpStatus.CONFLICT,
                                "Conflict",
                                ex.getMessage(),
                                request);
                return new ResponseEntity<>(body, HttpStatus.CONFLICT);
        }

        @ExceptionHandler(WeakPasswordException.class)
        public ResponseEntity<Map<String, Object>> handleWeakPassword(
                        WeakPasswordException ex,
                        WebRequest request) {
                Map<String, Object> body = createErrorBody(
                                HttpStatus.BAD_REQUEST,
                                "Bad Request",
                                ex.getMessage(),
                                request);
                return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<Map<String, Object>> handleIllegalArgument(
                        IllegalArgumentException ex,
                        WebRequest request) {
                Map<String, Object> body = createErrorBody(
                                HttpStatus.BAD_REQUEST,
                                "Bad Request",
                                ex.getMessage(),
                                request);
                return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(InvalidCredentialsException.class)
        public ResponseEntity<Map<String, Object>> handleInvalidCredentials(
                        InvalidCredentialsException ex,
                        WebRequest request) {
                Map<String, Object> body = createErrorBody(
                                HttpStatus.UNAUTHORIZED,
                                "Unauthorized",
                                ex.getMessage(),
                                request);
                return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
        public ResponseEntity<Map<String, Object>> handleConstraintViolation(
                        jakarta.validation.ConstraintViolationException ex,
                        WebRequest request) {
                Map<String, String> errors = new HashMap<>();
                ex.getConstraintViolations().forEach(violation -> {
                        String propertyPath = violation.getPropertyPath().toString();
                        String fieldName = propertyPath.substring(propertyPath.lastIndexOf('.') + 1);
                        errors.put(fieldName, violation.getMessage());
                });

                Map<String, Object> body = createErrorBody(
                                HttpStatus.BAD_REQUEST,
                                "Validation Failed",
                                "Invalid input data",
                                request);
                body.put("errors", errors);
                return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
        public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(
                        org.springframework.dao.DataIntegrityViolationException ex,
                        WebRequest request) {
                String message = "Database error: Data integrity violation. This might be due to a field being too long or a duplicate value.";
                Map<String, Object> body = createErrorBody(
                                HttpStatus.BAD_REQUEST,
                                "Data Integrity Error",
                                message,
                                request);
                return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<Map<String, Object>> handleGlobalException(
                        Exception ex,
                        WebRequest request) {
                Map<String, Object> body = createErrorBody(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "Internal Server Error",
                                "An unexpected error occurred",
                                request);
                body.put("details", ex.getMessage());

                return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        @ExceptionHandler(PostNotFoundException.class)
        public ResponseEntity<Map<String, Object>> handlePostNotFound(
                        PostNotFoundException ex,
                        WebRequest request) {
                Map<String, Object> body = createErrorBody(
                                HttpStatus.NOT_FOUND,
                                "Not Found",
                                ex.getMessage(),
                                request);
                return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(CommentNotFoundException.class)
        public ResponseEntity<Map<String, Object>> handleCommentNotFound(
                        CommentNotFoundException ex,
                        WebRequest request) {
                Map<String, Object> body = createErrorBody(
                                HttpStatus.NOT_FOUND,
                                "Not Found",
                                ex.getMessage(),
                                request);
                return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(ReportNotFoundException.class)
        public ResponseEntity<Map<String, Object>> handleReportNotFound(
                        ReportNotFoundException ex,
                        WebRequest request) {
                Map<String, Object> body = createErrorBody(
                                HttpStatus.NOT_FOUND,
                                "Not Found",
                                ex.getMessage(),
                                request);
                return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(UnauthorizedActionException.class)
        public ResponseEntity<Map<String, Object>> handleUnauthorized(
                        UnauthorizedActionException ex,
                        WebRequest request) {
                Map<String, Object> body = createErrorBody(
                                HttpStatus.FORBIDDEN,
                                "Forbidden",
                                ex.getMessage(),
                                request);
                return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
        }

        @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
        public ResponseEntity<Map<String, Object>> handleAccessDenied(
                        org.springframework.security.access.AccessDeniedException ex,
                        WebRequest request) {
                Map<String, Object> body = createErrorBody(
                                HttpStatus.FORBIDDEN,
                                "Forbidden",
                                "You do not have permission to access this resource",
                                request);
                return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
        }

        private Map<String, Object> createErrorBody(
                        HttpStatus status,
                        String error,
                        String message,
                        WebRequest request) {
                Map<String, Object> body = new HashMap<>();
                body.put("timestamp", LocalDateTime.now());
                body.put("status", status.value());
                body.put("error", error);
                body.put("message", message);
                body.put("path", request.getDescription(false).replace("uri=", ""));
                return body;
        }
}
