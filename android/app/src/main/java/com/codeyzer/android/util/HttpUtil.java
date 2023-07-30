package com.codeyzer.android.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.StringEntity;

public class HttpUtil {

    private static final String PI = "http://192.168.1.2:8080";
    private static final String LOCAL = "http://192.168.1.100:9090";
    private static final String SUNUCU = PI;

    public static <T> T post(String patika, Object istek, TypeReference<T> cevapSinifi) {
        ObjectMapper objectMapper = new ObjectMapper();
        try( CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(SUNUCU + patika);
            httpPost.setEntity(new StringEntity(objectMapper.writeValueAsString(istek)));
            CloseableHttpResponse response = client.execute(httpPost);
            return objectMapper.readValue(response.getEntity().getContent(), cevapSinifi);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
