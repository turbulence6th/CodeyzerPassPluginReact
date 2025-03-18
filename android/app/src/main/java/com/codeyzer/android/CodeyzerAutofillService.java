package com.codeyzer.android;

import android.app.assist.AssistStructure;
import android.app.assist.AssistStructure.ViewNode;
import android.graphics.Rect;
import android.os.Build;
import android.os.CancellationSignal;
import android.service.autofill.AutofillService;
import android.service.autofill.Dataset;
import android.service.autofill.FillCallback;
import android.service.autofill.FillContext;
import android.service.autofill.FillRequest;
import android.service.autofill.FillResponse;
import android.service.autofill.SaveCallback;
import android.service.autofill.SaveInfo;
import android.service.autofill.SaveRequest;
import android.text.InputType;
import android.util.ArrayMap;
import android.util.Pair;
import android.view.autofill.AutofillId;
import android.view.autofill.AutofillValue;
import android.widget.RemoteViews;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.codeyzer.android.dto.Cevap;
import com.codeyzer.android.dto.CodeyzerDepoReducer;
import com.codeyzer.android.dto.HariciSifreIcerik;
import com.codeyzer.android.dto.HariciSifreKaydetDTO;
import com.codeyzer.android.util.HttpUtil;
import com.codeyzer.android.util.KriptoUtil;
import com.codeyzer.android.util.PrefUtil;
import com.fasterxml.jackson.core.type.TypeReference;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RequiresApi(api = Build.VERSION_CODES.O)
public final class CodeyzerAutofillService extends AutofillService {

    private static final Set<String> TEXT_INPUT_TYPES = Collections.unmodifiableSet(new HashSet<>(
            Arrays.asList("text", "email", "tel", "number")
    ));
    
    // Hint ve ipucu kontrolleri kaldırıldı

    @Override
    public void onFillRequest(FillRequest request, CancellationSignal cancellationSignal,
                              FillCallback callback) {
        AssistStructure structure = getLatestAssistStructure(request);
        Map<String, ViewNode> fields = getAutofillableFields(structure);

        if (fields.isEmpty()) {
            callback.onSuccess(null);
            return;
        }

        // Create the base response
        FillResponse.Builder response = new FillResponse.Builder();

        // 1.Add the dynamic datasets
        String packageName = getApplicationContext().getPackageName();

        Map<String, List<String>> paketMap = PrefUtil.getPaketMap(getApplicationContext());
        CodeyzerDepoReducer depo = PrefUtil.getCodeyzerDepoReducer(getApplicationContext());

        String filledPackageName = structure.getActivityComponent().getPackageName();
        List<String> sifreListesi = paketMap.get(filledPackageName);
        if (sifreListesi == null) {
            callback.onSuccess(null);
            return;
        }

        List<HariciSifreIcerik> icerikListesi = sifreListesi.stream()
                .map(x -> KriptoUtil.desifreEt(x, depo.getKullanici().getSifre()))
                .collect(Collectors.toList());

        for (HariciSifreIcerik icerik : icerikListesi) {
            String kullaniciAdi = icerik.getKullaniciAdi();
            String sifre = icerik.getSifre();

            Dataset.Builder dataset = new Dataset.Builder();

            if (fields.containsKey("username")) {
                RemoteViews usernameHint = newDatasetPresentation(packageName, kullaniciAdi);
                dataset.setValue(fields.get("username").getAutofillId(), AutofillValue.forText(kullaniciAdi), usernameHint);
            }

            if (fields.containsKey("password")) {
                RemoteViews passwordHint = newDatasetPresentation(packageName, kullaniciAdi);
                dataset.setValue(fields.get("password").getAutofillId(), AutofillValue.forText(sifre), passwordHint);
            }

            response.addDataset(dataset.build());
        }

        // 2.Add save info
        Collection<AutofillId> ids = fields.values().stream().map(ViewNode::getAutofillId).collect(Collectors.toList());
        AutofillId[] requiredIds = new AutofillId[ids.size()];
        ids.toArray(requiredIds);
        response.setSaveInfo(
                // We're simple, so we're generic
                new SaveInfo.Builder(SaveInfo.SAVE_DATA_TYPE_GENERIC, requiredIds).build());

        // 3.Profit!
        callback.onSuccess(response.build());
    }

