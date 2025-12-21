package com.zone01.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.zone01.backend.dto.RegisterDTO;
import com.zone01.backend.entity.Role;
import com.zone01.backend.entity.User;
import com.zone01.backend.exception.EmailAlreadyExistsException;
import com.zone01.backend.exception.InvalidCredentialsException;
import com.zone01.backend.exception.UserNotFoundException;
import com.zone01.backend.exception.UsernameAlreadyExistsException;
import com.zone01.backend.exception.WeakPasswordException;
import com.zone01.backend.repository.UserRepository;
import com.zone01.backend.util.ValidationUtil;

import jakarta.transaction.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerUser(RegisterDTO registerDTO) {

        if (!ValidationUtil.isValidUsername(registerDTO.getUsername())) {
            throw new IllegalArgumentException("Invalid username. Must be 3-20 characters, letters, numbers, or _");
        }

        if (!ValidationUtil.isValidEmail(registerDTO.getEmail())) {
            throw new IllegalArgumentException("Invalid email format");
        }

        if (!ValidationUtil.isStrongPassword(registerDTO.getPassword())) {
            throw new WeakPasswordException(
                    "Password must be at least 8 characters, include uppercase, lowercase, and a number");
        }

        if (userRepository.existsByUsername(registerDTO.getUsername())) {
            throw new UsernameAlreadyExistsException(registerDTO.getUsername());
        }

        if (userRepository.existsByEmail(registerDTO.getEmail())) {
            throw new EmailAlreadyExistsException(registerDTO.getEmail());
        }

        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setEmail(registerDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setAvatarUrl(registerDTO.getAvatarUrl());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        long userCount = userRepository.count();
        if (userCount == 0) {
            user.setRole(Role.ADMIN);
        } else {
            user.setRole(Role.USER);
        }
        User savedUser = userRepository.save(user);
        return savedUser;
    }

    public User loginUser(String username, String password) {
        if (!ValidationUtil.isNotEmpty(username) || !ValidationUtil.isNotEmpty(password)) {
            throw new InvalidCredentialsException();
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException());

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        return user;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User requireById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    public User requireByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public User updateProfile(Long userId, String username, String email, String avatarUrl) {
        User user = requireById(userId);

        if (username != null && !username.equals(user.getUsername())) {
            if (userRepository.existsByUsername(username)) {
                throw new UsernameAlreadyExistsException(username);
            }
            user.setUsername(username);
        }

        if (email != null && !email.equals(user.getEmail())) {
            if (userRepository.existsByEmail(email)) {
                throw new EmailAlreadyExistsException(email);
            }
            user.setEmail(email);
        }

        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }

        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Transactional
    public User banUser(Long userId) {
        User user = requireById(userId);
        user.setBanned(true);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Transactional
    public User unbanUser(Long userId) {
        User user = requireById(userId);
        user.setBanned(false);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
}
