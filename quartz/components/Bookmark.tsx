// @ts-ignore
import script from "./scripts/bookmark.inline"
import style from "./styles/bookmark.scss"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { i18n } from "../i18n"

export default (() => {
	function Bookmark({ fileData, cfg }: QuartzComponentProps) {
		const slug = fileData.slug
		return (
			<button
				id="bookmark-btn"
				class="bookmark-btn"
				data-slug={slug}
				title={i18n(cfg.locale).components.bookmark?.tooltip ?? ""}
				aria-label={i18n(cfg.locale).components.bookmark?.title ?? "Bookmark"}
			>
				<svg
					class="bookmark-icon"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
				</svg>
				<span class="bookmark-text">{i18n(cfg.locale).components.bookmark?.title ?? "Bookmark"}</span>
			</button>
		)
	}

	Bookmark.css = style
	Bookmark.afterDOMLoaded = script

	return Bookmark
}) satisfies QuartzComponentConstructor