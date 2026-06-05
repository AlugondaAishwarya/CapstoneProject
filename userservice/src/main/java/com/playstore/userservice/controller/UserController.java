package com.playstore.userservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.playstore.userservice.dto.UserRequestDto;
import com.playstore.userservice.entity.User;
import com.playstore.userservice.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User registerUser(@Valid @RequestBody UserRequestDto dto) {

        User user = new User();

        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setRole(dto.getRole() != null ? dto.getRole() : "USER");

        return userService.registerUser(user);
    }
    
    @GetMapping("/test")
    public String test() {

        return "Protected API Working";
    }
}