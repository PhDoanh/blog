import { i18n } from "../../i18n"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

const NotFound: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
  // If baseUrl contains a pathname after the domain, use this as the home link
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
  const baseDir = url.pathname + "/"

  return (
    <article class="popover-hint">
      <h1>{i18n(cfg.locale).pages.error.title || "404"}</h1>
      <p>{i18n(cfg.locale).pages.error.notFound || "Either this page is private or doesn't exist."}</p>
      <a href={baseDir}>{i18n(cfg.locale).pages.error.home || "Return to Homepage"}</a>
    </article>
  )
}

export default (() => NotFound) satisfies QuartzComponentConstructor
