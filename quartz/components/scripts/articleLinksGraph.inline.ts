import type { ContentDetails } from "../../plugins/emitters/contentIndex"
import {
	SimulationNodeDatum,
	SimulationLinkDatum,
	Simulation,
	forceSimulation,
	forceManyBody,
	forceCenter,
	forceLink,
	forceCollide,
	forceRadial,
	zoomIdentity,
	select,
	drag,
	zoom,
} from "d3"
import { Text, Graphics, Application, Container, Circle } from "pixi.js"
import { Group as TweenGroup, Tween as Tweened } from "@tweenjs/tween.js"
import { registerEscapeHandler, removeAllChildren } from "./util"
import { FullSlug, SimpleSlug, resolveRelative, simplifySlug } from "../../util/path"
import { D3Config } from "../ArticleLinksGraph"

type GraphicsInfo = {
	color: string
	gfx: Graphics
	alpha: number
	active: boolean
}

type NodeData = {
	id: SimpleSlug
	text: string
	tags: string[]
} & SimulationNodeDatum

type SimpleLinkData = {
	source: SimpleSlug
	target: SimpleSlug
}

type LinkData = {
	source: NodeData
	target: NodeData
} & SimulationLinkDatum<NodeData>

type LinkRenderData = GraphicsInfo & {
	simulationData: LinkData
}

type NodeRenderData = GraphicsInfo & {
	simulationData: NodeData
	label: Text
}

type GraphHandle = {
	cleanup: () => void
	setVisible: (visible: boolean) => void
}

const localStorageKey = "graph-visited"
function getVisited(): Set<SimpleSlug> {
	return new Set(JSON.parse(localStorage.getItem(localStorageKey) ?? "[]"))
}

function addToVisited(slug: SimpleSlug) {
	const visited = getVisited()
	visited.add(slug)
	localStorage.setItem(localStorageKey, JSON.stringify([...visited]))
}

type TweenNode = {
	update: (time: number) => void
	stop: () => void
}

// Cache result across navigations — hardware capability doesn't change
let cachedGraphicsAPI: "webgpu" | "webgl" | null = null

// workaround for pixijs webgpu issue: https://github.com/pixijs/pixijs/issues/11389
async function determineGraphicsAPI(): Promise<"webgpu" | "webgl"> {
	if (cachedGraphicsAPI) return cachedGraphicsAPI

	const adapter = await navigator.gpu?.requestAdapter().catch(() => null)
	const device = adapter && (await adapter.requestDevice().catch(() => null))
	if (!device) {
		cachedGraphicsAPI = "webgl"
		return "webgl"
	}

	const canvas = document.createElement("canvas")
	const gl =
		(canvas.getContext("webgl2") as WebGL2RenderingContext | null) ??
		(canvas.getContext("webgl") as WebGLRenderingContext | null)

	// we have to return webgl so pixijs automatically falls back to canvas
	if (!gl) {
		cachedGraphicsAPI = "webgl"
		return "webgl"
	}

	const webglMaxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)
	const webgpuMaxTextures = device.limits.maxSampledTexturesPerShaderStage

	// Cleanup the probe context to avoid leaking WebGL contexts (mobile has limited slots)
	gl.getExtension("WEBGL_lose_context")?.loseContext()

	cachedGraphicsAPI = webglMaxTextures === webgpuMaxTextures ? "webgpu" : "webgl"
	return cachedGraphicsAPI
}

