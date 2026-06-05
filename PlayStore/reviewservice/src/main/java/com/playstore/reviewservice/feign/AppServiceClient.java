package com.playstore.reviewservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "APP-SERVICE")
public interface AppServiceClient {

    @PutMapping("/apps/{id}/update-rating")
    String updateRating(@PathVariable("id") Long id, @RequestParam("rating") Double rating);
}
