package com.codeyzer.android;

import android.app.assist.AssistStructure;
import android.app.assist.AssistStructure.ViewNode;
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
import android.view.autofill.AutofillId;
import android.view.autofill.AutofillValue;
import android.widget.RemoteViews;

import androidx.annotation.NonNull;

import com.codeyzer.android.dto.Cevap;
import com.codeyzer.android.dto.Depo;
import com.codeyzer.android.dto.HariciSifreIcerik;
import com.codeyzer.android.dto.HariciSifreKaydetDTO;
import com.codeyzer.android.util.HttpUtil;
import com.codeyzer.android.util.KriptoUtil;
import com.codeyzer.android.util.PrefUtil;
import com.fasterxml.jackson.core.type.TypeReference;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public final class CodeyzerAutofillService extends AutofillService {

    private static final Set<String> TEXT_INPUT_TYPES = Collections.unmodifiableSet(new HashSet<>(
            Arrays.asList("text", "email", "tel", "number")
    ));

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
        Depo depo = PrefUtil.getDepo(getApplicationContext());

        String filledPackageName = structure.getActivityComponent().getPackageName();
        List<String> sifreListesi = paketMap.get(filledPackageName);
        if (sifreListesi == null) {
            callback.onSuccess(null);
            return;
        }

        List<HariciSifreIcerik> icerikListesi = sifreListesi.stream()
                .map(x -> KriptoUtil.desifreEt(x, depo.getSifre()))
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

            Depo depo = PrefUtil.getDepo(getApplicationContext());
            String androidPlatform = structure.getActivityComponent().getPackageName();

            HariciSifreIcerik hariciSifreIcerik = new HariciSifreIcerik();
            hariciSifreIcerik.setAndroidPaket(androidPlatform);
            hariciSifreIcerik.setKullaniciAdi(username);
            hariciSifreIcerik.setSifre(password);

            HariciSifreKaydetDTO hariciSifreKaydetDTO = new HariciSifreKaydetDTO();
            hariciSifreKaydetDTO.setIcerik(KriptoUtil.sifrele(hariciSifreIcerik, ""));
            hariciSifreKaydetDTO.setKullaniciKimlik(depo.getKullaniciKimlik());

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
            ViewNodeNavigator viewNodeNavigator = new ViewNodeNavigator();
            viewNodeNavigator.node = node;
            addAutofillableFields(fields, viewNodeNavigator);
        }
        return fields;
    }

    private void addAutofillableFields(Map<String, ViewNode> fields, ViewNodeNavigator viewNodeNavigator) {
        ViewNode node = viewNodeNavigator.node;
        if (sifreKutusuMu(node)) {
            if (!fields.containsKey("password")) {
                fields.put("password", node);
            }

            if (!fields.containsKey("username")) {
                ViewNode kullaniciAdiKutusu = kullaniciAdiKutusuGetir(viewNodeNavigator.parent, node);
                if (kullaniciAdiKutusu != null) {
                    fields.put("username", kullaniciAdiKutusu);
                }
            }
        } else {
            int childrenSize = node.getChildCount();
            for (int i = 0; i < childrenSize; i++) {
                ViewNodeNavigator viewNodeNavigatorChild = new ViewNodeNavigator();
                viewNodeNavigatorChild.node = node.getChildAt(i);
                viewNodeNavigatorChild.parent = viewNodeNavigator;
                addAutofillableFields(fields, viewNodeNavigatorChild);
            }
        }
    }

    static ViewNode kullaniciAdiKutusuGetir(ViewNode container, ViewNode sifreKutusu) {
        int childrenSize = container.getChildCount();
        for (int i = 0; i < childrenSize; i++) {
            ViewNode child = container.getChildAt(i);
            if (child.getChildCount() == 0) {
                if (child != sifreKutusu && kullaniciAdiKutusuMu(child)) {
                    return child;
                }
            } else {
                ViewNode kullaniciAdiKutusu = kullaniciAdiKutusuGetir(child, sifreKutusu);
                if (kullaniciAdiKutusu != null) {
                    return kullaniciAdiKutusu;
                }
            }
        }

        return null;
    }

    static ViewNode kullaniciAdiKutusuGetir(ViewNodeNavigator navigator, ViewNode sifreKutusu) {
        while (navigator != null) {
            ViewNode kullaniciAdiKutusu = kullaniciAdiKutusuGetir(navigator.node, sifreKutusu);
            if (kullaniciAdiKutusu != null) {
                return kullaniciAdiKutusu;
            }

            navigator = navigator.parent;
        }

        return null;
    }

    static boolean kullaniciAdiKutusuMu(ViewNode node) {
        if ((node.getInputType() & InputType.TYPE_CLASS_TEXT) != 0 ||
                (node.getInputType() & InputType.TYPE_CLASS_NUMBER) != 0) {
            return true;
        } else if (node.getHtmlInfo() != null) {
            return "input".equals(node.getHtmlInfo().getTag()) && node.getHtmlInfo().getAttributes().stream()
                    .anyMatch(x -> "type".equals(x.first) && TEXT_INPUT_TYPES.contains(x.second));
        }

        return false;
    }

    static boolean sifreKutusuMu(ViewNode node) {
        if ((node.getInputType() & InputType.TYPE_TEXT_VARIATION_PASSWORD) != 0) {
            return true;
        } else if (node.getHtmlInfo() != null) {
            return node.getHtmlInfo().getAttributes().stream()
                    .anyMatch(x -> "type".equals(x.first) && "password".equals(x.second));
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
