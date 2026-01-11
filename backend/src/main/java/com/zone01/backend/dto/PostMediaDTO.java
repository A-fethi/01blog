package com.zone01.backend.dto;

import com.zone01.backend.entity.MediaType;
import com.zone01.backend.entity.PostMedia;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostMediaDTO {
    private Long id;
    private String mediaUrl;
    private MediaType mediaType;

    public PostMediaDTO(PostMedia media) {
        this.id = media.getId();
        this.mediaUrl = media.getMediaUrl();
        this.mediaType = media.getMediaType();
    }
}
