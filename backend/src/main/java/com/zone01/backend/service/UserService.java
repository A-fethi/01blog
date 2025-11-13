package com.zone01.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.zone01.backend.dto.RegisterDTO;
import com.zone01.backend.entity.User;
import com.zone01.backend.exception.EmailAlreadyExistsException;
import com.zone01.backend.exception.InvalidCredentialsException;
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
            throw new WeakPasswordException("Password must be at least 8 characters, include uppercase, lowercase, and a number");
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
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(java.time.LocalDateTime.now());

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
}
