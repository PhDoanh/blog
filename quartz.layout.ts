import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { SimpleSlug } from "./quartz/util/path"

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
    {
      Component: Component.MediaShare(),
    },
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
      // filter: (f) =>
      //   f.slug!.startsWith("news/") && f.slug! !== "news/index" && !f.frontmatter?.noindex,
      linkToMore: "tags/" as SimpleSlug,
    }),
    Component.Comments({
      provider: 'giscus',
      options: {
        repo: 'PhDoanh/doanhanma',
        repoId: 'R_kgDOMh8WzA',
        category: 'General',
        categoryId: 'DIC_kwDOMh8WzM4Chibl',
        inputPosition: "top",
      }
    }),
    Component.BackToTop(),
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/PhDoanh/blog",
      Community: "facebook group link",
      Donate: "https://ko-fi.com/pgdoanh",
      "Bug report": "github issues link",
      "Feature request": "github issues link",
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
