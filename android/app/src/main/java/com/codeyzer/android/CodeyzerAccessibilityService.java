package com.codeyzer.android;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.graphics.PixelFormat;
import android.graphics.Rect;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.InputType;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.WindowManager;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;
import android.content.ClipData;
import android.content.ClipboardManager;

import com.codeyzer.android.dto.CodeyzerDepoReducer;
import com.codeyzer.android.dto.HariciSifreIcerik;
import com.codeyzer.android.util.KriptoUtil;
import com.codeyzer.android.util.PrefUtil;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class CodeyzerAccessibilityService extends AccessibilityService {
    private static final String TAG = "CodeyzerAccessibility";
    private boolean isProcessing = false;
    private String currentUrl = "";
    private Set<String> filledUrls = new HashSet<>();
    private AlertDialog currentDialog = null;

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (isProcessing) return;
        
        try {
            isProcessing = true;
            
            // Olay tipini kontrol et
            int eventType = event.getEventType();
            Log.d(TAG, "Accessibility event: " + AccessibilityEvent.eventTypeToString(eventType));
            
            // Tıklama ve odaklanma olaylarını işle
            if (eventType == AccessibilityEvent.TYPE_VIEW_CLICKED || 
                eventType == AccessibilityEvent.TYPE_VIEW_FOCUSED) {
                
                AccessibilityNodeInfo rootNode = getRootInActiveWindow();
                if (rootNode == null) return;
                
                // URL'yi tespit et
                String url = detectUrl(rootNode);
                if (url != null && !url.isEmpty()) {
                    // URL değiştiyse, doldurma durumunu sıfırla
                    if (!url.equals(currentUrl)) {
                        currentUrl = url;
                        Log.d(TAG, "Detected URL: " + currentUrl);
                        // URL değiştiğinde tüm doldurma durumlarını sıfırla
                        filledUrls.clear();
                        Log.d(TAG, "URL değişti, tüm doldurma durumları sıfırlandı");
                    }
                }
                
                // Tıklanan veya odaklanılan öğeyi kontrol et
                AccessibilityNodeInfo sourceNode = null;
                if (event.getSource() != null) {
                    sourceNode = event.getSource();
                    Log.d(TAG, "Clicked/focused node: " + sourceNode.getClassName());
                    
                    // Tıklanan öğe bir input alanı mı kontrol et
                    if (isEditableField(sourceNode)) {
                        Log.d(TAG, "Editable field detected");
                        
                        // Şifre alanı mı kontrol et
                        if (isPasswordField(sourceNode)) {
                            Log.d(TAG, "Password field detected");
                            // Kullanıcı adı alanını bul
                            AccessibilityNodeInfo usernameField = findUsernameField(rootNode, sourceNode);
                            if (usernameField != null) {
                                // Şifre doldurma panelini göster
                                showPasswordFillPanel(usernameField, sourceNode, rootNode);
                            }
                        } else {
                            // Kullanıcı adı alanı olabilir, şifre alanını bul
                            AccessibilityNodeInfo passwordField = findPasswordField(rootNode);
                            if (passwordField != null) {
                                // Şifre doldurma panelini göster
                                showPasswordFillPanel(sourceNode, passwordField, rootNode);
                            } else {
                                Log.d(TAG, "Şifre alanı bulunamadı, tüm form alanlarını kontrol et");
                                // Şifre alanı bulunamadıysa, otomatik doldurma kontrolü yap
                                checkAndShowAutoFillDialog(rootNode);
                            }
                        }
                    }
                }
                
                if (sourceNode != null) {
                    sourceNode.recycle();
                }
                
                rootNode.recycle();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error in accessibility service", e);
        } finally {
            isProcessing = false;
        }
    }
    
    private String detectUrl(AccessibilityNodeInfo rootNode) {
        if (rootNode == null) return null;
        
        // URL adres çubuğunu bul
        List<AccessibilityNodeInfo> addressBarNodes = new ArrayList<>();
        
        // Chrome için
        List<AccessibilityNodeInfo> chromeNodes = rootNode.findAccessibilityNodeInfosByViewId("com.android.chrome:id/url_bar");
        if (chromeNodes != null && !chromeNodes.isEmpty()) {
            addressBarNodes.addAll(chromeNodes);
        }
        
        // Firefox için
        List<AccessibilityNodeInfo> firefoxNodes = rootNode.findAccessibilityNodeInfosByViewId("org.mozilla.firefox:id/url_bar_title");
        if (firefoxNodes != null && !firefoxNodes.isEmpty()) {
            addressBarNodes.addAll(firefoxNodes);
        }
        
        // Brave için
        List<AccessibilityNodeInfo> braveNodes = rootNode.findAccessibilityNodeInfosByViewId("com.brave.browser:id/url_bar");
        if (braveNodes != null && !braveNodes.isEmpty()) {
            addressBarNodes.addAll(braveNodes);
        }
        
        // Brave Beta için
        List<AccessibilityNodeInfo> braveBetaNodes = rootNode.findAccessibilityNodeInfosByViewId("com.brave.browser_beta:id/url_bar");
        if (braveBetaNodes != null && !braveBetaNodes.isEmpty()) {
            addressBarNodes.addAll(braveBetaNodes);
        }
        
        // Brave Nightly için
        List<AccessibilityNodeInfo> braveNightlyNodes = rootNode.findAccessibilityNodeInfosByViewId("com.brave.browser_nightly:id/url_bar");
        if (braveNightlyNodes != null && !braveNightlyNodes.isEmpty()) {
            addressBarNodes.addAll(braveNightlyNodes);
        }
        
        // Brave Dev için
        List<AccessibilityNodeInfo> braveDevNodes = rootNode.findAccessibilityNodeInfosByViewId("com.brave.browser_dev:id/url_bar");
        if (braveDevNodes != null && !braveDevNodes.isEmpty()) {
            addressBarNodes.addAll(braveDevNodes);
        }
        
        if (!addressBarNodes.isEmpty()) {
            for (AccessibilityNodeInfo addressBar : addressBarNodes) {
                if (addressBar != null && addressBar.getText() != null) {
                    String url = addressBar.getText().toString();
                    
                    // URL'yi temizle ve domain kısmını al
                    if (url.startsWith("http://")) {
                        url = url.substring(7);
                    } else if (url.startsWith("https://")) {
                        url = url.substring(8);
                    }
                    
                    // www. kısmını kaldır
                    if (url.startsWith("www.")) {
                        url = url.substring(4);
                    }
                    
                    // Yolu al
                    String path = "";
                    if (url.contains("/")) {
                        int slashIndex = url.indexOf('/');
                        path = url.substring(slashIndex);
                        url = url.substring(0, slashIndex);
                    }
                    
                    return url + path;
                }
            }
        }
        
        // Alternatif yöntem: Başlık çubuğundan URL'yi tahmin et
        List<AccessibilityNodeInfo> titleNodes = rootNode.findAccessibilityNodeInfosByText("http");
        if (titleNodes != null && !titleNodes.isEmpty()) {
            for (AccessibilityNodeInfo titleNode : titleNodes) {
                if (titleNode != null && titleNode.getText() != null) {
                    String text = titleNode.getText().toString();
                    if (text.startsWith("http://") || text.startsWith("https://")) {
                        // URL'yi temizle ve domain kısmını al
                        String url = text;
                        if (url.startsWith("http://")) {
                            url = url.substring(7);
                        } else if (url.startsWith("https://")) {
                            url = url.substring(8);
                        }
                        
                        // www. kısmını kaldır
                        if (url.startsWith("www.")) {
                            url = url.substring(4);
                        }
                        
                        // Yolu al
                        String path = "";
                        if (url.contains("/")) {
                            int slashIndex = url.indexOf('/');
                            path = url.substring(slashIndex);
                            url = url.substring(0, slashIndex);
                        }
                        
                        return url + path;
                    }
                }
            }
        }
        
        return null;
    }
    
    private AccessibilityNodeInfo findPasswordField(AccessibilityNodeInfo rootNode) {
        if (rootNode == null) return null;
        
        // Doğrudan password tipindeki input alanlarını bul
        List<AccessibilityNodeInfo> allEditTexts = new ArrayList<>();
        findAllEditTextFields(rootNode, allEditTexts);
        
        // Önce isPassword() özelliğine sahip alanları kontrol et
        for (AccessibilityNodeInfo node : allEditTexts) {
            if (node.isPassword()) {
                return node;
            }
        }
        
        // Şifre alanı ipuçlarına sahip alanları kontrol et
        for (AccessibilityNodeInfo node : allEditTexts) {
            // Hint kontrolü
            if (node.getHintText() != null) {
                String hint = node.getHintText().toString().toLowerCase();
                if (hint.contains("password") || hint.contains("şifre") || hint.contains("parola") || 
                    hint.contains("pin") || hint.contains("code")) {
                    return node;
                }
            }
            
            // İçerik açıklaması kontrolü
            if (node.getContentDescription() != null) {
                String contentDesc = node.getContentDescription().toString().toLowerCase();
                if (contentDesc.contains("password") || contentDesc.contains("şifre") || contentDesc.contains("parola") || 
                    contentDesc.contains("pin") || contentDesc.contains("code") || contentDesc.contains("gizli")) {
                    return node;
                }
            }
            
            // Şifre alanı genellikle nokta karakterleri gösterir
            if (node.getText() != null) {
                String text = node.getText().toString();
                if (text.matches("^[•\\*·]+$") || (text.matches("^[0-9]+$") && text.length() >= 4 && text.length() <= 8)) {
                    return node;
                }
            }
            
            // Class name kontrolü
            CharSequence className = node.getClassName();
            if (className != null) {
                String classNameStr = className.toString().toLowerCase();
                if (classNameStr.contains("password") || classNameStr.contains("passwordfield") || 
                    classNameStr.contains("pinfield") || classNameStr.contains("securefield")) {
                    return node;
                }
            }
            
            // ID kontrolü
            String viewId = node.getViewIdResourceName();
            if (viewId != null) {
                String viewIdLower = viewId.toLowerCase();
                if (viewIdLower.contains("password") || viewIdLower.contains("sifre") || 
                    viewIdLower.contains("parola") || viewIdLower.contains("pin")) {
                    return node;
                }
            }
        }
        
        // Hiçbir şifre alanı bulunamadıysa traversal ile daha derin arama yap
        return findPasswordFieldByTraversal(rootNode);
    }
    
    private boolean isPasswordField(AccessibilityNodeInfo node) {
        if (node == null) return false;
        
        // En güvenilir kontrol: isPassword()
        if (node.isPassword()) {
            return true;
        }
        
        // Hint kontrolü
        if (node.getHintText() != null) {
            String hint = node.getHintText().toString().toLowerCase();
            if (hint.contains("password") || hint.contains("şifre") || hint.contains("parola")) {
                return true;
            }
        }
        
        // İçerik açıklaması kontrolü
        if (node.getContentDescription() != null) {
            String contentDesc = node.getContentDescription().toString().toLowerCase();
            if (contentDesc.contains("password") || contentDesc.contains("şifre") || contentDesc.contains("parola")) {
                return true;
            }
        }
        
        // Şifre alanı genellikle nokta karakterleri gösterir
        if (node.getText() != null) {
            String text = node.getText().toString();
            if (text.matches("^[•\\*·]+$")) {
                return true;
            }
        }
        
        // Class name kontrolü
        CharSequence className = node.getClassName();
        if (className != null) {
            String classNameStr = className.toString().toLowerCase();
            if (classNameStr.contains("password") || classNameStr.contains("passwordfield")) {
                return true;
            }
        }
        
        return false;
    }
    
    private AccessibilityNodeInfo findPasswordFieldByTraversal(AccessibilityNodeInfo node) {
        if (node == null) return null;
        
        // Şifre alanı olup olmadığını kontrol et
        if (isPasswordField(node)) {
            return node;
        }
        
        // Alt düğümleri kontrol et
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            AccessibilityNodeInfo passwordField = findPasswordFieldByTraversal(child);
            if (passwordField != null) {
                return passwordField;
            }
            if (child != null) {
                child.recycle();
            }
        }
        
        return null;
    }
    
    private AccessibilityNodeInfo findUsernameField(AccessibilityNodeInfo rootNode, AccessibilityNodeInfo passwordField) {
        // Şifre alanının üstündeki metin alanını bul
        return findUsernameFieldByPosition(rootNode, passwordField);
    }
    
    private AccessibilityNodeInfo findUsernameFieldByPosition(AccessibilityNodeInfo rootNode, AccessibilityNodeInfo passwordField) {
        if (rootNode == null || passwordField == null) return null;
        
        List<AccessibilityNodeInfo> editTextFields = new ArrayList<>();
        findAllEditTextFields(rootNode, editTextFields);
        
        // Şifre alanının konumunu al
        Rect passwordRect = new Rect();
        passwordField.getBoundsInScreen(passwordRect);
        
        AccessibilityNodeInfo bestMatch = null;
        int minDistance = Integer.MAX_VALUE;
        
        // Önce kullanıcı adı/email ipuçlarına sahip alanları kontrol et
        for (AccessibilityNodeInfo field : editTextFields) {
            if (field.equals(passwordField) || isPasswordField(field)) continue;
            
            // Hint veya içerik açıklaması kontrolü
            boolean isUsernameField = false;
            
            if (field.getHintText() != null) {
                String hint = field.getHintText().toString().toLowerCase();
                if (hint.contains("email") || hint.contains("username") || hint.contains("kullanıcı") || 
                    hint.contains("kullanici") || hint.contains("e-posta") || hint.contains("eposta") ||
                    hint.contains("telefon") || hint.contains("phone") || hint.contains("id") ||
                    hint.contains("hesap") || hint.contains("account") || hint.contains("login")) {
                    isUsernameField = true;
                }
            }
            
            if (!isUsernameField && field.getContentDescription() != null) {
                String desc = field.getContentDescription().toString().toLowerCase();
                if (desc.contains("email") || desc.contains("username") || desc.contains("kullanıcı") || 
                    desc.contains("kullanici") || desc.contains("e-posta") || desc.contains("eposta") ||
                    desc.contains("telefon") || desc.contains("phone") || desc.contains("id") ||
                    desc.contains("hesap") || desc.contains("account") || desc.contains("login")) {
                    isUsernameField = true;
                }
            }
            
            // ID kontrolü
            if (!isUsernameField && field.getViewIdResourceName() != null) {
                String viewId = field.getViewIdResourceName().toLowerCase();
                if (viewId.contains("email") || viewId.contains("username") || viewId.contains("kullanici") ||
                    viewId.contains("userid") || viewId.contains("login") || viewId.contains("account")) {
                    isUsernameField = true;
                }
            }
            
            if (isUsernameField) {
                Rect fieldRect = new Rect();
                field.getBoundsInScreen(fieldRect);
                
                // Şifre alanının üstünde mi kontrol et
                if (fieldRect.bottom < passwordRect.top) {
                    int distance = passwordRect.top - fieldRect.bottom;
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestMatch = field;
                    }
                }
            }
        }
        
        // Eğer kullanıcı adı alanı bulunamadıysa, şifre alanının üstündeki en yakın metin alanını bul
        if (bestMatch == null) {
            minDistance = Integer.MAX_VALUE;
            
            for (AccessibilityNodeInfo field : editTextFields) {
                if (field.equals(passwordField) || isPasswordField(field)) continue;
                
                Rect fieldRect = new Rect();
                field.getBoundsInScreen(fieldRect);
                
                // Şifre alanının üstünde mi kontrol et
                if (fieldRect.bottom < passwordRect.top) {
                    int distance = passwordRect.top - fieldRect.bottom;
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestMatch = field;
                    }
                }
            }
        }
        
        return bestMatch;
    }
    
    private void findAllEditTextFields(AccessibilityNodeInfo node, List<AccessibilityNodeInfo> editTextFields) {
        if (node == null) return;
        
        // EditText sınıfı kontrolü
        if (node.getClassName() != null && node.getClassName().toString().contains("EditText")) {
            editTextFields.add(node);
        } 
        // Düzenlenebilir alan kontrolü
        else if (node.isEditable()) {
            editTextFields.add(node);
        }
        // Input alanı kontrolü (web sayfaları için)
        else if (node.getClassName() != null && 
                (node.getClassName().toString().contains("android.webkit.WebView") || 
                 node.getClassName().toString().contains("XWalkContent"))) {
            
            // Web görünümlerinde input alanlarını bul
            if (node.getContentDescription() != null) {
                String desc = node.getContentDescription().toString().toLowerCase();
                if (desc.contains("input") || desc.contains("text field") || desc.contains("edit text")) {
                    editTextFields.add(node);
                }
            }
        }
        
        // Alt düğümleri kontrol et
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            findAllEditTextFields(child, editTextFields);
        }
    }
    
    private void showPasswordFillPanel(AccessibilityNodeInfo usernameField, AccessibilityNodeInfo passwordField, AccessibilityNodeInfo rootNode) {
        if (currentUrl == null || currentUrl.isEmpty()) {
            Log.d(TAG, "URL boş, şifre doldurma paneli gösterilemiyor");
            return;
        }
        
        // Mevcut URL'nin domainini al
        String currentDomain = extractDomain(currentUrl);
        if (currentDomain.isEmpty()) {
            Log.d(TAG, "Domain boş, şifre doldurma paneli gösterilemiyor");
            return;
        }
        
        // Kayıtlı şifreleri kontrol et
        CodeyzerDepoReducer depo = PrefUtil.getCodeyzerDepoReducer(getApplicationContext());
        if (depo == null || depo.getHariciSifreListesi() == null || depo.getHariciSifreListesi().isEmpty()) {
            Log.d(TAG, "Kayıtlı şifre bulunamadı");
            return;
        }
        
        Log.d(TAG, "Current domain: " + currentDomain);
        
        // URL'ye uygun şifreleri bul
        final Map<String, HariciSifreIcerik> uygunSifreler = findMatchingPasswords(currentDomain, depo);
        
        // Uygun şifre bulunduysa seçim panelini göster
        if (!uygunSifreler.isEmpty()) {
            Log.d(TAG, "Uygun şifreler bulundu, panel gösteriliyor");
            
            // Eğer zaten bir dialog açıksa, kapatıp yenisini açma
            if (currentDialog != null && currentDialog.isShowing()) {
                try {
                    Log.d(TAG, "Zaten açık bir dialog var, kapatılıyor");
                    currentDialog.dismiss();
                } catch (IllegalStateException e) {
                    Log.e(TAG, "Dialog kapatılırken hata oluştu", e);
                }
                currentDialog = null;
            }
            
            // Kullanıcı adlarını listeye ekle
            final List<String> kullaniciAdlari = new ArrayList<>(uygunSifreler.keySet());
            
            try {
                // Context olarak doğrudan servisi kullan
                Context context = this;
                
                // Dialog oluştur - AlertDialog.Builder'ı doğru context ile oluştur
                AlertDialog.Builder builder = new AlertDialog.Builder(context, android.R.style.Theme_DeviceDefault_Light_Dialog_Alert);
                builder.setTitle("Şifre Seçin");
                
                // Kullanıcı adlarını listele
                final ArrayAdapter<String> adapter = new ArrayAdapter<>(
                        context,
                        android.R.layout.simple_list_item_1,
                        kullaniciAdlari);

                // Şifreleri doldur - ID'leri gönder
                String usernameId = usernameField != null ? usernameField.getViewIdResourceName() : null;
                String passwordId = passwordField != null ? passwordField.getViewIdResourceName() : null;
                
                // Kullanıcı adı ve şifre ID'lerini kopyala
                final String finalUsernameId = usernameId;
                final String finalPasswordId = passwordId;
                
                builder.setAdapter(adapter, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        try {
                            String seciliKullaniciAdi = kullaniciAdlari.get(which);
                            HariciSifreIcerik seciliSifre = uygunSifreler.get(seciliKullaniciAdi);
                            
                            // Yeni bir thread'de doldurma işlemini gerçekleştir
                            new Thread(new Runnable() {
                                @Override
                                public void run() {
                                    try {
                                        // Kısa bir gecikme ekle
                                        Thread.sleep(300);
                                        
                                        // UI thread'inde çalıştır - Handler kullan
                                        new Handler(Looper.getMainLooper()).post(new Runnable() {
                                            @Override
                                            public void run() {
                                                try {
                                                    // Root node'u yeniden al
                                                    AccessibilityNodeInfo currentRootNode = getRootInActiveWindow();
                                                    if (currentRootNode != null) {
                                                        fillCredentials(currentRootNode, finalUsernameId, finalPasswordId, 
                                                                seciliSifre.getKullaniciAdi(), seciliSifre.getSifre());
                                                        Toast.makeText(getApplicationContext(), "Şifre otomatik dolduruldu", Toast.LENGTH_SHORT).show();
                                                        currentRootNode.recycle();
                                                    } else {
                                                        Log.e(TAG, "Root node alınamadı");
                                                    }
                                                } catch (Exception e) {
                                                    Log.e(TAG, "Şifre doldurma sırasında hata oluştu", e);
                                                }
                                            }
                                        });
                                    } catch (Exception e) {
                                        Log.e(TAG, "Şifre doldurma thread'inde hata", e);
                                    }
                                }
                            }).start();
                        } catch (Exception e) {
                            Log.e(TAG, "Dialog tıklama işleminde hata", e);
                        }
                    }
                });
                
                builder.setNegativeButton("İptal", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        try {
                            dialog.dismiss();
                        } catch (Exception e) {
                            Log.e(TAG, "Dialog kapatılırken hata", e);
                        }
                    }
                });
                
                try {
                    // Dialog'u göster
                    currentDialog = builder.create();
                    
                    // Dialog'u en üstte göster
                    if (currentDialog.getWindow() != null) {
                        // TYPE_APPLICATION_OVERLAY yerine TYPE_ACCESSIBILITY_OVERLAY kullan
                        currentDialog.getWindow().setType(WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY);
                        
                        // Dialog'un tam ekranda görünmesini sağla
                        WindowManager.LayoutParams lp = currentDialog.getWindow().getAttributes();
                        lp.width = WindowManager.LayoutParams.MATCH_PARENT;
                        lp.height = WindowManager.LayoutParams.WRAP_CONTENT;
                        lp.gravity = Gravity.CENTER;
                        lp.flags &= ~WindowManager.LayoutParams.FLAG_DIM_BEHIND;
                        currentDialog.getWindow().setAttributes(lp);
                        
                        // Dialog'u göster
                        currentDialog.show();
                        Log.d(TAG, "Dialog gösterildi");
                    } else {
                        Log.e(TAG, "Dialog penceresi oluşturulamadı");
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Dialog gösterilirken hata", e);
                    currentDialog = null;
                }
            } catch (Exception e) {
                Log.e(TAG, "Dialog gösterilirken hata oluştu", e);
                e.printStackTrace(); // Detaylı hata bilgisi için
            }
        } else {
            Log.d(TAG, "Bu domain için uygun şifre bulunamadı: " + currentDomain);
        }
    }
    
    private String extractDomain(String url) {
        if (url == null || url.isEmpty()) return "";
        
        // http:// veya https:// kısmını kaldır
        if (url.startsWith("http://")) {
            url = url.substring(7);
        } else if (url.startsWith("https://")) {
            url = url.substring(8);
        }
        
        // www. kısmını kaldır
        if (url.startsWith("www.")) {
            url = url.substring(4);
        }
        
        // Sadece domain kısmını al, path'i kaldır
        if (url.contains("/")) {
            url = url.substring(0, url.indexOf('/'));
        }
        
        return url;
    }
    
    private void fillCredentials(AccessibilityNodeInfo rootNode, String usernameFieldId, String passwordFieldId, String username, String password) {
        try {
            Log.d(TAG, "fillCredentials çağrıldı - usernameId: " + usernameFieldId + ", passwordId: " + passwordFieldId);
            
            // Alanları bul
            AccessibilityNodeInfo usernameField = findFieldById(rootNode, usernameFieldId);
            AccessibilityNodeInfo passwordField = findFieldById(rootNode, passwordFieldId);
            
            // ID'ler boş veya alanlar bulunamadıysa, alternatif yöntemle bul
            if (usernameField == null || passwordField == null) {
                Log.d(TAG, "Alanlar ID ile bulunamadı, alternatif yöntem deneniyor");
                
                // Şifre alanını bul
                if (passwordField == null) {
                    passwordField = findPasswordField(rootNode);
                }
                
                // Kullanıcı adı alanını bul
                if (usernameField == null && passwordField != null) {
                    usernameField = findUsernameField(rootNode, passwordField);
                }
            }
            
            // Alanları doldur
            fillTextField(usernameField, username);
            fillTextField(passwordField, password);
            
            // Kaynakları temizle
            if (usernameField != null) usernameField.recycle();
            if (passwordField != null) passwordField.recycle();
            
        } catch (Exception e) {
            Log.e(TAG, "Şifre doldurma sırasında hata oluştu", e);
        }
    }

    @Override
    public void onInterrupt() {
        // Servis kesintiye uğradığında yapılacak işlemler
        if (currentDialog != null && currentDialog.isShowing()) {
            currentDialog.dismiss();
            currentDialog = null;
        }
    }
    
    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        
        AccessibilityServiceInfo info = getServiceInfo();
        info.flags |= AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS;
        info.flags |= AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS;
        info.flags |= AccessibilityServiceInfo.FLAG_REQUEST_TOUCH_EXPLORATION_MODE;
        // Tıklama ve odaklanma olaylarını dinle
        info.eventTypes |= AccessibilityEvent.TYPE_VIEW_CLICKED;
        info.eventTypes |= AccessibilityEvent.TYPE_VIEW_FOCUSED;
        
        setServiceInfo(info);
        
        Toast.makeText(this, "Codeyzer Pass erişilebilirlik servisi etkinleştirildi", Toast.LENGTH_SHORT).show();
        Log.d(TAG, "Codeyzer Pass erişilebilirlik servisi etkinleştirildi");
    }

    // Düzenlenebilir alan kontrolü
    private boolean isEditableField(AccessibilityNodeInfo node) {
        if (node == null) return false;
        
        // EditText sınıfı kontrolü
        if (node.getClassName() != null && node.getClassName().toString().contains("EditText")) {
            return true;
        } 
        // Düzenlenebilir alan kontrolü
        else if (node.isEditable()) {
            return true;
        }
        // Input alanı kontrolü (web sayfaları için)
        else if (node.getClassName() != null && 
                (node.getClassName().toString().contains("android.webkit.WebView") || 
                 node.getClassName().toString().contains("XWalkContent"))) {
            
            // Web görünümlerinde input alanlarını kontrol et
            if (node.getContentDescription() != null) {
                String desc = node.getContentDescription().toString().toLowerCase();
                if (desc.contains("input") || desc.contains("text field") || desc.contains("edit text")) {
                    return true;
                }
            }
        }
        
        return false;
    }

    // Yeni metot: Otomatik doldurma kontrolü
    private void checkAndShowAutoFillDialog(AccessibilityNodeInfo rootNode) {
        if (rootNode == null || currentUrl == null || currentUrl.isEmpty()) return;
        
        // Mevcut URL'nin domainini al
        String currentDomain = extractDomain(currentUrl);
        if (currentDomain.isEmpty()) return;
        
        Log.d(TAG, "Otomatik doldurma kontrolü yapılıyor: " + currentDomain);
        
        // Şifre ve kullanıcı adı alanlarını bul
        AccessibilityNodeInfo passwordField = findPasswordField(rootNode);
        AccessibilityNodeInfo usernameField = null;
        
        if (passwordField != null) {
            usernameField = findUsernameField(rootNode, passwordField);
        } else {
            // Şifre alanı bulunamadıysa, tüm düzenlenebilir alanları kontrol et
            List<AccessibilityNodeInfo> editableFields = new ArrayList<>();
            findAllEditTextFields(rootNode, editableFields);
            
            for (AccessibilityNodeInfo field : editableFields) {
                if (isUsernameField(field)) {
                    usernameField = field;
                    break;
                }
            }
        }
        
        // Kayıtlı şifreleri kontrol et
        CodeyzerDepoReducer depo = PrefUtil.getCodeyzerDepoReducer(getApplicationContext());
        if (depo == null || depo.getHariciSifreListesi() == null || depo.getHariciSifreListesi().isEmpty()) {
            Log.d(TAG, "Kayıtlı şifre bulunamadı");
            return;
        }
        
        // URL'ye uygun şifreleri bul
        final Map<String, HariciSifreIcerik> uygunSifreler = findMatchingPasswords(currentDomain, depo);
        
        // Uygun şifre bulunduysa otomatik doldurma panelini göster
        if (!uygunSifreler.isEmpty()) {
            Log.d(TAG, "Otomatik doldurma için uygun şifreler bulundu, panel gösteriliyor");
            
            // ID'leri al
            String usernameId = usernameField != null ? usernameField.getViewIdResourceName() : null;
            String passwordId = passwordField != null ? passwordField.getViewIdResourceName() : null;
            
            // ID'leri logla
            Log.d(TAG, "Kullanıcı adı alanı ID: " + usernameId);
            Log.d(TAG, "Şifre alanı ID: " + passwordId);
            
            showPasswordFillPanel(usernameField, passwordField, rootNode);
        } else {
            Log.d(TAG, "Bu domain için uygun şifre bulunamadı: " + currentDomain);
        }
    }
    
    // Kullanıcı adı alanı kontrolü
    private boolean isUsernameField(AccessibilityNodeInfo node) {
        if (node == null) return false;
        
        // Hint kontrolü
        if (node.getHintText() != null) {
            String hint = node.getHintText().toString().toLowerCase();
            if (hint.contains("email") || hint.contains("username") || hint.contains("kullanıcı") || 
                hint.contains("kullanici") || hint.contains("e-posta") || hint.contains("eposta") ||
                hint.contains("telefon") || hint.contains("phone") || hint.contains("id") ||
                hint.contains("hesap") || hint.contains("account") || hint.contains("login")) {
                return true;
            }
        }
        
        // İçerik açıklaması kontrolü
        if (node.getContentDescription() != null) {
            String desc = node.getContentDescription().toString().toLowerCase();
            if (desc.contains("email") || desc.contains("username") || desc.contains("kullanıcı") || 
                desc.contains("kullanici") || desc.contains("e-posta") || desc.contains("eposta") ||
                desc.contains("telefon") || desc.contains("phone") || desc.contains("id") ||
                desc.contains("hesap") || desc.contains("account") || desc.contains("login")) {
                return true;
            }
        }
        
        // ID kontrolü
        if (node.getViewIdResourceName() != null) {
            String viewId = node.getViewIdResourceName().toLowerCase();
            if (viewId.contains("email") || viewId.contains("username") || viewId.contains("kullanici") ||
                viewId.contains("userid") || viewId.contains("login") || viewId.contains("account")) {
                return true;
            }
        }
        
        return false;
    }

    // Yeni yardımcı metotlar
    
    // ID ile alan bulma
    private AccessibilityNodeInfo findFieldById(AccessibilityNodeInfo rootNode, String fieldId) {
        if (rootNode == null || fieldId == null || fieldId.isEmpty()) return null;
        
        List<AccessibilityNodeInfo> nodes = rootNode.findAccessibilityNodeInfosByViewId(fieldId);
        if (nodes != null && !nodes.isEmpty()) {
            return nodes.get(0);
        }
        return null;
    }
    
    // Metin alanını doldurma
    private boolean fillTextField(AccessibilityNodeInfo field, String text) {
        if (field == null || text == null) return false;
        
        Log.d(TAG, "Alan doldurulmaya çalışılıyor: " + (field.getViewIdResourceName() != null ? field.getViewIdResourceName() : "Bilinmeyen Alan"));
        
        // İlk doldurma denemesi
        Bundle arguments = new Bundle();
        arguments.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text);
        boolean success = field.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments);
        
        // Başarısız olursa alternatif yöntem dene
        if (!success) {
            Log.d(TAG, "Alternatif doldurma yöntemi deneniyor");
            
            // Önce temizle
            Bundle clearArgs = new Bundle();
            clearArgs.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, "");
            field.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, clearArgs);
            
            // Karakter karakter doldur
            for (char c : text.toCharArray()) {
                Bundle charArgs = new Bundle();
                charArgs.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, 
                                        field.getText() + String.valueOf(c));
                field.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, charArgs);
            }
            
            // Başarı durumunu kontrol et
            success = (field.getText() != null && field.getText().toString().equals(text));
        }
        
        Log.d(TAG, "Alan doldurma işlemi " + (success ? "başarılı" : "başarısız"));
        return success;
    }
    
    // Domain için uygun şifreleri bulma
    private Map<String, HariciSifreIcerik> findMatchingPasswords(String currentDomain, CodeyzerDepoReducer depo) {
        final Map<String, HariciSifreIcerik> uygunSifreler = new HashMap<>();
        
        if (depo == null || depo.getHariciSifreListesi() == null) {
            return uygunSifreler;
        }
        
        for (int i = 0; i < depo.getHariciSifreListesi().size(); i++) {
            try {
                String sifreliMetin = depo.getHariciSifreListesi().get(i).getIcerik();
                HariciSifreIcerik icerik = KriptoUtil.desifreEt(sifreliMetin, depo.getKullanici().getSifre());
                
                // Platform'un domainini al
                String platformDomain = extractDomain(icerik.getPlatform());
                
                // Domain eşleşmesi kontrolü
                if (icerik.getPlatform() != null && !platformDomain.isEmpty()) {
                    // Tam eşleşme
                    if (currentDomain.equals(platformDomain)) {
                        uygunSifreler.put(icerik.getKullaniciAdi(), icerik);
                        Log.d(TAG, "Tam eşleşme bulundu: " + icerik.getKullaniciAdi());
                    } 
                    // Alt domain eşleşmesi (örn: login.example.com ve example.com)
                    else if (currentDomain.endsWith("." + platformDomain)) {
                        uygunSifreler.put(icerik.getKullaniciAdi(), icerik);
                        Log.d(TAG, "Alt domain eşleşmesi bulundu: " + icerik.getKullaniciAdi());
                    }
                    // Üst domain eşleşmesi (örn: example.com ve subdomain.example.com)
                    else if (platformDomain.endsWith("." + currentDomain)) {
                        uygunSifreler.put(icerik.getKullaniciAdi(), icerik);
                        Log.d(TAG, "Üst domain eşleşmesi bulundu: " + icerik.getKullaniciAdi());
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Error processing password", e);
            }
        }
        
        return uygunSifreler;
    }
}