async function renderGraph(graph: HTMLElement, fullSlug: FullSlug): Promise<GraphHandle> {
	const slug = simplifySlug(fullSlug)
	const visited = getVisited()
	removeAllChildren(graph)

	// DEBUG: verify container dimensions at render time
	console.debug("[graph] renderGraph called", {
		slug,
		offsetWidth: graph.offsetWidth,
		offsetHeight: graph.offsetHeight,
		visibility: getComputedStyle(graph).visibility,
		display: getComputedStyle(graph.parentElement!).display,
	})

	let {
		drag: enableDrag,
		zoom: enableZoom,
		depth,
		scale,
		repelForce,
		centerForce,
		linkDistance,
		fontSize,
		opacityScale,
		removeTags,
		showTags,
		focusOnHover,
		enableRadial,
	} = JSON.parse(graph.dataset["cfg"]!) as D3Config

	const data: Map<SimpleSlug, ContentDetails> = new Map(
		Object.entries<ContentDetails>(await fetchData).map(([k, v]) => [
			simplifySlug(k as FullSlug),
			v,
		]),
	)

	// DEBUG: verify data loaded
	console.debug("[graph] fetchData resolved, entries:", data.size)

	const links: SimpleLinkData[] = []
	const tags: SimpleSlug[] = []
	const validLinks = new Set(data.keys())

	const tweens = new Map<string, TweenNode>()
	for (const [source, details] of data.entries()) {
		const outgoing = details.links ?? []

		for (const dest of outgoing) {
			if (validLinks.has(dest)) {
				links.push({ source: source, target: dest })
			}
		}

		if (showTags) {
			const localTags = details.tags
				.filter((tag) => !removeTags.includes(tag))
				.map((tag) => simplifySlug(("tags/" + tag) as FullSlug))

			tags.push(...localTags.filter((tag) => !tags.includes(tag)))

			for (const tag of localTags) {
				links.push({ source: source, target: tag })
			}
		}
	}

	// Precompute adjacency map for O(1) BFS lookups instead of O(n) filter per node
	const adjacency = new Map<SimpleSlug, { out: SimpleSlug[]; in: SimpleSlug[] }>()
	for (const link of links) {
		if (!adjacency.has(link.source)) adjacency.set(link.source, { out: [], in: [] })
		if (!adjacency.has(link.target)) adjacency.set(link.target, { out: [], in: [] })
		adjacency.get(link.source)!.out.push(link.target)
		adjacency.get(link.target)!.in.push(link.source)
	}

	const neighbourhood = new Set<SimpleSlug>()
	// FIX #1 (BFS infinite loop): use a separate mutable depth counter
	// so the original config value isn't mutated across multiple BFS iterations.
	// The original code mutated `depth` from the destructured D3Config which
	// caused the sentinel counter to decrement the shared variable.
	let remainingDepth = depth
	const wl: (SimpleSlug | "__SENTINEL")[] = [slug, "__SENTINEL"]
	if (remainingDepth >= 0) {
		while (remainingDepth >= 0 && wl.length > 0) {
			const cur = wl.shift()!
			if (cur === "__SENTINEL") {
				remainingDepth--
				if (remainingDepth >= 0) wl.push("__SENTINEL")
			} else {
				if (!neighbourhood.has(cur)) {
					neighbourhood.add(cur)
					const adj = adjacency.get(cur)
					if (adj) {
						const newNodes = [...adj.out, ...adj.in].filter((n) => !neighbourhood.has(n))
						wl.push(...newNodes)
					}
				}
			}
		}
	} else {
		validLinks.forEach((id) => neighbourhood.add(id))
		if (showTags) tags.forEach((tag) => neighbourhood.add(tag))
	}

	// DEBUG: BFS result
	console.debug("[graph] BFS neighbourhood size:", neighbourhood.size, "depth:", depth)

	const nodes = [...neighbourhood].map((url) => {
		const text = url.startsWith("tags/") ? "#" + url.substring(5) : (data.get(url)?.title ?? url)
		return {
			id: url,
			text,
			tags: data.get(url)?.tags ?? [],
		}
	})
	const graphData: { nodes: NodeData[]; links: LinkData[] } = {
		nodes,
		links: links
			.filter((l) => neighbourhood.has(l.source) && neighbourhood.has(l.target))
			.map((l) => ({
				source: nodes.find((n) => n.id === l.source)!,
				target: nodes.find((n) => n.id === l.target)!,
			})),
	}

	// DEBUG: graph data
	console.debug("[graph] graphData nodes:", graphData.nodes.length, "links:", graphData.links.length)

	// Precompute node radii once — reused for hitArea, circle draw, and forceCollide
	const nodeRadiusMap = new Map<SimpleSlug, number>()
	for (const node of graphData.nodes) {
		const adj = adjacency.get(node.id)
		const numLinks = (adj?.out.length ?? 0) + (adj?.in.length ?? 0)
		nodeRadiusMap.set(node.id, 2 + Math.sqrt(numLinks))
	}
	const nodeRadius = (d: NodeData) => nodeRadiusMap.get(d.id) ?? 2

	// FIX #2 (width=0/height=0): graph-container is hidden (visibility:hidden +
	// opacity:0) when renderGraph runs lazily on first click, so offsetWidth/
	// offsetHeight are both 0 — Pixi creates a 0×0 canvas and nothing renders.
	// Solution: read dimensions from the viewport instead.
	const width = graph.offsetWidth || window.innerWidth
	const height = graph.offsetHeight || window.innerHeight

	// DEBUG: final canvas dimensions used
	console.debug("[graph] canvas dimensions:", { width, height })

	// we virtualize the simulation and use pixi to actually render it
	const simulation: Simulation<NodeData, LinkData> = forceSimulation<NodeData>(graphData.nodes)
		.force("charge", forceManyBody().strength(-100 * repelForce))
		.force("center", forceCenter().strength(centerForce))
		.force("link", forceLink(graphData.links).distance(linkDistance))
		.force("collide", forceCollide<NodeData>((n) => nodeRadius(n)).iterations(3))

	const radius = (Math.min(width, height) / 2) * 0.8
	if (enableRadial) simulation.force("radial", forceRadial(radius).strength(0.2))

	// precompute style prop strings as pixi doesn't support css variables
	const cssVars = [
		"--secondary",
		"--tertiary",
		"--gray",
		"--light",
		"--lightgray",
		"--dark",
		"--darkgray",
		"--bodyFont",
	] as const
	const computedStyleMap = cssVars.reduce(
		(acc, key) => {
			acc[key] = getComputedStyle(document.documentElement).getPropertyValue(key)
			return acc
		},
		{} as Record<(typeof cssVars)[number], string>,
	)

	// calculate color
	const color = (d: NodeData) => {
		const isCurrent = d.id === slug
		if (isCurrent) {
			return computedStyleMap["--secondary"]
		} else if (visited.has(d.id) || d.id.startsWith("tags/")) {
			return computedStyleMap["--tertiary"]
		} else {
			return computedStyleMap["--gray"]
		}
	}

	let hoveredNodeId: string | null = null
	let hoveredNeighbours: Set<string> = new Set()
	const linkRenderData: LinkRenderData[] = []
	const nodeRenderData: NodeRenderData[] = []
	function updateHoverInfo(newHoveredId: string | null) {
		hoveredNodeId = newHoveredId

		if (newHoveredId === null) {
			hoveredNeighbours = new Set()
			for (const n of nodeRenderData) {
				n.active = false
			}

			for (const l of linkRenderData) {
				l.active = false
			}
		} else {
			hoveredNeighbours = new Set()
			for (const l of linkRenderData) {
				const linkData = l.simulationData
				if (linkData.source.id === newHoveredId || linkData.target.id === newHoveredId) {
					hoveredNeighbours.add(linkData.source.id)
					hoveredNeighbours.add(linkData.target.id)
				}

				l.active = linkData.source.id === newHoveredId || linkData.target.id === newHoveredId
			}

			for (const n of nodeRenderData) {
				n.active = hoveredNeighbours.has(n.simulationData.id)
			}
		}
	}

	let dragStartTime = 0
	let dragging = false

	function renderLinks() {
		tweens.get("link")?.stop()
		const tweenGroup = new TweenGroup()

		for (const l of linkRenderData) {
			let alpha = 1

			// if we are hovering over a node, we want to highlight the immediate neighbours
			// with full alpha and the rest with default alpha
			if (hoveredNodeId) {
				alpha = l.active ? 1 : 0.2
			}

			l.color = l.active ? computedStyleMap["--gray"] : computedStyleMap["--lightgray"]
			tweenGroup.add(new Tweened<LinkRenderData>(l).to({ alpha }, 200))
		}

		tweenGroup.getAll().forEach((tw) => tw.start())
		tweens.set("link", {
			update: tweenGroup.update.bind(tweenGroup),
			stop() {
				tweenGroup.getAll().forEach((tw) => tw.stop())
			},
		})
	}

	function renderLabels() {
		tweens.get("label")?.stop()
		const tweenGroup = new TweenGroup()

		const defaultScale = 1 / scale
		const activeScale = defaultScale * 1.1
		for (const n of nodeRenderData) {
			const nodeId = n.simulationData.id

			if (hoveredNodeId === nodeId) {
				tweenGroup.add(
					new Tweened<Text>(n.label).to(
						{
							alpha: 1,
							scale: { x: activeScale, y: activeScale },
						},
						100,
					),
				)
			} else {
				tweenGroup.add(
					new Tweened<Text>(n.label).to(
						{
							alpha: n.label.alpha,
							scale: { x: defaultScale, y: defaultScale },
						},
						100,
					),
				)
			}
		}

		tweenGroup.getAll().forEach((tw) => tw.start())
		tweens.set("label", {
			update: tweenGroup.update.bind(tweenGroup),
			stop() {
				tweenGroup.getAll().forEach((tw) => tw.stop())
			},
		})
	}

	function renderNodes() {
		tweens.get("hover")?.stop()

		const tweenGroup = new TweenGroup()
		for (const n of nodeRenderData) {
			let alpha = 1

			// if we are hovering over a node, we want to highlight the immediate neighbours
			if (hoveredNodeId !== null && focusOnHover) {
				alpha = n.active ? 1 : 0.2
			}

			tweenGroup.add(new Tweened<Graphics>(n.gfx, tweenGroup).to({ alpha }, 200))
		}

		tweenGroup.getAll().forEach((tw) => tw.start())
		tweens.set("hover", {
			update: tweenGroup.update.bind(tweenGroup),
			stop() {
				tweenGroup.getAll().forEach((tw) => tw.stop())
			},
		})
	}

	function renderPixiFromD3() {
		renderNodes()
		renderLinks()
		renderLabels()
	}

	tweens.forEach((tween) => tween.stop())
	tweens.clear()

	const pixiPreference = await determineGraphicsAPI()
	const app = new Application()
	await app.init({
		width,
		height,
		antialias: true,
		autoStart: false,
		autoDensity: true,
		backgroundAlpha: 0,
		preference: pixiPreference,
		resolution: window.devicePixelRatio,
		eventMode: "static",
	})

	// DEBUG: verify Pixi canvas size
	console.debug("[graph] Pixi app initialized", {
		rendererType: app.renderer.type,
		canvasWidth: app.canvas.width,
		canvasHeight: app.canvas.height,
	})

	graph.appendChild(app.canvas)

	const stage = app.stage
	stage.interactive = false

	const labelsContainer = new Container<Text>({ zIndex: 3, isRenderGroup: true })
	const nodesContainer = new Container<Graphics>({ zIndex: 2, isRenderGroup: true })
	const linkContainer = new Container<Graphics>({ zIndex: 1, isRenderGroup: true })
	stage.addChild(nodesContainer, labelsContainer, linkContainer)

	for (const n of graphData.nodes) {
		const nodeId = n.id

		const label = new Text({
			interactive: false,
			eventMode: "none",
			text: n.text,
			alpha: 0,
			anchor: { x: 0.5, y: 1.2 },
			style: {
				fontSize: fontSize * 15,
				fill: computedStyleMap["--dark"],
				fontFamily: computedStyleMap["--bodyFont"],
			},
			resolution: window.devicePixelRatio * 4,
		})
		label.scale.set(1 / scale)

		let oldLabelOpacity = 0
		const isTagNode = nodeId.startsWith("tags/")
		const gfx = new Graphics({
			interactive: true,
			label: nodeId,
			eventMode: "static",
			hitArea: new Circle(0, 0, nodeRadius(n)),
			cursor: "pointer",
		})
			.circle(0, 0, nodeRadius(n))
			.fill({ color: isTagNode ? computedStyleMap["--light"] : color(n) })
			.on("pointerover", (e) => {
				updateHoverInfo(e.target.label)
				oldLabelOpacity = label.alpha
				if (!dragging) {
					renderPixiFromD3()
				}
			})
			.on("pointerleave", () => {
				updateHoverInfo(null)
				label.alpha = oldLabelOpacity
				if (!dragging) {
					renderPixiFromD3()
				}
			})

		if (isTagNode) {
			gfx.stroke({ width: 2, color: computedStyleMap["--tertiary"] })
		}

		nodesContainer.addChild(gfx)
		labelsContainer.addChild(label)

		const nodeRenderDatum: NodeRenderData = {
			simulationData: n,
			gfx,
			label,
			color: color(n),
			alpha: 1,
			active: false,
		}

		nodeRenderData.push(nodeRenderDatum)
	}

	for (const l of graphData.links) {
		const gfx = new Graphics({ interactive: false, eventMode: "none" })
		linkContainer.addChild(gfx)

		const linkRenderDatum: LinkRenderData = {
			simulationData: l,
			gfx,
			color: computedStyleMap["--lightgray"],
			alpha: 1,
			active: false,
		}

		linkRenderData.push(linkRenderDatum)
	}

	let currentTransform = zoomIdentity
	if (enableDrag) {
		select<HTMLCanvasElement, NodeData | undefined>(app.canvas).call(
			drag<HTMLCanvasElement, NodeData | undefined>()
				.container(() => app.canvas)
				.subject(() => graphData.nodes.find((n) => n.id === hoveredNodeId))
				.on("start", function dragstarted(event) {
					if (!event.active) simulation.alphaTarget(1).restart()
					event.subject.fx = event.subject.x
					event.subject.fy = event.subject.y
					event.subject.__initialDragPos = {
						x: event.subject.x,
						y: event.subject.y,
						fx: event.subject.fx,
						fy: event.subject.fy,
					}
					dragStartTime = Date.now()
					dragging = true
				})
				.on("drag", function dragged(event) {
					const initPos = event.subject.__initialDragPos
					event.subject.fx = initPos.x + (event.x - initPos.x) / currentTransform.k
					event.subject.fy = initPos.y + (event.y - initPos.y) / currentTransform.k
				})
				.on("end", function dragended(event) {
					if (!event.active) simulation.alphaTarget(0)
					event.subject.fx = null
					event.subject.fy = null
					dragging = false

					// if the time between mousedown and mouseup is short, we consider it a click
					if (Date.now() - dragStartTime < 500) {
						const node = graphData.nodes.find((n) => n.id === event.subject.id) as NodeData
						const targ = resolveRelative(fullSlug, node.id)
						window.spaNavigate(new URL(targ, window.location.toString()))
					}
				}),
		)
	} else {
		for (const node of nodeRenderData) {
			node.gfx.on("click", () => {
				const targ = resolveRelative(fullSlug, node.simulationData.id)
				window.spaNavigate(new URL(targ, window.location.toString()))
			})
		}
	}

	if (enableZoom) {
		select<HTMLCanvasElement, NodeData>(app.canvas).call(
			zoom<HTMLCanvasElement, NodeData>()
				.extent([
					[0, 0],
					[width, height],
				])
				.scaleExtent([0.25, 4])
				.on("zoom", ({ transform }) => {
					currentTransform = transform
					stage.scale.set(transform.k, transform.k)
					stage.position.set(transform.x, transform.y)

					// zoom adjusts opacity of labels too
					const scale = transform.k * opacityScale
					let scaleOpacity = Math.max((scale - 1) / 3.75, 0)
					const activeNodes = nodeRenderData.filter((n) => n.active).flatMap((n) => n.label)

					for (const label of labelsContainer.children) {
						if (!activeNodes.includes(label)) {
							label.alpha = scaleOpacity
						}
					}
				}),
		)
	}

	let stopAnimation = false
	let isGraphVisible = false

	function animate(time: number) {
		if (stopAnimation) return
		requestAnimationFrame(animate)

		// Pause rendering when graph is hidden — avoids wasting CPU/GPU every frame
		if (!isGraphVisible) return

		for (const n of nodeRenderData) {
			const { x, y } = n.simulationData
			if (!x || !y) continue
			n.gfx.position.set(x + width / 2, y + height / 2)
			if (n.label) {
				n.label.position.set(x + width / 2, y + height / 2)
			}
		}

		for (const l of linkRenderData) {
			const linkData = l.simulationData
			l.gfx.clear()
			l.gfx.moveTo(linkData.source.x! + width / 2, linkData.source.y! + height / 2)
			l.gfx
				.lineTo(linkData.target.x! + width / 2, linkData.target.y! + height / 2)
				.stroke({ alpha: l.alpha, width: 1, color: l.color })
		}

		tweens.forEach((t) => t.update(time))
		app.renderer.render(stage)
	}

	requestAnimationFrame(animate)

	// Pause rendering when the browser tab is hidden
	const handleVisibilityChange = () => {
		if (document.hidden) isGraphVisible = false
	}
	document.addEventListener("visibilitychange", handleVisibilityChange)

	return {
		cleanup: () => {
			stopAnimation = true
			document.removeEventListener("visibilitychange", handleVisibilityChange)
			app.destroy()
		},
		setVisible: (visible: boolean) => {
			isGraphVisible = visible
			console.debug("[graph] setVisible:", visible)
		},
	}
}

