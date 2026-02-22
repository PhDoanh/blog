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
    // baseUrl: "http://localhost:8080",
    ignorePatterns: ["templates", ".obsidian", "README.md", "LICENSE.md", "_infio_prompts", ".infio_json_db", ".github", "private"],
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
      Plugin.CommentMarker({
        tabulatorOptions: {
          layout: "fitColumns",
          responsiveLayout: "collapse",
          responsiveLayoutCollapseStartOpen: false,
          columnDefaults: {
            minWidth: 100,
          },
          rowHeader: {
            formatter: "responsiveCollapse",
            width: 30,
            minWidth: 30,
            hozAlign: "center",
            resizable: false,
            headerSort: false,
          },
          pagination: true,
          paginationSize: 25,
          paginationSizeSelector: [10, 25, 50],
          movableColumns: true,
          initialSort: [{ column: "col0", dir: "asc" }], // sort by first column
          selectable: false,
        },
      })
    ],
    filters: [Plugin.ExplicitPublish()],
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
