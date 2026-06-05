package com.playstore.notificationservice.service;

import com.playstore.notificationservice.entity.Notification;
import com.playstore.notificationservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification sendNotification(String recipientEmail, String message, String type) {
        Notification notification = new Notification(recipientEmail, message, type);
        Notification saved = notificationRepository.save(notification);

        // Simulate sending email
        System.out.println("======================================================================");
        System.out.println("[EMAIL SIMULATION SERVICE] Dispatching email...");
        System.out.println("To:      " + recipientEmail);
        System.out.println("Subject: " + (type.equals("DOWNLOAD") ? "App Download Alert" : "App Update announcement"));
        System.out.println("Content: " + message);
        System.out.println("======================================================================");

        return saved;
    }

    public List<Notification> getNotificationsForUser(String email) {
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + id));
        notification.setReadStatus(true);
        return notificationRepository.save(notification);
    }
}
