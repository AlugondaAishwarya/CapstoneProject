package com.playstore.appservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "USER-SERVICE")
public interface UserServiceClient {

    @GetMapping("/users/test")
    String testUserService();
}
