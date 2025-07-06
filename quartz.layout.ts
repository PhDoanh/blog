import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

const left = [
  Component.PageTitle(),
  Component.MobileOnly(Component.Spacer()),
  Component.Flex({
    components: [
      {
        Component: Component.Search(),
        grow: true,
      },
      { Component: Component.Darkmode() },
    ],
  }),
  Component.Explorer(
    {
      folderDefaultState: "open",
      useSavedState: true,
      filterFn: (node) => {
        return node.data?.tags?.includes("explorable") === true;
      },
    }
  ),
]

const sharedFlex = Component.Flex({
  components: [
    {
      Component: Component.ContentMeta(),
      grow: true,
    },
    { Component: Component.Bookmark() },
    { Component: Component.MediaShare() },
    {
      Component: Component.Graph2(
        {
          config: {
            scale: 1.5,
            linkDistance: 50,
            fontSize: 0.6,
            opacityScale: 1,
            showTags: true,
            removeTags: ["explorable"],
            focusOnHover: true,
          },
        }
      )
    },
    { Component: Component.ReaderMode() },
    { Component: Component.EditThisPage() },
  ],
})

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.MobileOnly(Component.Backlinks()),
    Component.RecentNotes({
      title: "Recent Articles",
      showTags: false,
      limit: 5,
      filter: (f, fileData) => {
        const currentDir = fileData.slug?.split("/").slice(0, -1).join("/");
        const fileDir = f.slug?.split("/").slice(0, -1).join("/");
        return fileDir === currentDir && f.slug !== fileData.slug;
      },
    }),
    Component.Comments({
      provider: 'giscus',
      options: {
        repo: 'PhDoanh/blog',
        repoId: 'R_kgDOPFpROQ',
        category: 'Announcements',
        categoryId: 'DIC_kwDOPFpROc4CsZgE',
        inputPosition: "top",
        lightTheme: "light_tritanopia",
        darkTheme: "dark_tritanopia",
      }
    }),
    Component.BackToTop(),
  ],
  footer: Component.Footer({
    links: {
      Email: "mailto:phdoanh285@gmail.com",
      Community: "facebook group link",
      Donate: "https://ko-fi.com/pgdoanh",
      "Bug report": "https://github.com/PhDoanh/blog/issues/new?template=bug_report.md",
      "Feature request": "https://github.com/PhDoanh/blog/issues/new?template=feature_request.md",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.TagList(),
    sharedFlex,
    Component.MobileOnly(Component.TableOfContents()),
  ],
  left,
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
    Component.DesktopOnly(Component.Backlinks()),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    sharedFlex,
  ],
  left,
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
    Component.DesktopOnly(Component.Backlinks()),
  ],
}
