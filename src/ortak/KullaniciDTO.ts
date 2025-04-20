export interface KullaniciLoginRequest {
    kullaniciKimlik: string; // SHA512(username + ":" + password)
    sifreHash: string;       // bcrypt(password) - frontendde yapılır
}

export interface KullaniciOlusturRequestDTO {
    kullaniciKimlik: string;
    sifreHash: string;
}

export interface JwtResponseDTO {
    accessToken: string;
    refreshToken: string;
}

export interface Kullanici {
    kullaniciKimlik: string;
    sifreHash: string;
    accessToken: string;
    refreshToken: string;
}

export interface TokenRefreshRequestDTO {
    refreshToken: string;
}