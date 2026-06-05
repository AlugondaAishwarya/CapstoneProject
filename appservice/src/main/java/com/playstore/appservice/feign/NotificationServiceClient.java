package com.playstore.appservice.feign;

import com.playstore.appservice.dto.NotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "NOTIFICATION-SERVICE")
public interface NotificationServiceClient {

    @PostMapping("/notifications/send")
    void sendNotification(@RequestBody NotificationRequest request);
}
