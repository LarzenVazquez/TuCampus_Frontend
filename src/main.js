import { apiService } from "./services/apiservices.js";

/* Manejo de sesión y protección de rutas al cargar el DOM */
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const path = window.location.pathname;

  /* Redirección automática si el usuario ya está autenticado */
  const isAuthPage =
    path.includes("indexlogin.html") ||
    path.includes("register.html") ||
    path === "/";

  if (token && user && isAuthPage) {
    window.location.href =
      user.rol === "admin" ? "/admin/index.html" : "/store/index.html";
  }

  /* Inyección de datos del usuario en la interfaz */
  if (user) {
    const nameEl = document.querySelector(".perfil-sidebar h2");
    const emailEl = document.querySelector(".perfil-sidebar p");
    if (nameEl) nameEl.textContent = user.nombre;
    if (emailEl) emailEl.textContent = user.email || "";
  }
});

/* Lógica de Login con estados de espera */
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    const originalText = btn.innerHTML;

    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      /* Retroalimentación genérica de inicio de sesión */
      btn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Validando...';
      btn.disabled = true;

      const { data } = await apiService.auth.login(email, password);

      /* Almacenamiento de credenciales de acceso */
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      /* Direccionamiento por rol */
      window.location.href =
        data.user.rol === "admin" ? "/admin/index.html" : "/store/index.html";
    } catch (error) {
      alert(error.response?.data?.message || "Acceso denegado");
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });
}

/* Lógica de Registro de nuevos usuarios */
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
        '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';
      btn.disabled = true;

      await apiService.auth.register({
        nombre,
        email,
        password,
        matricula: email.split("@")[0],
      });

      alert("Registro completado con éxito");
      window.location.href = "/index.html";
    } catch (error) {
      alert(error.response?.data?.message || "Error al crear cuenta");
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });
}

/* Gestión de actualización de imagen de perfil */
window.subirFoto = async () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const avatar = document.getElementById("user-avatar-container");
    const originalContent = avatar.innerHTML;

    try {
      avatar.innerHTML = '<i class="fa-solid fa-sync fa-spin"></i>';
      const res = await apiService.auth.uploadIdentityFile(file);

      avatar.innerHTML = `<img src="${res.url}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;

      alert("Imagen actualizada");
    } catch (err) {
      alert("Error al subir el archivo");
      avatar.innerHTML = originalContent;
    }
  };
  input.click();
};

/* Cierre de sesión */
window.handleLogout = async () => {
  if (confirm("¿Desea salir del sistema?")) {
    await apiService.auth.logout();
  }
};
