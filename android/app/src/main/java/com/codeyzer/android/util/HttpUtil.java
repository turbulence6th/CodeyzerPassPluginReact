package com.codeyzer.android.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.StringEntity;

public class HttpUtil {

    public static <T> T post(String url, String patika, Object istek, TypeReference<T> cevapSinifi) {
        ObjectMapper objectMapper = new ObjectMapper();
        try( CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(url + patika);
            httpPost.setEntity(new StringEntity(objectMapper.writeValueAsString(istek)));
            CloseableHttpResponse response = client.execute(httpPost);
            return objectMapper.readValue(response.getEntity().getContent(), cevapSinifi);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
