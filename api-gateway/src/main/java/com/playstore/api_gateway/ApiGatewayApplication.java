package com.playstore.api_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpHeaders;
import org.springframework.web.server.WebFilter;

@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

    public static void main(String[] args) {

        SpringApplication.run(ApiGatewayApplication.class, args);
    }

    @Bean
    public WebFilter noCacheHtmlFilter() {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();
            if ("/".equals(path) || path.endsWith(".html")) {
                exchange.getResponse().getHeaders().set(HttpHeaders.CACHE_CONTROL, "no-store, no-cache, must-revalidate");
                exchange.getResponse().getHeaders().set(HttpHeaders.PRAGMA, "no-cache");
            }
            return chain.filter(exchange);
        };
    }
}
