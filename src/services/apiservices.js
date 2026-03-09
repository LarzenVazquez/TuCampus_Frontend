import axios from "axios";
import forge from "node-forge";

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const apiService = {
  auth: {
    // --- PUNTO B: LOGIN SEGURO (Cifrado Híbrido) ---
    login: async (email, password) => {
      // 1. Obtener llave pública del server
      const {
        data: { publicKey: pem },
      } = await api.get("/auth/public-key");
      const publicKey = forge.pki.publicKeyFromPem(pem);

      // 2. Generar llave simétrica AES y IV (Escenario 1: IV aleatorio)
      const aesKey = forge.random.getBytesSync(16);
      const iv = forge.random.getBytesSync(16);

      // 3. Cifrar password con AES
      const cipher = forge.cipher.createCipher("AES-CBC", aesKey);
      cipher.start({ iv });
      cipher.update(forge.util.createBuffer(password));
      cipher.finish();
      const encryptedPassword = forge.util.encode64(cipher.output.getBytes());

      // 4. Cifrar llave AES con RSA (Llave Pública del server)
      const encryptedAesKey = forge.util.encode64(
        publicKey.encrypt(forge.util.bytesToHex(aesKey)),
      );

      // 5. Enviar todo al login
      return await api.post("/auth/login", {
        email,
        encryptedPassword,
        encryptedAesKey,
        iv: forge.util.bytesToHex(iv),
      });
    },

    // --- PUNTO A: REGISTRO ---
    register: async (userData) => {
      return await api.post("/auth/register", userData);
    },

    // --- PUNTO C: INTEGRIDAD + IMGBB ---
    uploadIdentityFile: async (file) => {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await api.post("/auth/upload-identity", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },

    logout: async () => {
      try {
        await api.post("/auth/logout");
      } finally {
        localStorage.clear();
        window.location.href = "/indexlogin.html";
      }
    },
  },
};
