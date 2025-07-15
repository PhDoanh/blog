import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import script from "./scripts/graph2.inline"
import style from "./styles/graph2.scss"
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
	config: Partial<D3Config> | undefined
}

const defaultOptions: GraphOptions = {
	config: {
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
	const Graph2: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
		const config = { ...defaultOptions.config, ...opts?.config }
		return (
			<div class={classNames(displayClass, "graph")}>
				<button class="graph-trigger-button" aria-label={i18n(cfg.locale).components.graph.title} title={i18n(cfg.locale).components.graph.tooltip}>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-git-fork-icon lucide-git-fork">
						<circle cx="12" cy="18" r="3" />
						<circle cx="6" cy="6" r="3" />
						<circle cx="18" cy="6" r="3" />
						<path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9" />
						<path d="M12 12v3" />
					</svg>
					<span class="graph-text">{i18n(cfg.locale).components.graph.title}</span>
				</button>
				<div class="graph-container-outer">
					<div class="graph-container" data-cfg={JSON.stringify(config)}></div>
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

	Graph2.css = style
	Graph2.afterDOMLoaded = script

	return Graph2
}) satisfies QuartzComponentConstructor
