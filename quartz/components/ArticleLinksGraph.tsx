import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-expect-error importing inline script
import script from "./scripts/articleLinksGraph.inline"
import style from "./styles/articleLinksGraph.scss"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"

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
	localGraph: Partial<D3Config> | undefined
}

const defaultOptions: GraphOptions = {
	localGraph: {
		drag: true,
		zoom: true,
		depth: 1,
		scale: 1.1,
		repelForce: 0.5,
		centerForce: 0.3,
		linkDistance: 30,
		fontSize: 0.6,
		opacityScale: 1,
		showTags: true,
		removeTags: [],
		focusOnHover: false,
		enableRadial: false,
	},
}

export default ((opts?: Partial<GraphOptions>) => {
	const ArticleLinksGraph: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
		const localGraph = { ...defaultOptions.localGraph, ...opts?.localGraph }
		return (
			<div class={classNames(displayClass, "graph")}>
				<button
					class="graph-trigger-button"
					aria-label={i18n(cfg.locale).components.articleLinksGraph?.title || "See links"}
					title={i18n(cfg.locale).components.articleLinksGraph?.tooltip || ""}>
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
						class="lucide lucide-link-icon lucide-link">
						<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
						<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
					</svg>
					<span class="graph-text">{i18n(cfg.locale).components.articleLinksGraph?.title || "See links"}</span>
				</button>
				<div class="graph-container-outer">
					<div class="graph-container" data-cfg={JSON.stringify(localGraph)}></div>
					<button class="graph-close-button" aria-label="Close Graph">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</div>
			</div>
		)
	}

	ArticleLinksGraph.css = style
	ArticleLinksGraph.afterDOMLoaded = script

	return ArticleLinksGraph
}) satisfies QuartzComponentConstructor
