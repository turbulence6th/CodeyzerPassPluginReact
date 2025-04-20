import bcrypt from "bcryptjs";

export const vaultIdOlustur = async (kullaniciAdi: string, sifre: string, vaultIdSalt: string): Promise<string> => {
    const password = `${kullaniciAdi}:${sifre}`;
    const enc = new TextEncoder();
    const salt = Uint8Array.from(atob(vaultIdSalt), c => c.charCodeAt(0));

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt,
            iterations: 100000,
            hash: 'SHA-512',
        },
        keyMaterial,
        256 // 32 byte
    );

    const buffer = new Uint8Array(derivedBits);
    return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
};

export const deriveAesKey = async (password: string, saltBase64: string): Promise<CryptoKey> => {
    const enc = new TextEncoder();
    const salt = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: 100000,
            hash: 'SHA-512',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
};

export const sha512 = async (veri: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(veri);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export const generateIV = (): Uint8Array => {
    return crypto.getRandomValues(new Uint8Array(12)); // 96-bit önerilir (AES-GCM için)
}

export const encryptWithAES = async (aesKey: CryptoKey, content: string, iv: Uint8Array): Promise<string> => {
    const encoder = new TextEncoder();
    const encodedContent = encoder.encode(content);
  
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      aesKey,
      encodedContent
    );
  
    // Şifrelenmiş veriyi base64'e çevir
    const encryptedBytes = new Uint8Array(encryptedBuffer);
    const base64Encrypted = btoa(String.fromCharCode(...encryptedBytes));
  
    return base64Encrypted;
  }

  export const decryptWithAES = async (aesKey: CryptoKey, encryptedBase64: string, iv: Uint8Array): Promise<string> => {
    // Base64'ten byte dizisine çevir
    const encryptedBytes = Uint8Array.from(
      atob(encryptedBase64),
      char => char.charCodeAt(0)
    );
  
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      aesKey,
      encryptedBytes
    );
  
    const decoder = new TextDecoder();
    const decryptedText = decoder.decode(decryptedBuffer);
  
    return decryptedText;
  };

  export const bcryptHash = async (plainPassword: string): Promise<string> => {
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(plainPassword, salt);
  };
  
  export const checkBcrypt = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  };

  export const bufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary); // binary → base64
  }

  export const uint8ArrayToBase64 = (arr: Uint8Array): string => {
    let binary = '';
    arr.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary); // binary → base64
  }

  export const base64ToUint8Array = (base64: string): Uint8Array => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }