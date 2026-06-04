package com.playstore.appservice.repository;

import com.playstore.appservice.entity.App;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppRepository extends JpaRepository<App, Long> {

    List<App> findByAppNameContainingIgnoreCase(String name);

    List<App> findByAppNameContainingIgnoreCaseAndVisibleTrue(String name);

    List<App> findByCategoryIgnoreCase(String category);

    List<App> findByCategoryIgnoreCaseAndVisibleTrue(String category);

    List<App> findByRatingGreaterThanEqual(Double rating);

    List<App> findByRatingGreaterThanEqualAndVisibleTrue(Double rating);

    List<App> findByVisibleTrue();

    List<App> findByDeveloperName(String developerName);
}
