package com.codeyzer.android.util;

import android.content.Context;
import android.content.SharedPreferences;

import com.codeyzer.android.dto.CodeyzerDepoReducer;
import com.codeyzer.android.dto.CodeyzerPersistRoot;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

public class PrefUtil {

    public static CodeyzerDepoReducer getCodeyzerDepoReducer(Context context) {
        try {
            SharedPreferences capacitorSharedPreferences = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String depoStr = capacitorSharedPreferences.getString("persist:root", "{}");
            CodeyzerPersistRoot codeyzerPersistRoot = new ObjectMapper().readValue(depoStr, CodeyzerPersistRoot.class);
            return new ObjectMapper().readValue(codeyzerPersistRoot.getCodeyzerDepoReducer(), CodeyzerDepoReducer.class);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static Map<String, List<String>> getPaketMap(Context context) {
        try {
            SharedPreferences sharedPreferences = context.getSharedPreferences("paketMap", Context.MODE_PRIVATE);
            String hariciSifreListesiJson = sharedPreferences.getString("paketMap", "{}");
            return new ObjectMapper().readValue(hariciSifreListesiJson, new TypeReference<Map<String, List<String>>>(){});
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static void setPaketMap(Context context, Map<String, List<String>> paketMap) {
        try {
            SharedPreferences sharedPreferences = context.getSharedPreferences("paketMap", Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = sharedPreferences.edit();
            editor.putString("paketMap", new ObjectMapper().writeValueAsString(paketMap));
            editor.apply();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
