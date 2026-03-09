(function () {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");
  const path = window.location.pathname;
  const isAuthPage =
    path.includes("indexlogin.html") ||
    path.includes("register.html") ||
    path === "/" ||
    path === "/index.html";
  if (!token && !isAuthPage) {
    console.warn("Acceso denegado: Sesión no iniciada.");
    window.location.href = "/index.html";
    return;
  }
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
