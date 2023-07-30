package com.codeyzer.android.util;

import com.codeyzer.android.dto.HariciSifreIcerik;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.security.DigestException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

public class KriptoUtil {

    public static HariciSifreIcerik desifreEt(String sifreliMetin, String sifre) {
        try {
            byte[] cipherData = Base64.getDecoder().decode(sifreliMetin);
            byte[] saltData = Arrays.copyOfRange(cipherData, 8, 16);

            MessageDigest md5 = MessageDigest.getInstance("MD5");
            final byte[][] keyAndIV = GenerateKeyAndIV(32, 16, 1, saltData, sifre.getBytes(StandardCharsets.UTF_8), md5);
            SecretKeySpec key = new SecretKeySpec(keyAndIV[0], "AES");
            IvParameterSpec iv = new IvParameterSpec(keyAndIV[1]);

            byte[] encrypted = Arrays.copyOfRange(cipherData, 16, cipherData.length);
            Cipher aesCBC = Cipher.getInstance("AES/CBC/PKCS5Padding");
            aesCBC.init(Cipher.DECRYPT_MODE, key, iv);
            byte[] decryptedData = aesCBC.doFinal(encrypted);

            String text = new String(decryptedData, StandardCharsets.UTF_8);
            return new ObjectMapper().readValue(text, HariciSifreIcerik.class);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static String sifrele(HariciSifreIcerik icerik, String sifre) {
        try {
            String stringToEncrypt = new ObjectMapper().writeValueAsString(icerik);
            SecureRandom sr = new SecureRandom();
            byte[] salt = new byte[8];
            sr.nextBytes(salt);
            final byte[][] keyAndIV = GenerateKeyAndIV(32, 16, 1, salt, sifre.getBytes(StandardCharsets.UTF_8),
                    MessageDigest.getInstance("MD5"));
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(keyAndIV[0], "AES"), new IvParameterSpec(keyAndIV[1]));

            byte[] encryptedData = cipher.doFinal(stringToEncrypt.getBytes(StandardCharsets.UTF_8));
            byte[] prefixAndSaltAndEncryptedData = new byte[16 + encryptedData.length];

            System.arraycopy("Salted__".getBytes(StandardCharsets.UTF_8), 0, prefixAndSaltAndEncryptedData, 0, 8);
            System.arraycopy(salt, 0, prefixAndSaltAndEncryptedData, 8, 8);
            System.arraycopy(encryptedData, 0, prefixAndSaltAndEncryptedData, 16, encryptedData.length);

            return Base64.getEncoder().encodeToString(prefixAndSaltAndEncryptedData);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static byte[][] GenerateKeyAndIV(int keyLength, int ivLength, int iterations, byte[] salt, byte[] password, MessageDigest md) {

        int digestLength = md.getDigestLength();
        int requiredLength = (keyLength + ivLength + digestLength - 1) / digestLength * digestLength;
        byte[] generatedData = new byte[requiredLength];
        int generatedLength = 0;

        try {
            md.reset();

            // Repeat process until sufficient data has been generated
            while (generatedLength < keyLength + ivLength) {

                // Digest data (last digest if available, password data, salt if available)
                if (generatedLength > 0)
                    md.update(generatedData, generatedLength - digestLength, digestLength);
                md.update(password);
                if (salt != null)
                    md.update(salt, 0, 8);
                md.digest(generatedData, generatedLength, digestLength);

                // additional rounds
                for (int i = 1; i < iterations; i++) {
                    md.update(generatedData, generatedLength, digestLength);
                    md.digest(generatedData, generatedLength, digestLength);
                }

                generatedLength += digestLength;
            }

            // Copy key and IV into separate byte arrays
            byte[][] result = new byte[2][];
            result[0] = Arrays.copyOfRange(generatedData, 0, keyLength);
            if (ivLength > 0)
                result[1] = Arrays.copyOfRange(generatedData, keyLength, keyLength + ivLength);

            return result;

        } catch (DigestException e) {
            throw new RuntimeException(e);

        } finally {
            // Clean out temporary data
            Arrays.fill(generatedData, (byte)0);
        }
    }
}
