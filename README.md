
```md
# Play Store Microservices Platform

A full-stack Play Store web application built using React and Spring Boot microservices. The system supports user authentication, app browsing, admin app management, downloads, reviews, update announcements, and real-time-style notification badges.

## Project Overview

This project follows a microservices architecture with separate services for users, apps, reviews, notifications, service discovery, and API routing. The React frontend is built and served through the API Gateway, so the final application runs at:

http://localhost:9090

## Features

- User registration and login
- Admin login and dashboard
- JWT-based authentication
- Browse and search apps
- Install, update, and uninstall apps
- Admin app publishing and editing
- App visibility control
- Reviews and ratings
- Notification panel for users and admins
- Notification badges for unread notifications
- Admin receives notification when a user downloads an app
- User receives notification when admin announces a new app version
- Dockerized deployment with Docker Compose
- Eureka service discovery
- API Gateway routing

## Microservices

### 1. Eureka Server

Handles service discovery and service registration.

Port:

```txt
8761
```

URL:

```txt
http://localhost:8761
```

### 2. API Gateway

Main entry point for frontend and backend APIs.

Port:

```txt
9090
```

Main app URL:

```txt
http://localhost:9090
```

Routes requests to:

- User Service
- App Service
- Review Service
- Notification Service

### 3. User Service

Handles:

- User registration
- Login
- JWT token generation
- User roles
- Password security

Port:

```txt
8081
```

### 4. App Service

Handles:

- App listing
- App creation and update
- App visibility
- App downloads
- Installed apps
- Update announcements
- Sending notification events

Port:

```txt
8082
```

### 5. Review Service

Handles:

- Add reviews
- Fetch reviews by app
- Rating updates

Port:

```txt
8083
```

### 6. Notification Service

Handles:

- Creating notifications
- Fetching notifications by user/admin email
- Marking notifications as read
- Unread notification badge count support

Port:

```txt
8084
```

## Technologies Used

- Java 17
- Spring Boot
- Spring Cloud
- Spring Cloud Gateway
- Eureka Discovery Server
- OpenFeign
- Spring Data JPA
- H2 Database
- React
- Vite
- Lucide React Icons
- Docker
- Docker Compose
- Maven

## Application URLs

Main application:

```txt
http://localhost:9090
```

Eureka dashboard:

```txt
http://localhost:8761
```

User Service:

```txt
http://localhost:8081
```

App Service:

```txt
http://localhost:8082
```

Review Service:

```txt
http://localhost:8083
```

Notification Service:

```txt
http://localhost:8084
```

## How To Run

### 1. Build frontend

```bash
cd frontend
npm install
npm run build
```

The frontend build is copied into:

```txt
api-gateway/src/main/resources/static
```

### 2. Build backend services

From each service folder, run:

```bash
mvn clean package -DskipTests
```

Or use the Maven wrapper:

```bash
./mvnw clean package -DskipTests
```

### 3. Run with Docker Compose

From the project root:

```bash
docker compose up -d --build
```

### 4. Open the app

```txt
http://localhost:9090
```

## Notification Flow

### User download notification

When a user downloads an app:

1. User clicks install/download.
2. App Service stores the download.
3. App Service sends a notification to admin.
4. Admin notification badge count increases.
5. Admin can view the message in the notification panel.

### App update notification

When admin announces a new version:

1. Admin updates app version.
2. App Service finds users who installed that app.
3. Notification Service creates update notifications for those users.
4. User notification badge count increases.
5. User can view the update notification in the notification panel.

## Default Admin Email

```txt
developer@gmail.com
```

## Author

Aishwarya
```
