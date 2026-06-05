package com.playstore.appservice.service;

import com.playstore.appservice.entity.App;
import com.playstore.appservice.entity.Download;
import com.playstore.appservice.repository.AppRepository;
import com.playstore.appservice.repository.DownloadRepository;
import com.playstore.appservice.feign.NotificationServiceClient;
import com.playstore.appservice.dto.NotificationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@org.springframework.transaction.annotation.Transactional
public class AppService {

    private static final String ADMIN_NOTIFICATION_EMAIL = "developer@gmail.com";

    @Autowired
    private AppRepository appRepository;

    @Autowired
    private DownloadRepository downloadRepository;

    @Autowired
    private NotificationServiceClient notificationServiceClient;

    @Value("${notification.service.url:http://localhost:8084}")
    private String notificationServiceUrl;

    private final RestTemplate notificationRestTemplate = new RestTemplate();

    public App saveApp(App app) {
        if (app.getDownloads() == null) {
            app.setDownloads(0L);
        }
        if (app.getRating() == null) {
            app.setRating(0.0);
        }
        return appRepository.save(app);
    }

    public App getAppById(Long id) {
        return appRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("App not found with ID: " + id));
    }

    public App updateApp(Long id, App details) {
        App app = getAppById(id);
        app.setAppName(details.getAppName());
        app.setDescription(details.getDescription());
        app.setCategory(details.getCategory());
        app.setVersion(details.getVersion());
        app.setReleaseDate(details.getReleaseDate());
        app.setIconUrl(details.getIconUrl());
        app.setScreenshotUrl(details.getScreenshotUrl());
        app.setStorageSize(details.getStorageSize());
        return appRepository.save(app);
    }

    public void deleteApp(Long id) {
        App app = getAppById(id);
        appRepository.delete(app);
    }

    public List<App> getAllApps() {
        return appRepository.findAll();
    }

    public List<App> getVisibleApps() {
        return appRepository.findByVisibleTrue();
    }

    public List<App> getAppsByDeveloper(String developerEmail) {
        return appRepository.findByDeveloperName(developerEmail);
    }

    public List<App> searchAndFilterApps(String name, String category, Double minRating, boolean onlyVisible) {
        List<App> apps;
        if (name != null && !name.trim().isEmpty()) {
            apps = onlyVisible ? 
                appRepository.findByAppNameContainingIgnoreCaseAndVisibleTrue(name) :
                appRepository.findByAppNameContainingIgnoreCase(name);
        } else if (category != null && !category.trim().isEmpty()) {
            apps = onlyVisible ?
                appRepository.findByCategoryIgnoreCaseAndVisibleTrue(category) :
                appRepository.findByCategoryIgnoreCase(category);
        } else if (minRating != null) {
            apps = onlyVisible ?
                appRepository.findByRatingGreaterThanEqualAndVisibleTrue(minRating) :
                appRepository.findByRatingGreaterThanEqual(minRating);
        } else {
            apps = onlyVisible ? appRepository.findByVisibleTrue() : appRepository.findAll();
        }

        // Apply secondary filters in-memory to support multiple active criteria
        return apps.stream()
                .filter(app -> {
                    if (name != null && !name.trim().isEmpty() && !app.getAppName().toLowerCase().contains(name.toLowerCase())) {
                        return false;
                    }
                    if (category != null && !category.trim().isEmpty() && !app.getCategory().equalsIgnoreCase(category)) {
                        return false;
                    }
                    if (minRating != null && app.getRating() < minRating) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    public boolean downloadApp(Long appId, String userEmail) {
        App app = getAppById(appId);
        if (!app.isVisible() && (app.getDeveloperName() == null || !app.getDeveloperName().equalsIgnoreCase(userEmail))) {
            throw new RuntimeException("This app is currently hidden by the developer");
        }

        java.util.Optional<Download> existingDownload = downloadRepository.findByAppIdAndUserEmail(appId, userEmail);

        if (existingDownload.isPresent()) {
            // Already downloaded, this is an update!
            Download download = existingDownload.get();
            download.setInstalledVersion(app.getVersion());
            downloadRepository.save(download);
            sendNotificationSafely(new NotificationRequest(
                    ADMIN_NOTIFICATION_EMAIL,
                    "Admin alert: '" + app.getAppName() + "' was downloaded again by " + userEmail + ".",
                    "DOWNLOAD"
            ));
            return false;
        }

        // Increment count and save download log
        app.setDownloads(app.getDownloads() + 1);
        appRepository.save(app);

        Download download = new Download(app, userEmail, LocalDateTime.now(), app.getVersion());
        downloadRepository.save(download);

        sendNotificationSafely(new NotificationRequest(
                ADMIN_NOTIFICATION_EMAIL,
                "Admin alert: '" + app.getAppName() + "' was installed by " + userEmail + ".",
                "DOWNLOAD"
        ));

        return true;
    }

    public java.util.Map<Long, String> getInstalledAppsMap(String userEmail) {
        List<Download> downloads = downloadRepository.findByUserEmail(userEmail);
        return downloads.stream().collect(Collectors.toMap(
                d -> d.getApp().getId(),
                d -> d.getInstalledVersion() != null ? d.getInstalledVersion() : d.getApp().getVersion()
        ));
    }

    public List<App> getInstalledApps(String userEmail) {
        return downloadRepository.findByUserEmail(userEmail).stream()
                .map(Download::getApp)
                .collect(Collectors.toList());
    }

    public void announceUpdate(Long appId, String newVersion, String releaseDate, String description) {
        App app = getAppById(appId);
        app.setVersion(newVersion);
        app.setReleaseDate(releaseDate);
        appRepository.save(app);

        List<Download> downloads = downloadRepository.findByAppId(appId);
        for (Download download : downloads) {
            sendNotificationSafely(new NotificationRequest(
                    download.getUserEmail(),
                    "App Update: '" + app.getAppName() + "' has released version " + newVersion + ". What's new: " + description,
                    "UPDATE"
            ));
        }
    }

    private void sendNotificationSafely(NotificationRequest request) {
        try {
            notificationServiceClient.sendNotification(request);
            return;
        } catch (Exception feignError) {
            System.err.println("Feign notification failed, trying direct notification service URL: " + feignError.getMessage());
        }

        try {
            String baseUrl = notificationServiceUrl.endsWith("/")
                    ? notificationServiceUrl.substring(0, notificationServiceUrl.length() - 1)
                    : notificationServiceUrl;
            ResponseEntity<String> response = notificationRestTemplate.postForEntity(
                    baseUrl + "/notifications/send",
                    request,
                    String.class
            );
            if (!response.getStatusCode().is2xxSuccessful()) {
                System.err.println("Direct notification request failed with status: " + response.getStatusCode());
            }
        } catch (Exception restError) {
            System.err.println("Failed to send notification directly: " + restError.getMessage());
        }
    }

    public void updateRating(Long appId, Double newRating) {
        App app = getAppById(appId);
        app.setRating(newRating);
        appRepository.save(app);
    }

    @org.springframework.transaction.annotation.Transactional
    public void uninstallApp(Long appId, String userEmail) {
        downloadRepository.deleteByAppIdAndUserEmail(appId, userEmail);
    }
}
