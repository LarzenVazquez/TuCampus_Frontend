// src/js/theme.js

// Función para aplicar el tema guardado o el del sistema
export function initTheme() {
  const savedTheme = localStorage.getItem("tc-theme") || "dark";
  document.body.classList.remove("light", "dark");
  document.body.classList.add(savedTheme);
}

// Función para cambiar entre temas
export function toggleTheme() {
  const body = document.body;
  const isDark = body.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";

  body.classList.replace(isDark ? "dark" : "light", newTheme);
  localStorage.setItem("tc-theme", newTheme);
}

// Ejecutar inmediatamente al cargar el script para evitar destellos
initTheme();
