import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import script from "./scripts/graph2.inline"
import style from "./styles/graph2.scss"
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
	const Graph2: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
		const config = { ...defaultOptions.config, ...opts?.config }
		return (
			<div class={classNames(displayClass, "graph")}>
				<div class="graph-trigger-button" aria-label="Expand Graph" title="Graph view">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chart-network-icon lucide-chart-network">
						<path d="m13.11 7.664 1.78 2.672" /><path d="m14.162 12.788-3.324 1.424" /><path d="m20 4-6.06 1.515" /><path d="M3 3v16a2 2 0 0 0 2 2h16" /><circle cx="12" cy="6" r="2" /><circle cx="16" cy="12" r="2" /><circle cx="9" cy="15" r="2" />
					</svg>
				</div>
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
