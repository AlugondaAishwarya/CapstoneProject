package com.playstore.reviewservice.repository;

import com.playstore.reviewservice.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByAppId(Long appId);

    List<Review> findByAppIdIn(List<Long> appIds);
}
