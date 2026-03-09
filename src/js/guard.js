// src/js/guard.js
(function () {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");
  const path = window.location.pathname;

  // 1. DEFINIR PÁGINAS PÚBLICAS (Aquí sí pueden estar sin login)
  // Ajusta estos nombres según tus archivos reales
  const isAuthPage =
    path.includes("indexlogin.html") ||
    path.includes("register.html") ||
    path === "/" ||
    path === "/index.html";

  // 2. SI NO ESTÁ LOGUEADO Y TRATA DE ENTRAR A UNA PÁGINA PRIVADA
  if (!token && !isAuthPage) {
    console.warn("Acceso denegado: Sesión no iniciada.");
    // Cambia "/indexlogin.html" por tu página principal de entrada
    window.location.href = "/index.html";
    return;
  }

  // 3. SI ESTÁ LOGUEADO PERO ES UN COMPRADOR EN ÁREA DE ADMIN
  if (token && userData) {
    const user = JSON.parse(userData);
    const userRole = String(user.rol).toLowerCase();
    const isInsideAdmin = path.includes("/admin/");

    if (isInsideAdmin && userRole !== "admin") {
      alert("No tienes permisos de administrador.");
      window.location.href = "/store/index.html";
    }
  }
})();
