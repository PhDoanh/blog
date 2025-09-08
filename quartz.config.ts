import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "PhDoanh",
    pageTitleSuffix: "",
    description: "A place to record what happened in my brain",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "google",
      tagId: "G-59D57MVJSQ",
    },
    locale: "en-US",
    baseUrl: "phdoanh.github.io/blog",
    ignorePatterns: ["unpublished", "templates", ".obsidian", "README.md", "LICENSE.md"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Roboto Slab",
        body: "Roboto",
        code: "Source Code Pro",
      },
      colors: {
        lightMode: {
          light: "#fffdfa",
          lightgray: "#e3ded4",
          gray: "#c9c9c9",
          darkgray: "#4a4a4a",
          dark: "#202020",
          secondary: "#2e7d32",
          tertiary: "#4caf50",
          highlight: "rgba(143, 169, 154, 0.15)",
          textHighlight: "#fff23688",
        },
        darkMode: {
          light: "#0a0f0a",
          lightgray: "#1a231a",
          gray: "#4d624d",
          darkgray: "#c0d6c0",
          dark: "#e6f5e6",
          secondary: "#4caf50",
          tertiary: "#81c784",
          highlight: "rgba(143, 169, 154, 0.15)",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting(),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest", lazyLoad: true }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
      Plugin.Poetry(),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      Plugin.NoTranslationPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
      Plugin.Offline({ precachePages: ["./"] }),
    ],
  },
}

export default config
