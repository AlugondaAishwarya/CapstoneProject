package com.playstore.notificationservice.controller;

import com.playstore.notificationservice.dto.NotificationRequest;
import com.playstore.notificationservice.entity.Notification;
import com.playstore.notificationservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/send")
    public Notification sendNotification(@RequestBody NotificationRequest request) {
        return notificationService.sendNotification(
                request.getRecipientEmail(),
                request.getMessage(),
                request.getType()
        );
    }

    @GetMapping
    public List<Notification> getNotifications(@RequestParam String email) {
        return notificationService.getNotificationsForUser(email);
    }

    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id) {
        return notificationService.markAsRead(id);
    }
}