let graphHandle: GraphHandle | null = null

function cleanupGraph() {
	if (graphHandle) {
		graphHandle.cleanup()
		graphHandle = null
	}
}

document.addEventListener("nav", async (e: CustomEventMap["nav"]) => {
	const slug = e.detail.url
	addToVisited(simplifySlug(slug))

	const graphContainers = document.querySelectorAll(".graph-container") as NodeListOf<HTMLElement>
	const graphContainerOuters = document.querySelectorAll(".graph-container-outer") as NodeListOf<HTMLElement>
	const triggerButtons = document.querySelectorAll(".graph-trigger-button") as NodeListOf<HTMLElement>
	const closeButtons = document.querySelectorAll(".graph-close-button") as NodeListOf<HTMLElement>

	console.debug("[graph] nav event", { slug, containers: graphContainers.length, triggers: triggerButtons.length })

	let graphInitialized = false

	async function initAndShowGraph() {
		console.debug("[graph] initAndShowGraph called, initialized:", graphInitialized)
		if (!graphInitialized) {
			// FIX #3 (setVisible race): show the overlay BEFORE renderGraph so that
			// offsetWidth/offsetHeight return real viewport dimensions, not 0.
			// The container must be visible when we read its size.
			for (const container of graphContainerOuters) {
				container.classList.add("active")
			}
			cleanupGraph()
			for (const container of graphContainers) {
				graphHandle = await renderGraph(container, slug)
			}
			graphInitialized = true
		}
		graphHandle?.setVisible(true)
		// Ensure overlay is active (idempotent if already added above)
		for (const container of graphContainerOuters) {
			container.classList.add("active")
		}
		console.debug("[graph] graph shown, handle:", graphHandle)
	}

	function hideGraph() {
		graphHandle?.setVisible(false)
		for (const container of graphContainerOuters) {
			container.classList.remove("active")
		}
		// Remove will-change after transition completes
		const closeBtn = document.querySelector(".graph-close-button") as HTMLElement | null
		if (closeBtn) setTimeout(() => { closeBtn.style.willChange = "auto" }, 300)
	}

	// Handle theme changes — only re-render if graph is currently visible
	const handleThemeChange = () => {
		const isOpen = [...graphContainerOuters].some((c) => c.classList.contains("active"))
		if (isOpen) {
			graphInitialized = false
			cleanupGraph()
			void initAndShowGraph()
		} else {
			// Force re-init on next open to pick up new theme colors
			graphInitialized = false
			cleanupGraph()
		}
	}

	document.addEventListener("themechange", handleThemeChange)
	window.addCleanup(() => {
		document.removeEventListener("themechange", handleThemeChange)
	})

	triggerButtons.forEach((button) => {
		button.addEventListener("click", () => {
			// Apply will-change just before animation
			const closeBtn = document.querySelector(".graph-close-button") as HTMLElement | null
			if (closeBtn) closeBtn.style.willChange = "opacity"
			void initAndShowGraph()
		})
	})

	closeButtons.forEach((button) => {
		button.addEventListener("click", hideGraph)
	})

	for (const container of graphContainerOuters) {
		registerEscapeHandler(container, hideGraph)
	}

	window.addCleanup(() => {
		triggerButtons.forEach((button) => {
			button.removeEventListener("click", () => void initAndShowGraph())
		})
		closeButtons.forEach((button) => {
			button.removeEventListener("click", hideGraph)
		})
		cleanupGraph()
	})
})
