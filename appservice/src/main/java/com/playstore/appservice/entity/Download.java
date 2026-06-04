package com.playstore.appservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "downloads", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"app_id", "user_email"})
})
public class Download {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_id")
    private App app;

    @Column(name = "user_email")
    private String userEmail;

    private LocalDateTime downloadedAt;

    private String installedVersion;

    public Download() {
    }

    public Download(App app, String userEmail, LocalDateTime downloadedAt) {
        this.app = app;
        this.userEmail = userEmail;
        this.downloadedAt = downloadedAt;
    }

    public Download(App app, String userEmail, LocalDateTime downloadedAt, String installedVersion) {
        this.app = app;
        this.userEmail = userEmail;
        this.downloadedAt = downloadedAt;
        this.installedVersion = installedVersion;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public App getApp() {
        return app;
    }

    public void setApp(App app) {
        this.app = app;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public LocalDateTime getDownloadedAt() {
        return downloadedAt;
    }

    public void setDownloadedAt(LocalDateTime downloadedAt) {
        this.downloadedAt = downloadedAt;
    }

    public String getInstalledVersion() {
        return installedVersion;
    }

    public void setInstalledVersion(String installedVersion) {
        this.installedVersion = installedVersion;
    }
}
