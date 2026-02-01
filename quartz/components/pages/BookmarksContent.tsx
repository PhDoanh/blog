import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { i18n } from "../../i18n"
import style from "../styles/listPage.scss"
// @ts-expect-error importing inline script
import script from "../scripts/bookmarksContent.inline"
import { concatenateResources } from "../../util/resources"
import { PageList } from "../PageList"

const BookmarksContent: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
  const description =
    i18n(cfg.locale).pages.bookmarks?.description ||
    "Articles you've planted for offline reading."

  return (
    <div class="popover-hint">
      <article>
        <p>{description}</p>
      </article>
      <div class="page-listing">
        <p id="bookmark-count"></p>
        <div id="bookmark-list-container"></div>
      </div>
    </div>
  )
}

BookmarksContent.css = concatenateResources(style, PageList.css)
BookmarksContent.afterDOMLoaded = script

export default (() => BookmarksContent) satisfies QuartzComponentConstructor
