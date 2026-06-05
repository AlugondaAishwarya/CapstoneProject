package com.playstore.userservice.config;

import com.playstore.userservice.entity.User;
import com.playstore.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("[DATA INITIALIZER] Initializing default users...");

        if (userRepository.findByEmail("user@gmail.com").isEmpty()) {
            User user = new User();
            user.setName("John Doe");
            user.setEmail("user@gmail.com");
            user.setPassword(passwordEncoder.encode("password"));
            user.setRole("USER");
            userRepository.save(user);
            System.out.println("Seeded default User: user@gmail.com / password");
        }

        java.util.Optional<User> adminUser = userRepository.findByEmail("developer@gmail.com");
        if (adminUser.isEmpty()) {
            User admin = new User();
            admin.setName("Play Store Admin");
            admin.setEmail("developer@gmail.com");
            admin.setPassword(passwordEncoder.encode("password"));
            admin.setRole("OWNER");
            userRepository.save(admin);
            System.out.println("Seeded default Admin: developer@gmail.com / password");
        } else {
            User admin = adminUser.get();
            admin.setName("Play Store Admin");
            admin.setRole("OWNER");
            userRepository.save(admin);
            System.out.println("Updated default Admin profile: developer@gmail.com / password");
        }
    }
}
