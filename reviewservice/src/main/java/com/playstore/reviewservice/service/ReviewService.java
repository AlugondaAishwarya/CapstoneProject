package com.playstore.reviewservice.service;

import com.playstore.reviewservice.entity.Review;
import com.playstore.reviewservice.repository.ReviewRepository;
import com.playstore.reviewservice.feign.AppServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private AppServiceClient appServiceClient;

    public Review saveReview(Review review) {
        Review saved = reviewRepository.save(review);
        updateAppAverageRating(review.getAppId());
        return saved;
    }

    public List<Review> getReviewsByApp(Long appId) {
        return reviewRepository.findByAppId(appId);
    }

    public List<Review> getReviewsByAppIds(List<Long> appIds) {
        return reviewRepository.findByAppIdIn(appIds);
    }

    private void updateAppAverageRating(Long appId) {
        List<Review> reviews = reviewRepository.findByAppId(appId);
        if (reviews.isEmpty()) {
            return;
        }
        double sum = 0;
        for (Review r : reviews) {
            sum += r.getRating();
        }
        double avg = sum / reviews.size();
        // Round to 1 decimal place
        avg = Math.round(avg * 10.0) / 10.0;

        try {
            appServiceClient.updateRating(appId, avg);
        } catch (Exception e) {
            System.err.println("Failed to update average rating in APP-SERVICE via Feign: " + e.getMessage());
        }
    }
}