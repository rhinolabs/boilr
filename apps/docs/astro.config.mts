import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  output: "static",
  adapter: cloudflare({ configPath: "../../wrangler.jsonc" }),
  integrations: [
    starlight({
      title: "BoilrJs",
      logo: {
        src: "./src/assets/boilr_logo.svg",
        replacesTitle: true,
        alt: "BoilrJs Logo",
      },
      components: {
        ThemeSelect: "./src/components/theme-select.astro",
      },
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/rhinolabs/boilr" }],
      sidebar: [
        {
          label: "Guides",
          items: [
            { label: "Getting Started", slug: "guides/get-started" },
            { label: "Example Guide", slug: "guides/example" },
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
      customCss: ["./src/styles/global.css"],
    }),
    react(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
