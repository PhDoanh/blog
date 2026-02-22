import { QuartzTransformerPlugin } from "../types"
import { BuildCtx } from "../../util/ctx"
import { visit } from "unist-util-visit"

export interface MarkerConfig {
	// CSS class add to element
	className?: string
	// data-* attributes: key "foo" -> data-foo="value"
	dataAttrs?: Record<string, string>
	// Target HTML Tag (default: "table")
	targetTag?: string
}

export interface Options {
	markers: Record<string, MarkerConfig>
	tabulatorOptions?: Record<string, any>
}

const defaultOptions: Options = {
	markers: {
		// Activate Tabulator on the next <table>
		tabulator: {
			dataAttrs: { tabulator: "true" },
			targetTag: "table",
		},
		"tabulator-nopager": {
			dataAttrs: { tabulator: "true", "tabulator-pagination": "false" },
			targetTag: "table",
		},
		// CSS-only: compact table
		// compact: {
		//   className: "table-compact",
		//   targetTag: "table",
		// },
	},
	tabulatorOptions: {
		layout: "fitColumns",
		pagination: true,
		paginationSize: 20,
		paginationSizeSelector: [10, 20, 50, 100],
		movableColumns: true,
		responsiveLayout: "collapse",
	},
}

export const CommentMarker: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
	const opts: Options = {
		markers: { ...defaultOptions.markers, ...(userOpts?.markers ?? {}) },
		tabulatorOptions: { ...defaultOptions.tabulatorOptions, ...(userOpts?.tabulatorOptions ?? {}) },
	}

	return {
		name: "CommentMarker",

		// Transform markdown content AST to inject attributes based on comment markers
		htmlPlugins(_ctx: BuildCtx) {
			return [
				() => (tree: any) => {
					visit(tree, "comment", (node: any, index: number | undefined, parent: any) => {
						if (index === null || !parent) return

						const markerName = (node.value as string).trim()
						const config = opts.markers[markerName]
						if (!config) return

						const targetTag = config.targetTag ?? "table"

						// Skip text nodes to find the next element sibling
						let nextIdx = index + 1
						while (
							nextIdx < parent.children.length &&
							parent.children[nextIdx].type === "text"
						) {
							nextIdx++
						}
						const next = parent.children[nextIdx]
						if (!next || next.type !== "element" || next.tagName !== targetTag) return

						// Inject className
						if (config.className) {
							const existing = next.properties?.className ?? []
							next.properties = {
								...next.properties,
								className: [
									...(Array.isArray(existing) ? existing : [existing]),
									config.className,
								],
							}
						}

						// Inject data-* attributes
						if (config.dataAttrs) {
							for (const [k, v] of Object.entries(config.dataAttrs)) {
								next.properties = { ...next.properties, [`data-${k}`]: v }
							}
						}

						// Remove comment node from AST after processing
						parent.children.splice(index, 1)
					})
				},
			]
		},

		// Inject Tabulator CSS/JS into all pages (load once, then cache)
		externalResources(_ctx: BuildCtx) {
			const { cfg } = _ctx

			return {
				css: [
					{
						content: "https://unpkg.com/tabulator-tables@6.3.1/dist/css/tabulator.min.css",
						inline: false,
						spaPreserve: true,
					},
					{
						content: `${cfg.configuration.baseUrl}/static/tabulator-quartz.css`,
						inline: false,
						spaPreserve: true,
					},
				],
				js: [
					{
						src: "https://unpkg.com/tabulator-tables@6.3.1/dist/js/tabulator.min.js",
						contentType: "external" as const,
						loadTime: "afterDOMReady" as const,
						spaPreserve: true,
					},
					{
						contentType: "inline" as const,
						loadTime: "afterDOMReady" as const,
						spaPreserve: true,
						script: `
						window.__tabulatorDefaults = ${JSON.stringify(opts.tabulatorOptions ?? {})};
						`.trim(),
					},
					{
						contentType: "inline" as const,
						loadTime: "afterDOMReady" as const,
						spaPreserve: true,
						script: `
						(function () {
							// Apply global defaults once
							if (window.__tabulatorDefaults && window.Tabulator) {
								Object.assign(Tabulator.defaultOptions, window.__tabulatorDefaults)
								window.__tabulatorDefaults = null // only apply once
							}

							function initTabulator() {
								document.querySelectorAll("table[data-tabulator]").forEach(function (tableEl) {
									if (tableEl.dataset.tabulatorInit) return
									tableEl.dataset.tabulatorInit = "1"

									var headers = Array.from(tableEl.querySelectorAll("thead th")).map(function (th, i) {
										return {
											title: th.textContent.trim(),
											field: "col" + i,
											headerFilter: "input",
											formatter: "html",
										}
									})

									var data = Array.from(tableEl.querySelectorAll("tbody tr")).map(function (tr) {
										var cells = tr.querySelectorAll("td")
										return headers.reduce(function (row, col, i) {
											row[col.field] = cells[i] ? cells[i].innerHTML.trim() : ""
											return row
										}, {})
									})

									var container = document.createElement("div")
									container.className = "tabulator-container"
									tableEl.insertAdjacentElement("afterend", container)
									tableEl.style.display = "none"
									tableEl.setAttribute("aria-hidden", "true")

									// Per-table override from data attributes (if any)
									var perTableOpts = {}
									if (tableEl.dataset.tabulatorPagination === "false") {
										perTableOpts.pagination = false
									}

									new Tabulator(container, {
										data: data,
										columns: headers,
										...perTableOpts,
									})
								})
							}

							initTabulator()
							document.addEventListener("nav", initTabulator)
						})()
						`.trim(),
					},
				],
			}
		},
	}
}
