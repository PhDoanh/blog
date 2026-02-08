// @ts-expect-error TS1208
import script from "./scripts/bookmark.inline"
import style from "./styles/bookmark.scss"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"

export default (() => {
	function Bookmark({ fileData, cfg, displayClass }: QuartzComponentProps) {
		const slug = fileData.slug
		return (
			<button
				id="bookmark-btn"
				class={classNames(displayClass, "bookmark-btn")}
				data-slug={slug}
				title={i18n(cfg.locale).components.bookmark?.tooltip ?? ""}
				aria-label={i18n(cfg.locale).components.bookmark?.title ?? "Bookmark"}
			>
				<svg
					class="bookmark-icon"
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3" />
					<path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4" />
					<path d="M5 21h14" />
				</svg>
				<span class="bookmark-text">{i18n(cfg.locale).components.bookmark?.title ?? "Bookmark"}</span>
			</button>
		)
	}

	Bookmark.css = style
	Bookmark.afterDOMLoaded = script

	return Bookmark
}) satisfies QuartzComponentConstructor