import { JwtResponseDTO, KullaniciLoginRequest, KullaniciOlusturRequestDTO, TokenRefreshRequestDTO } from "./KullaniciDTO";
import { SunucuApi } from "./SunucuApi";

export class KullaniciApi {
    private static readonly BASE_URL = '/api/kullanici';

    static async register(request: KullaniciOlusturRequestDTO): Promise<JwtResponseDTO> {
        return await SunucuApi.post(`${this.BASE_URL}/register`, request);
    }

    static async login(request: KullaniciLoginRequest): Promise<JwtResponseDTO> {
        return await SunucuApi.post(`${this.BASE_URL}/login`, request);
    }

    static async refreshToken(request: TokenRefreshRequestDTO): Promise<JwtResponseDTO> {
        return await SunucuApi.post(`${this.BASE_URL}/refresh`, request);
    }
}
