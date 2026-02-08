// @ts-expect-error importing inline script
import script from "./scripts/mediaShare.inline"
import style from "./styles/mediaShare.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"

interface MediaShareOptions {
	platforms: string[],
	copyButton?: boolean,
}

const defaultOptions: MediaShareOptions = {
	platforms: ["facebook", "linkedin", "reddit"],
	copyButton: true,
}

export default ((opts?: Partial<MediaShareOptions>) => {
	const options = opts ?? defaultOptions

	const MediaShare: QuartzComponent = ({cfg, displayClass, fileData}: QuartzComponentProps) => {
		// Lấy FullSlug từ props.fileData và tạo URL đầy đủ
		const baseUrl = cfg.baseUrl ?? ""
		const fullSlug = fileData.slug ?? ""
		const fullUrl = `https://${baseUrl}/${fullSlug}`

		return (
			<button
				className={classNames(displayClass, "share-button")} 
				aria-label={i18n(cfg.locale).components.mediaShare?.title ?? "Share"}
				title={i18n(cfg.locale).components.mediaShare?.tooltip ?? ""}
				data-url={fullUrl}
				data-platforms={JSON.stringify(options.platforms)}
				data-show-copy={options.copyButton}
				data-locale={cfg.locale}
			>
				<svg
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
					<circle cx="18" cy="5" r="3" />
					<circle cx="6" cy="12" r="3" />
					<circle cx="18" cy="19" r="3" />
					<line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
					<line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
				</svg>
				<span className="share-text">{i18n(cfg.locale).components.mediaShare?.title ?? "Share"}</span>
			</button>
		)
	}

	MediaShare.css = style
	MediaShare.afterDOMLoaded = script

	return MediaShare
}) satisfies QuartzComponentConstructor
