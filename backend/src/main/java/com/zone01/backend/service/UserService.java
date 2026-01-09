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

        String username = registerDTO.getUsername().toLowerCase();
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new UsernameAlreadyExistsException(username);
        }

        String email = registerDTO.getEmail().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyExistsException(email);
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
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
        User user = userRepository.findByUsernameIgnoreCase(username)
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
        return userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new UserNotFoundException(username));
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsernameIgnoreCase(username);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email != null ? email.toLowerCase() : null);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsernameIgnoreCase(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmailIgnoreCase(email != null ? email.toLowerCase() : null);
    }

    @Transactional
    public User updateProfile(Long userId, String username, String email, String avatarUrl) {
        User user = requireById(userId);

        if (username != null) {
            String lowerUsername = username.toLowerCase();
            if (!lowerUsername.equals(user.getUsername())) {
                if (userRepository.existsByUsernameIgnoreCase(lowerUsername)) {
                    throw new UsernameAlreadyExistsException(lowerUsername);
                }
                user.setUsername(lowerUsername);
            }
        }

        if (email != null) {
            String lowerEmail = email.toLowerCase();
            if (!lowerEmail.equals(user.getEmail())) {
                if (userRepository.existsByEmailIgnoreCase(lowerEmail)) {
                    throw new EmailAlreadyExistsException(lowerEmail);
                }
                user.setEmail(lowerEmail);
            }
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

    public List<User> getAllAdmins() {
        return userRepository.findByRole(Role.ADMIN);
    }
}
