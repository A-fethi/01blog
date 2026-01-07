package com.zone01.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zone01.backend.entity.Like;
import com.zone01.backend.entity.Post;
import com.zone01.backend.entity.User;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    Optional<Like> findByUserAndPost(User user, Post post);

    Optional<Like> findByUserIdAndPostId(Long userId, Long postId);

    boolean existsByUserAndPost(User user, Post post);

    boolean existsByUserIdAndPostId(Long userId, Long postId);

    List<Like> findByPost(Post post);

    List<Like> findByPostId(Long postId);

    List<Like> findByUser(User user);

    List<Like> findByUserId(Long userId);

    long countByPost(Post post);

    long countByPostId(Long postId);

    void deleteByUserAndPost(User user, Post post);

    void deleteByUserIdAndPostId(Long userId, Long postId);

    void deleteByPost(Post post);

    @org.springframework.data.jpa.repository.Query("SELECT l.post.id FROM Like l WHERE l.user = :user")
    java.util.Set<Long> findPostIdsLikedByUser(@org.springframework.data.repository.query.Param("user") User user);
}
