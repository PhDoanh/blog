// @ts-expect-error TS1208
import script from "./scripts/translate.inline"
import style from "./styles/translate.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { i18n } from "../i18n"

interface TranslateOptions {
	languages: string[],
	defaultLanguage?: string,
}

const defaultOptions: TranslateOptions = {
	languages: ["en", "vi", "ja"],
	defaultLanguage: "en",
}

export default ((opts?: Partial<TranslateOptions>) => {
	const options = {
		...defaultOptions,
		...opts
	}

	const Translate: QuartzComponent = (props: QuartzComponentProps) => {
		return (
			<div className="language-switcher">
				<button
					className="language-button"
					id="language-button"
					aria-label={i18n(props.cfg.locale).components.translate?.title ?? "Translate"}
					title={i18n(props.cfg.locale).components.translate?.tooltip ?? ""}
					data-languages={JSON.stringify(options.languages)}
					data-default-language={options.defaultLanguage}
					data-current-path={props.fileData.slug ?? ""}
					data-locale={props.cfg.locale}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-languages-icon lucide-languages">
						<path d="m5 8 6 6" />
						<path d="m4 14 6-6 2-3" />
						<path d="M2 5h12" />
						<path d="M7 2h1" />
						<path d="m22 22-5-10-5 10" />
						<path d="M14 18h6" />
					</svg>
					<span className="language-text">{i18n(props.cfg.locale).components.translate?.title ?? "Translate"}</span>
				</button>
			</div>
		)
	}

	Translate.css = style
	Translate.afterDOMLoaded = script

	return Translate
}) satisfies QuartzComponentConstructor