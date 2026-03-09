import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: ".",

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        register: resolve(__dirname, "auth/register.html"),
        store: resolve(__dirname, "store/index.html"),
        admin: resolve(__dirname, "admin/index.html"),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
