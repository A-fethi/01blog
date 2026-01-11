package com.zone01.backend.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.zone01.backend.entity.User;
import com.zone01.backend.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // Try to find by UUID first
        if (identifier.length() == 36 && identifier.contains("-")) {
            return userRepository.findByUuid(identifier)
                    .map(AppUserDetails::new)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with UUID: " + identifier));
        }

        // Fallback to username
        User user = userRepository.findByUsernameIgnoreCase(identifier)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + identifier));

        return new AppUserDetails(user);
    }
}
