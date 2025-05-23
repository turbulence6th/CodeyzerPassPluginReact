package com.codeyzer.android;

import android.app.Activity;
import android.app.ActivityManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.view.autofill.AutofillManager;
import android.widget.Toast;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.view.accessibility.AccessibilityManager;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContract;
import androidx.annotation.RequiresApi;

import com.codeyzer.android.dto.CodeyzerDepoReducer;
import com.codeyzer.android.dto.HariciSifreDTO;
import com.codeyzer.android.dto.HariciSifreIcerik;
import com.codeyzer.android.dto.PaketOption;
import com.codeyzer.android.util.KriptoUtil;
import com.codeyzer.android.util.PrefUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CapacitorPlugin(name = "CodeyzerAutofillPlugin")
public class CodeyzerAutofillPlugin extends Plugin {

    private ActivityResultLauncher<PluginCall> autofillLauncher;
    private ActivityResultLauncher<PluginCall> accessibilityLauncher;
    private PluginCall pendingCall;

    @Override
    protected void handleOnStart() {
        autofillLauncher = getActivity().registerForActivityResult(new ActivityResultContract<PluginCall, Boolean>() {

            private PluginCall call;

            @RequiresApi(api = Build.VERSION_CODES.O)
            @Override
            public Intent createIntent(Context context, PluginCall call) {
                this.call = call;
                return new Intent(Settings.ACTION_REQUEST_SET_AUTOFILL_SERVICE, Uri.parse("package:com.codeyzer.android"));
            }

            @Override
            public Boolean parseResult(int resultCode, Intent result) {
                // Autofill etkinleştirildikten sonra Accessibility'yi etkinleştir
                if (pendingCall != null) {
                    accessibilityLauncher.launch(pendingCall);
                }
                return resultCode == Activity.RESULT_OK;
            }

        }, result -> {
            // Sonuç işleme gerekirse burada yapılabilir
        });
        
        accessibilityLauncher = getActivity().registerForActivityResult(new ActivityResultContract<PluginCall, Boolean>() {

            private PluginCall call;

            @Override
            public Intent createIntent(Context context, PluginCall call) {
                this.call = call;
                return new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
            }

            @Override
            public Boolean parseResult(int resultCode, Intent result) {
                if (pendingCall != null) {
                    Toast.makeText(getContext(), "Erişilebilirlik ayarlarından Codeyzer Pass'i etkinleştirin", Toast.LENGTH_LONG).show();
                    pendingCall.resolve();
                    pendingCall = null;
                }
                return resultCode == Activity.RESULT_OK;
            }

        }, result -> {
            // Sonuç işleme gerekirse burada yapılabilir
        });
    }

    @PluginMethod
    public void sifreListesiGuncelle(PluginCall call) throws Exception {
        CodeyzerDepoReducer codeyzerDepoReducer = PrefUtil.getCodeyzerDepoReducer(getContext());

        Map<String, List<String>> paketMap = new HashMap<>();
        for (HariciSifreDTO hariciSifreDTO : codeyzerDepoReducer.getHariciSifreListesi()) {
            String sifreliMatin = hariciSifreDTO.getIcerik();
            HariciSifreIcerik icerik = KriptoUtil.desifreEt(sifreliMatin, codeyzerDepoReducer.getKullanici().getSifre());
            String paket = icerik.getAndroidPaket();
            if (paket != null && !paket.isEmpty()) {
                List<String> liste = paketMap.get(paket);
                if (liste == null) {
                    liste = new ArrayList<>();
                    liste.add(sifreliMatin);
                    paketMap.put(paket, liste);
                } else {
                    liste.add(sifreliMatin);
                }
            }
        }

        PrefUtil.setPaketMap(getContext(), paketMap);

        call.resolve();
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    @PluginMethod
    public void androidPaketGetir(PluginCall call) throws JsonProcessingException, JSONException {
        PackageManager packageManager = getActivity().getPackageManager();
        List<PaketOption> paketList = packageManager.getInstalledApplications(PackageManager.GET_META_DATA).stream()
                .filter(x ->  (x.flags & ApplicationInfo.FLAG_SYSTEM) == 0)
                .map(x -> {
                    PaketOption paketOption = new PaketOption();
                    paketOption.setLabel((String) packageManager.getApplicationLabel(x));
                    paketOption.setValue(x.packageName);
                    return paketOption;
                })
                .sorted(Comparator.comparing(PaketOption::getLabel))
                .collect(Collectors.toList());

        JSObject ret = new JSObject();
        ret.put("paketList", new JSArray(new ObjectMapper().writeValueAsString(paketList)));
        call.resolve(ret);
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @PluginMethod
    public void otomatikDoldurBilgi(PluginCall call) {
        // Autofill durumunu kontrol et
        AutofillManager autofillManager = getContext().getSystemService(AutofillManager.class);
        boolean autofillEtkin = autofillManager.hasEnabledAutofillServices();
        boolean autofillDestek = autofillManager.isAutofillSupported();
        
        // Accessibility durumunu kontrol et
        AccessibilityManager accessibilityManager = (AccessibilityManager) getContext().getSystemService(Context.ACCESSIBILITY_SERVICE);
        boolean accessibilityEtkin = false;
        
        if (accessibilityManager != null) {
            List<AccessibilityServiceInfo> enabledServices = accessibilityManager.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK);
            for (AccessibilityServiceInfo service : enabledServices) {
                if (service.getId().contains("com.codeyzer.android/.CodeyzerAccessibilityService")) {
                    accessibilityEtkin = true;
                    break;
                }
            }
        }
        
        JSObject ret = new JSObject();
        ret.put("autofillEtkin", autofillEtkin);
        ret.put("accessibilityEtkin", accessibilityEtkin);
        ret.put("etkin", autofillEtkin && accessibilityEtkin); // Her ikisi de etkin mi?
        ret.put("destek", autofillDestek);
        call.resolve(ret);
    }

    @PluginMethod
    public void otomatikDoldurEtkinlestir(PluginCall call) {
        pendingCall = call;
        autofillLauncher.launch(call);
    }

    @PluginMethod
    public void sonKullanilanAndroidPaketGetir(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("androidPaket", null);
        call.resolve(ret);
    }
}
