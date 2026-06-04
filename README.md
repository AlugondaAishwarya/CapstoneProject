# Play Store Microservices Platform

## Project Overview

This project is a backend microservices-based Play Store platform developed using Spring Boot and Spring Cloud technologies. The system follows distributed architecture principles with independent services communicating through API Gateway and Eureka Service Discovery.

The platform supports:

* User registration and authentication
* JWT-based security
* App management
* Review management
* Inter-service communication using OpenFeign
* Dockerized deployment

---

# Microservices

## 1. USER-SERVICE

Handles:

* User registration
* Login authentication
* JWT token generation
* Password encryption using BCrypt

---

## 2. APP-SERVICE

Handles:

* App management
* App listing
* App-related APIs
* Communication with USER-SERVICE using Feign Client

---

## 3. REVIEW-SERVICE

Handles:

* Add reviews
* Fetch reviews by app
* Rating management

---

## 4. API-GATEWAY

Handles:

* Centralized routing
* API entry point
* Request forwarding

---

## 5. EUREKA-SERVER

Handles:

* Service discovery
* Dynamic microservice registration

---

# Technologies Used

* Java 17
* Spring Boot
* Spring Cloud
* Spring Security
* JWT Authentication
* BCrypt
* Spring Data JPA
* H2 Database
* OpenFeign
* Eureka Discovery Server
* API Gateway
* Swagger/OpenAPI
* Docker
* Docker Compose
* Maven

---

# Features

* Microservices Architecture
* JWT Authentication
* Secure APIs
* API Gateway Routing
* Service Discovery
* Inter-Service Communication
* Swagger API Documentation
* Global Exception Handling
* DTO Validation
* Dockerized Deployment

---

# Architecture

Client
↓
API-GATEWAY
↓
-

↓                    ↓                      ↓
USER-SERVICE    APP-SERVICE        REVIEW-SERVICE

---

# Swagger URLs

## USER-SERVICE

http://localhost:8081/swagger-ui/index.html

## APP-SERVICE

http://localhost:8082/swagger-ui/index.html

## REVIEW-SERVICE

http://localhost:8083/swagger-ui/index.html

---

# Docker Run Instructions

## Step 1

Build all projects using Maven:

clean package

---

## Step 2

Build Docker images for all services.

---

## Step 3

Run Docker Compose:

docker-compose up

---

# Author

Aishwarya
