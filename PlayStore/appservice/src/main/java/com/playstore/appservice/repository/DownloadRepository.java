package com.playstore.appservice.repository;

import com.playstore.appservice.entity.Download;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DownloadRepository extends JpaRepository<Download, Long> {

    boolean existsByAppIdAndUserEmail(Long appId, String userEmail);

    void deleteByAppIdAndUserEmail(Long appId, String userEmail);

    List<Download> findByAppId(Long appId);

    List<Download> findByUserEmail(String userEmail);

    Optional<Download> findByAppIdAndUserEmail(Long appId, String userEmail);
}
