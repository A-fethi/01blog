package com.zone01.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zone01.backend.entity.Comment;
import com.zone01.backend.entity.Post;
import com.zone01.backend.entity.User;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostOrderByCreatedAtAsc(Post post);

    List<Comment> findByPostIdOrderByCreatedAtAsc(Long postId);

    List<Comment> findByAuthor(User author);

    List<Comment> findByAuthorId(Long authorId);

    long countByPost(Post post);

    long countByPostId(Long postId);

    long countByAuthor(User author);

    void deleteByPost(Post post);
}
