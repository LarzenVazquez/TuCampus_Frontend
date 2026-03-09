async function loadComponent(elementId, path) {
  const container = document.getElementById(elementId);
  if (!container) return;

  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Fallo al cargar ${path}`);
    const html = await response.text();
    container.innerHTML = html;

    console.log(`Componente cargado: ${elementId}`);
  } catch (err) {
    console.error(`Error cargando componente ${path}:`, err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("main-header", "/src/components/header.html");
  loadComponent("main-nav", "/src/components/bottom-nav.html");
  loadComponent("admin-sidebar", "/src/components/admin-sidebar.html");
});

document.addEventListener("click", (e) => {
  if (e.target.closest('[data-page="perfil"]')) {
    window.location.href = "/perfil/index.html";
  }
});
