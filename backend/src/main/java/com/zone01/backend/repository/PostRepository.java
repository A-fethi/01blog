package com.zone01.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zone01.backend.entity.Post;
import com.zone01.backend.entity.User;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByAuthor(User author);

    List<Post> findByAuthorId(Long authorId);

    List<Post> findByTitleContainingIgnoreCase(String keyword);

    List<Post> findAllByOrderByCreatedAtDesc();

    List<Post> findByAuthorOrderByCreatedAtDesc(User author);

    long countByAuthor(User author);

    long countByAuthorId(Long authorId);

    List<Post> findByAuthorUsernameOrderByCreatedAtDesc(String username);

    List<Post> findByAuthorIdInOrderByCreatedAtDesc(List<Long> authorIds);
}
