import { apiService } from "./services/apiservices.js";

/**
 * --- 0. INICIALIZACIÓN Y SEGURIDAD ---
 * Se ejecuta al cargar cualquier página que importe este script.
 */
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const path = window.location.pathname;

  // Páginas de acceso público
  const isAuthPage =
    path.includes("indexlogin.html") ||
    path.includes("register.html") ||
    path === "/";

  // Si ya hay sesión activa y el usuario está en Login/Register, mandarlo adentro
  if (token && user && isAuthPage) {
    window.location.href =
      user.rol === "admin" ? "/admin/index.html" : "/store/index.html";
  }

  // Cargar datos dinámicos en el Sidebar o Perfil si existen los elementos
  if (user) {
    const nameEl = document.querySelector(".perfil-sidebar h2");
    const emailEl = document.querySelector(".perfil-sidebar p");
    if (nameEl) nameEl.textContent = user.nombre;
    if (emailEl) emailEl.textContent = user.email || "";
  }
});

/**
 * --- 1. GESTIÓN DE LOGIN (Punto B: RSA/AES) ---
 */
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    const originalText = btn.innerHTML;

    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cifrando...';
      btn.disabled = true;

      // El servicio realiza el intercambio de llaves y cifrado híbrido
      const { data } = await apiService.auth.login(email, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login Seguro: Conexión híbrida RSA/AES establecida.");

      window.location.href =
        data.user.rol === "admin" ? "/admin/index.html" : "/store/index.html";
    } catch (error) {
      alert(
        "Error: " +
          (error.response?.data?.message || "Credenciales incorrectas"),
      );
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });
}

/**
 * --- 2. GESTIÓN DE REGISTRO (Punto A: Bcrypt) ---
 */
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    const originalText = btn.innerHTML;

    const nombre = e.target[0].value;
    const email = e.target[1].value;
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm-password").value;

    if (password !== confirm) return alert("Las contraseñas no coinciden");

    try {
      btn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Registrando...';
      btn.disabled = true;

      await apiService.auth.register({
        nombre,
        email,
        password,
        matricula: email.split("@")[0], // Generación automática de matrícula
      });

      alert(
        "¡Cuenta creada con éxito! Se aplicó Bcrypt (Factor 10) en el servidor.",
      );
      window.location.href = "/indexlogin.html";
    } catch (error) {
      alert(error.response?.data?.message || "Error al registrar usuario");
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });
}

/**
 * --- 3. INTEGRIDAD DE ARCHIVOS (Punto C: SHA-256) ---
 */
window.subirFoto = async () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const avatar = document.querySelector(".user-avatar-circle");
    const originalHTML = avatar ? avatar.innerHTML : "";

    try {
      if (avatar) avatar.innerHTML = '<i class="fa-solid fa-sync fa-spin"></i>';

      const res = await apiService.auth.uploadIdentityFile(file);

      if (avatar) {
        avatar.innerHTML = `<img src="${res.url}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
      }

      alert(`Integridad SHA-256 verificada exitosamente.`);
    } catch (err) {
      alert("Error en la validación de integridad.");
      if (avatar) avatar.innerHTML = originalHTML;
      console.error(err);
    }
  };
  input.click();
};

// En src/main.js
window.subirFoto = async () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*"; // Solo imágenes

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Seleccionamos el contenedor del perfil
    const avatar = document.getElementById("user-avatar-container");
    const originalContent = avatar.innerHTML;

    try {
      // Feedback visual: Icono de carga
      avatar.innerHTML = '<i class="fa-solid fa-sync fa-spin"></i>';

      // Llamada al servicio que sube y verifica SHA-256
      const res = await apiService.auth.uploadIdentityFile(file);

      // Si todo sale bien, mostramos la imagen
      avatar.innerHTML = `<img src="${res.url}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;

      alert(
        `¡Éxito! Imagen verificada con SHA-256.\nHash: ${res.hash.substring(0, 20)}...`,
      );
    } catch (err) {
      alert("Error al procesar la imagen.");
      avatar.innerHTML = originalContent; // Revertir si falla
    }
  };
  input.click(); // Abrir el selector de archivos del sistema
};
/**
 * --- 4. AYUDANTES GLOBALES ---
 */
window.handleLogout = async () => {
  if (confirm("¿Cerrar sesión de forma segura?")) {
    await apiService.auth.logout();
  }
};
