package com.fernline.portfolio.config;

import io.micrometer.core.instrument.Clock;
import io.micrometer.graphite.GraphiteConfig;
import io.micrometer.graphite.GraphiteMeterRegistry;
import io.micrometer.graphite.GraphiteProtocol;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Note: with micrometer-registry-graphite on the classpath and the
 * management.graphite.metrics.export.* properties set (see
 * application.properties), Spring Boot would autoconfigure this bean
 * for you — you technically don't need this class at all. It's kept
 * explicit, same as the reference project, so it's obvious exactly
 * what's being sent where instead of it happening implicitly.
 */
@Configuration
public class GraphiteConfiguration {

    @Value("${management.graphite.metrics.export.host:graphite}")
    private String graphiteHost;

    @Value("${management.graphite.metrics.export.port:2003}")
    private int graphitePort;

    @Bean
    public GraphiteMeterRegistry graphiteMeterRegistry() {

        GraphiteConfig config = new GraphiteConfig() {

            @Override
            public String get(String key) {
                return null;
            }

            @Override
            public String host() {
                return graphiteHost;
            }

            @Override
            public int port() {
                return graphitePort;
            }

            @Override
            public GraphiteProtocol protocol() {
                return GraphiteProtocol.PLAINTEXT;
            }

            @Override
            public Duration step() {
                return Duration.ofSeconds(10);
            }
        };

        return new GraphiteMeterRegistry(config, Clock.SYSTEM);
    }
}