    @Override
    public void onSaveRequest(SaveRequest request, SaveCallback callback) {
        AssistStructure structure = getLatestAssistStructure(request);
        Map<String, ViewNode> fields = getAutofillableFields(structure);

        String username = (String) fields.get("username").getText();
        String password = (String) fields.get("password").getText();

        if (username != null && password != null) {

            CodeyzerDepoReducer codeyzerDepoReducer = PrefUtil.getCodeyzerDepoReducer(getApplicationContext());
            String androidPlatform = structure.getActivityComponent().getPackageName();

            HariciSifreIcerik hariciSifreIcerik = new HariciSifreIcerik();
            hariciSifreIcerik.setAndroidPaket(androidPlatform);
            hariciSifreIcerik.setKullaniciAdi(username);
            hariciSifreIcerik.setSifre(password);

            HariciSifreKaydetDTO hariciSifreKaydetDTO = new HariciSifreKaydetDTO();
            hariciSifreKaydetDTO.setIcerik(KriptoUtil.sifrele(hariciSifreIcerik, codeyzerDepoReducer.getKullanici().getSifre()));
            hariciSifreKaydetDTO.setKullaniciKimlik(codeyzerDepoReducer.getKullanici().getKullaniciKimlik());

            Cevap<Void> cevap = HttpUtil.post("/hariciSifre/kaydet", hariciSifreKaydetDTO, new TypeReference<Cevap<Void>>() {});
            if (cevap.getBasarili()) {
                callback.onSuccess();
            } else {
                callback.onFailure(cevap.getMesaj());
            }
        } else {
            callback.onFailure("Kullanıcı adı veya şifre alınamadı");
        }
    }

    @NonNull
    private Map<String, ViewNode> getAutofillableFields(@NonNull AssistStructure structure) {
        Map<String, ViewNode> fields = new ArrayMap<>();
        int nodes = structure.getWindowNodeCount();
        for (int i = 0; i < nodes; i++) {
            ViewNode node = structure.getWindowNodeAt(i).getRootViewNode();
            addAutofillableFields(fields, node, structure);
        }
        return fields;
    }

    private void addAutofillableFields(Map<String, ViewNode> fields, ViewNode node, AssistStructure structure) {
        // Eğer node null ise işlem yapma
        if (node == null) {
            return;
        }
        
        // Önce bu node'un kendisini kontrol et
        if (sifreKutusuMu(node)) {
            fields.put("password", node);
        } else if (kullaniciAdiKutusuMu(node)) {
            fields.put("username", node);
        }
        
        // Sonra çocuklarını kontrol et
        int childrenSize = node.getChildCount();
        for (int i = 0; i < childrenSize; i++) {
            addAutofillableFields(fields, node.getChildAt(i), structure);
        }
        
        // Eğer şifre kutusu bulundu ama kullanıcı adı kutusu bulunamadıysa, özel arama yap
        if (fields.containsKey("password") && !fields.containsKey("username")) {
            ViewNode passwordNode = fields.get("password");
            ViewNode usernameNode = findUsernameFieldForPassword(structure.getWindowNodeAt(0).getRootViewNode(), passwordNode);
            if (usernameNode != null) {
                fields.put("username", usernameNode);
            }
        }
    }

    /**
     * Şifre alanı için en uygun kullanıcı adı alanını bulmaya çalışır.
     * Önce şifre alanının üstündeki en yakın metin giriş alanını arar.
     */
    private ViewNode findUsernameFieldForPassword(ViewNode rootNode, ViewNode passwordNode) {
        // Tüm potansiyel kullanıcı adı alanlarını topla
        List<ViewNode> potentialUsernameFields = new ArrayList<>();
        collectPotentialUsernameFields(rootNode, passwordNode, potentialUsernameFields);
        
        if (potentialUsernameFields.isEmpty()) {
            return null;
        }
        
        // En iyi eşleşmeyi bul
        ViewNode bestMatch = null;
        int bestScore = -1;
        
        for (ViewNode field : potentialUsernameFields) {
            int score = calculateUsernameFieldScore(field, passwordNode);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = field;
            }
        }
        
