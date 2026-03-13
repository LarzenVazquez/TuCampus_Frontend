import axios from "axios";
import forge from "node-forge";

/* Configuración de la URL base desde el entorno */
const BASE_URL = import.meta.env.VITE_API_URL;

/* Instancia de axios para peticiones globales */
const api = axios.create({
  baseURL: BASE_URL,
});

/* Interceptor para adjuntar el token Bearer en cada petición */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const apiService = {
  auth: {
    /* Login Seguro con Cifrado Híbrido RSA/AES */
    login: async (email, password) => {
      /* 1. Obtener llave pública RSA del servidor */
      const {
        data: { publicKey: pem },
      } = await api.get("/auth/public-key");
      const publicKey = forge.pki.publicKeyFromPem(pem);

      /* 2. Generar llaves efímeras (Symmetric Key e IV) */
      const aesKey = forge.random.getBytesSync(16);
      const iv = forge.random.getBytesSync(16);

      /* 3. Cifrado de password con algoritmo AES-CBC */
      const cipher = forge.cipher.createCipher("AES-CBC", aesKey);
      cipher.start({ iv });
      cipher.update(forge.util.createBuffer(password));
      cipher.finish();
      const encryptedPassword = forge.util.encode64(cipher.output.getBytes());

      /* 4. Cifrado RSA de la llave AES para transporte seguro */
      const encryptedAesKey = forge.util.encode64(
        publicKey.encrypt(forge.util.bytesToHex(aesKey)),
      );

      /* 5. Envío de credenciales y llaves cifradas al servidor */
      return await api.post("/auth/login", {
        email,
        encryptedPassword,
        encryptedAesKey,
        iv: forge.util.bytesToHex(iv),
      });
    },

    /* Registro de usuario estándar */
    register: async (userData) => {
      return await api.post("/auth/register", userData);
    },

    /* Subida de archivos con integridad (Multipart) */
    uploadIdentityFile: async (file) => {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await api.post("/auth/upload-identity", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },

    /* Cierre de sesión y limpieza de persistencia local */
    logout: async () => {
      try {
        await api.post("/auth/logout");
      } finally {
        /* Limpiar storage y redirigir al login */
        localStorage.clear();
        window.location.href = "/index.html";
      }
    },
  },
  
  products: {
    /* Productos cafetería*/
    getAll: async () => {
      const { data } = await api.get("/products");
      return data;
    },
    /* Marketplace */
    getMarketplace: async () => {
      const { data } = await api.get("/products/marketplace");
      return data;
    },
    /* Nuevo platillo */
    create: async (productData) => {
      return await api.post("/products", productData);
    }
  },

  orders: {
    /* Carrito: Enviar el pedido a la base de datos */
    createOrder: async (orderData) => {
      const { data } = await api.post("/orders", orderData);
      return data;
    },
    /* Historial */
    getMyOrders: async () => {
      const { data } = await api.get("/orders/me");
      return data;
    },
    /* Órdenes pendientes */
    getPending: async () => {
      const { data } = await api.get("/orders/pending");
      return data;
    },
    /* Status orden */
    updateStatus: async (orderId, newStatus) => {
      return await api.patch(`/orders/${orderId}/status`, { status: newStatus });
    }
  }
};
