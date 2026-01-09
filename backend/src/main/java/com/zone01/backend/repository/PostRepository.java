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

        @org.springframework.data.jpa.repository.Query("SELECT p FROM Post p JOIN FETCH p.author WHERE p.hidden = false ORDER BY p.createdAt DESC")
        List<Post> findAllVisibleByOrderByCreatedAtDesc();

        @org.springframework.data.jpa.repository.Query("SELECT p FROM Post p JOIN FETCH p.author ORDER BY p.createdAt DESC")
        List<Post> findAllByOrderByCreatedAtDesc();

        List<Post> findByAuthorOrderByCreatedAtDesc(User author);

        long countByAuthor(User author);

        long countByAuthorId(Long authorId);

        @org.springframework.data.jpa.repository.Query("SELECT p FROM Post p JOIN FETCH p.author WHERE LOWER(p.author.username) = LOWER(:username) AND p.hidden = false ORDER BY p.createdAt DESC")
        List<Post> findVisibleByAuthorUsernameOrderByCreatedAtDesc(
                        @org.springframework.data.repository.query.Param("username") String username);

        @org.springframework.data.jpa.repository.Query("SELECT p FROM Post p JOIN FETCH p.author WHERE p.author.id IN :authorIds AND p.hidden = false ORDER BY p.createdAt DESC")
        List<Post> findVisibleByAuthorIdInOrderByCreatedAtDesc(
                        @org.springframework.data.repository.query.Param("authorIds") List<Long> authorIds);
}
