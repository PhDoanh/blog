import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-expect-error importing inline script
import script from "./scripts/bookmarksGraph.inline"
import style from "./styles/bookmarksGraph.scss"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"

export interface D3Config {
  drag: boolean
  zoom: boolean
  depth: number
  scale: number
  repelForce: number
  centerForce: number
  linkDistance: number
  fontSize: number
  opacityScale: number
  removeTags: string[]
  showTags: boolean
  focusOnHover?: boolean
  enableRadial?: boolean
}

interface GraphOptions {
  globalGraph: Partial<D3Config> | undefined
}

const defaultOptions: GraphOptions = {
  globalGraph: {
    drag: true,
    zoom: true,
    depth: -1,
    scale: 0.9,
    repelForce: 0.5,
    centerForce: 0.2,
    linkDistance: 30,
    fontSize: 0.6,
    opacityScale: 1,
    showTags: false,
    removeTags: [],
    focusOnHover: true,
    enableRadial: true,
  },
}

export default ((opts?: Partial<GraphOptions>) => {
  const BookmarksGraph: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const globalGraph = { ...defaultOptions.globalGraph, ...opts?.globalGraph }
    const openBookmarksPage = i18n(cfg.locale).components.bookmarksGraph?.openBookmarksPage || "Open Garden"
    return (
      <div class={classNames(displayClass, "graph")}>
        <h3>{i18n(cfg.locale).components.bookmarksGraph?.title}</h3>
        <div class="graph-outer">
          <div class="graph-container" data-cfg={JSON.stringify(globalGraph)}></div>
          <button class="graph-icon" aria-label={openBookmarksPage} title={openBookmarksPage}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17.6"
              height="17.6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round">
              <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
              <path d="m21 3-9 9" />
              <path d="M15 3h6v6" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  BookmarksGraph.css = style
  BookmarksGraph.afterDOMLoaded = script

  return BookmarksGraph
}) satisfies QuartzComponentConstructor
