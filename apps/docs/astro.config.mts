import starlight from "@astrojs/starlight";
import cloudflare from '@astrojs/cloudflare';
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [
    starlight({
      title: "Boilr",
      logo: {
        src: "./src/assets/boilr_logo.svg",
        replacesTitle: true,
        alt: "Boilr Logo",
      },
      components: {
        ThemeSelect: "./src/components/theme-select.astro",
      },
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/rhinolabs/boilr" }],
      sidebar: [
        {
          label: "Guides",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Getting Started", slug: "guides/get-started" },
            { label: "Example Guide", slug: "guides/example" },
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
      customCss: [
        "./src/styles/global.css",
      ],
    }),
    react(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
