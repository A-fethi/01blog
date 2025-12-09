package com.zone01.backend.dto;

import java.util.List;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class UserBlockDTO {
    UserDTO profile;
    List<PostDTO> posts;
    long subscriberCount;
    long subscriptionCount;
    boolean subscribedByViewer;
}
