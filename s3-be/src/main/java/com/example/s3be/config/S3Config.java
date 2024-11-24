package com.example.s3be.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
public class S3Config {

  @Value("${aws.accessKey:test}")
  private String accessKey;

  @Value("${aws.secretKey:test}")
  private String secretKey;

  @Value("${aws.s3.endpointUrl:http://localhost:4566}")
  private String endpointUrl;

  @Value("${aws.s3.region:us-east-1}")
  private String region;

  @Bean
  public S3Client s3Client() {
    return S3Client.builder()
      .credentialsProvider(StaticCredentialsProvider.create(
        AwsBasicCredentials.create(accessKey, secretKey)))
      .endpointOverride(URI.create(endpointUrl)) // For LocalStack/MinIO
      .region(Region.of(region))
      .serviceConfiguration(S3Configuration.builder()
        .pathStyleAccessEnabled(true) // Required for LocalStack/MinIO
        .build())
      .build();
  }

  @Bean
  public S3Presigner s3Presigner() {
    return S3Presigner.builder()
      .credentialsProvider(StaticCredentialsProvider.create(
        AwsBasicCredentials.create(accessKey, secretKey)))
      .endpointOverride(URI.create(endpointUrl))
      .region(Region.of(region))
      .build();
  }
}