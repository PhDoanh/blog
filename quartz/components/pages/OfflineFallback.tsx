import { i18n } from "../../i18n"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

const OfflineFallback: QuartzComponent = (cfg: QuartzComponentProps) => {
	const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
	const baseDir = url.pathname + "/"

	return (
		<article class="popover-hint">
			<p>{i18n(cfg.locale).pages.offlineFallback?.description || "Check your connection and try again. Or read pages you've bookmarked while offline."}</p>
			<a href={baseDir}>{i18n(cfg.locale).pages.offlineFallback?.home || "Return to Homepage"}</a>
		</article>
	)
}

export default (() => OfflineFallback) satisfies QuartzComponentConstructor
