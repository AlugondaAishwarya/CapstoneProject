package com.playstore.appservice.dto;

public class NotificationRequest {

    private String recipientEmail;
    private String message;
    private String type;

    public NotificationRequest() {
    }

    public NotificationRequest(String recipientEmail, String message, String type) {
        this.recipientEmail = recipientEmail;
        this.message = message;
        this.type = type;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
