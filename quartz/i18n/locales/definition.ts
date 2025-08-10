import { FullSlug } from "../../util/path"

export interface CalloutTranslation {
  note: string
  abstract: string
  info: string
  todo: string
  tip: string
  success: string
  question: string
  warning: string
  failure: string
  danger: string
  bug: string
  example: string
  quote: string
}

export interface Translation {
  propertyDefaults: {
    title: string
    description: string
  }
  components: {
    callout: CalloutTranslation
    backlinks: {
      title: string
      noBacklinksFound: string
    }
    bookmark: {
      title: string
      tooltip: string
    }
    mediaShare: {
      title: string
      tooltip: string
      copyLink: string
      linkCopied: string
    }
    translate: {
      title: string
      tooltip: string
    }
    editThisPage: {
      title: string
      tooltip: string
    }
    themeToggle: {
      lightMode: string
      darkMode: string
    }
    readerMode: {
      title: string
      tooltip: string
    }
    explorer: {
      title: string
    }
    footer: {
      createdWith: string
    }
    graph: {
      title: string
      tooltip: string
    }
    recentNotes: {
      title: string
      seeRemainingMore: (variables: { remaining: number }) => string
    }
    transcludes: {
      transcludeOf: (variables: { targetSlug: FullSlug }) => string
      linkToOriginal: string
    }
    search: {
      title: string
      searchBarPlaceholder: string
    }
    tableOfContents: {
      title: string
    }
    contentMeta: {
      readingTime: (variables: { minutes: number }) => string
    }
  }
  pages: {
    rss: {
      recentNotes: string
      lastFewNotes: (variables: { count: number }) => string
    }
    error: {
      title: string
      notFound: string
      home: string
    }
    translation?: {
      title: string
      notAvailable: string
      contributeTitle: string
      contributeText: string
      step1: string
      step2: string
      step3: string
      returnToOriginal: string
    }
    folderContent: {
      folder: string
      itemsUnderFolder: (variables: { count: number }) => string
    }
    tagContent: {
      tag: string
      tagIndex: string
      itemsUnderTag: (variables: { count: number }) => string
      showingFirst: (variables: { count: number }) => string
      totalTags: (variables: { count: number }) => string
    }
  }
}
