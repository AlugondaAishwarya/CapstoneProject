package com.playstore.reviewservice.controller;

import com.playstore.reviewservice.entity.Review;
import com.playstore.reviewservice.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public Review saveReview(@RequestBody Review review) {
        return reviewService.saveReview(review);
    }

    @GetMapping("/{appId}")
    public List<Review> getReviewsByApp(@PathVariable Long appId) {
        return reviewService.getReviewsByApp(appId);
    }

    @PostMapping("/apps")
    public List<Review> getReviewsByAppIds(@RequestBody List<Long> appIds) {
        return reviewService.getReviewsByAppIds(appIds);
    }
}
