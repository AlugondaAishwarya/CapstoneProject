package com.playstore.appservice.controller;

import com.playstore.appservice.dto.AppRequestDto;
import com.playstore.appservice.entity.App;
import com.playstore.appservice.service.AppService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/apps")
public class AppController {

    @Autowired
    private AppService appService;

    @PostMapping
    public App saveApp(@Valid @RequestBody AppRequestDto dto) {
        App app = new App();
        app.setAppName(dto.getAppName());
        app.setCategory(dto.getCategory());
        app.setDeveloperName(dto.getDeveloperName());
        app.setDescription(dto.getDescription());
        app.setVersion(dto.getVersion() != null ? dto.getVersion() : "1.0.0");
        app.setReleaseDate(dto.getReleaseDate() != null ? dto.getReleaseDate() : "2026-06-03");
        app.setIconUrl(dto.getIconUrl());
        app.setScreenshotUrl(dto.getScreenshotUrl());
        app.setRating(dto.getRating() != null ? dto.getRating() : 0.0);
        app.setDownloads(dto.getDownloads() != null ? dto.getDownloads() : 0L);
        app.setVisible(true);
        app.setStorageSize(dto.getStorageSize() != null ? dto.getStorageSize() : "100 MB");

        return appService.saveApp(app);
    }

    @PutMapping("/{id}")
    public App updateApp(@PathVariable Long id, @Valid @RequestBody AppRequestDto dto) {
        App appDetails = new App();
        appDetails.setAppName(dto.getAppName());
        appDetails.setCategory(dto.getCategory());
        appDetails.setDeveloperName(dto.getDeveloperName());
        appDetails.setDescription(dto.getDescription());
        appDetails.setVersion(dto.getVersion());
        appDetails.setReleaseDate(dto.getReleaseDate());
        appDetails.setIconUrl(dto.getIconUrl());
        appDetails.setScreenshotUrl(dto.getScreenshotUrl());
        appDetails.setStorageSize(dto.getStorageSize() != null ? dto.getStorageSize() : "100 MB");

        return appService.updateApp(id, appDetails);
    }

    @DeleteMapping("/{id}")
    public String deleteApp(@PathVariable Long id) {
        appService.deleteApp(id);
        return "App deleted successfully";
    }

    @GetMapping
    public List<App> getAllApps(@RequestParam(required = false, defaultValue = "true") boolean onlyVisible) {
        return onlyVisible ? appService.getVisibleApps() : appService.getAllApps();
    }

    @GetMapping("/owner")
    public List<App> getAppsByDeveloper(@RequestParam String developerEmail) {
        return appService.getAppsByDeveloper(developerEmail);
    }

    @GetMapping("/{id}")
    public App getAppById(@PathVariable Long id) {
        return appService.getAppById(id);
    }

    @GetMapping("/search")
    public List<App> searchApps(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double rating,
            @RequestParam(required = false, defaultValue = "true") boolean onlyVisible
    ) {
        return appService.searchAndFilterApps(name, category, rating, onlyVisible);
    }

    @PutMapping("/{id}/visibility")
    public App toggleVisibility(@PathVariable Long id, @RequestParam boolean visible) {
        App app = appService.getAppById(id);
        app.setVisible(visible);
        return appService.saveApp(app);
    }

    @GetMapping("/installed/map")
    public Map<Long, String> getInstalledAppsMap(@RequestParam String userEmail) {
        return appService.getInstalledAppsMap(userEmail);
    }

    @GetMapping("/installed")
    public List<App> getInstalledApps(@RequestParam String userEmail) {
        return appService.getInstalledApps(userEmail);
    }

    @PostMapping("/{id}/download")
    public String downloadApp(@PathVariable Long id, @RequestParam String userEmail) {
        boolean firstTime = appService.downloadApp(id, userEmail);
        return firstTime ? "App downloaded successfully" : "App re-downloaded (count not incremented)";
    }

    @PostMapping("/{id}/uninstall")
    public String uninstallApp(@PathVariable Long id, @RequestParam String userEmail) {
        appService.uninstallApp(id, userEmail);
        return "App uninstalled successfully";
    }

    @PostMapping("/{id}/announce-update")
    public String announceUpdate(
            @PathVariable Long id,
            @RequestParam String version,
            @RequestParam String releaseDate,
            @RequestParam String description
    ) {
        appService.announceUpdate(id, version, releaseDate, description);
        return "Update announcement sent successfully to all users";
    }

    @PutMapping("/{id}/update-rating")
    public String updateRating(@PathVariable Long id, @RequestParam Double rating) {
        appService.updateRating(id, rating);
        return "Rating updated successfully";
    }
}