        return bestMatch;
    }
    
    /**
     * Potansiyel kullanıcı adı alanlarını toplar
     */
    private void collectPotentialUsernameFields(ViewNode node, ViewNode passwordNode, List<ViewNode> results) {
        if (node == null) {
            return;
        }
        
        // Bu node şifre kutusu değilse ve kullanıcı adı kutusu olabilirse listeye ekle
        if (node != passwordNode && kullaniciAdiKutusuMu(node)) {
            results.add(node);
        }
        
        // Çocukları da kontrol et
        int childrenSize = node.getChildCount();
        for (int i = 0; i < childrenSize; i++) {
            collectPotentialUsernameFields(node.getChildAt(i), passwordNode, results);
        }
    }
    
    /**
     * Bir alanın kullanıcı adı alanı olma olasılığını puanlar
     */
    private int calculateUsernameFieldScore(ViewNode usernameField, ViewNode passwordField) {
        int score = 0;
        
        // Şifre alanının hemen üstündeyse puan arttır
        Rect usernameBounds = new Rect(
            usernameField.getLeft(),
            usernameField.getTop(),
            usernameField.getLeft() + usernameField.getWidth(),
            usernameField.getTop() + usernameField.getHeight()
        );
        
        Rect passwordBounds = new Rect(
            passwordField.getLeft(),
            passwordField.getTop(),
            passwordField.getLeft() + passwordField.getWidth(),
            passwordField.getTop() + passwordField.getHeight()
        );
        
        // Kullanıcı adı alanı şifre alanının üstündeyse ve yatay olarak yakınsa
        if (usernameBounds.bottom <= passwordBounds.top && 
            Math.abs(usernameBounds.left - passwordBounds.left) < 100) {
            // Mesafe ne kadar yakınsa o kadar çok puan
            score += 20 - Math.min(20, (passwordBounds.top - usernameBounds.bottom) / 10);
        }
        
        return score;
    }

    static boolean kullaniciAdiKutusuMu(ViewNode node) {
        // Input type kontrolü
        if ((node.getInputType() & InputType.TYPE_CLASS_TEXT) != 0) {
            // Şifre alanı değilse ve metin girişi ise kullanıcı adı alanı
            if ((node.getInputType() & InputType.TYPE_TEXT_VARIATION_PASSWORD) == 0 &&
                (node.getInputType() & InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD) == 0 &&
                (node.getInputType() & InputType.TYPE_TEXT_VARIATION_WEB_PASSWORD) == 0) {
                return true;
            }
        }
        
        // HTML input kontrolü
        if (node.getHtmlInfo() != null) {
            if ("input".equals(node.getHtmlInfo().getTag())) {
                // Type attribute'unu kontrol et
                for (Pair<String, String> attribute : node.getHtmlInfo().getAttributes()) {
                    if ("type".equals(attribute.first) && TEXT_INPUT_TYPES.contains(attribute.second)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    static boolean sifreKutusuMu(ViewNode node) {
        // Input type kontrolü - şifre türleri
        if ((node.getInputType() & InputType.TYPE_TEXT_VARIATION_PASSWORD) != 0 ||
            (node.getInputType() & InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD) != 0 ||
            (node.getInputType() & InputType.TYPE_TEXT_VARIATION_WEB_PASSWORD) != 0) {
            return true;
        }
        
        // HTML input kontrolü
        if (node.getHtmlInfo() != null) {
            // Type attribute'u password mı?
            boolean isPasswordType = node.getHtmlInfo().getAttributes().stream()
                    .anyMatch(x -> "type".equals(x.first) && "password".equals(x.second));
            
            if (isPasswordType) {
                return true;
            }
        }
        
        return false;
    }

    @NonNull
    static AssistStructure getLatestAssistStructure(@NonNull FillRequest request) {
        List<FillContext> fillContexts = request.getFillContexts();
        return fillContexts.get(fillContexts.size() - 1).getStructure();
    }

    @NonNull
    static AssistStructure getLatestAssistStructure(@NonNull SaveRequest request) {
        List<FillContext> fillContexts = request.getFillContexts();
        return fillContexts.get(fillContexts.size() - 1).getStructure();
    }

    /**
     * Helper method to create a dataset presentation with the given text.
     */
    @NonNull
    static RemoteViews newDatasetPresentation(@NonNull String packageName,
                                              @NonNull CharSequence text) {
        RemoteViews presentation = new RemoteViews(packageName, R.layout.multidataset_service_list_item);
        presentation.setTextViewText(R.id.text, text);
        presentation.setImageViewResource(R.id.icon, R.mipmap.ic_launcher);
        return presentation;
    }

    static class ViewNodeNavigator {
        ViewNode node;
        ViewNodeNavigator parent;
    }
}

