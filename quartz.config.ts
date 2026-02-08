import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "ɓlog×ɗoanh",
    pageTitleSuffix: "",
    webAppTitle: "BlogbyD",
    description: "Vườn công nghệ số được trồng và chăm sóc bởi Doanh",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "google",
      tagId: "G-59D57MVJSQ",
    },
    locale: "en-US",
    baseUrl: "phdoanh.github.io/blog",
    // baseUrl: "localhost:8080",
    ignorePatterns: ["templates", ".obsidian", "README.md", "LICENSE.md"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        title: "Montserrat Underline",
        header: "Space Grotesk",
        body: "IBM Plex Sans",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#fbfaf5",
          lightgray: "#cbd1bc",
          gray: "#b5bda1",
          darkgray: "#3c4030",
          dark: "#1a1c14",
          secondary: "#478559",
          tertiary: "#82a68c",
          highlight: "rgba(71, 133, 89, 0.12)",
          textHighlight: "#e9eec9",
        },
        darkMode: {
          light: "#161b14",
          lightgray: "#2d362a",
          gray: "#4a5743",
          darkgray: "#d1dcc7",
          dark: "#ecf2e4",
          secondary: "#7db582",
          tertiary: "#a3c9a8",
          highlight: "rgba(125, 181, 130, 0.15)",
          textHighlight: "#3e3525",
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
      Plugin.CrawlLinks({
        markdownLinkResolution: "shortest",
        lazyLoad: true,
        openLinksInNewTab: true,
      }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
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
        rssLimit: 30,
        rssFullHtml: true,
        includeEmptyFiles: false,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      Plugin.BookmarksPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages({
        excludeRoot: true,
      }),
      Plugin.Offline(),
    ],
  },
}

export default config
