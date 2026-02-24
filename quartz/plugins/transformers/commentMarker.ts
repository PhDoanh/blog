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
	tabulatorOptions?: Record<string, any>
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
		"tabulator-resources-hub": {
			dataAttrs: { tabulator: "true" },
			targetTag: "table",
			tabulatorOptions: {
				layout: "fitColumns",
				responsiveLayout: "collapse",
				responsiveLayoutCollapseStartOpen: false,
				columnDefaults: {
					minWidth: 30,
				},
				pagination: true,
				paginationSize: 25,
				paginationSizeSelector: [10, 25, 50],
				movableColumns: false,
				selectable: false,
				rowHeader: {
					formatter: "responsiveCollapse",
					width: 30,
					minWidth: 30,
					hozAlign: "center",
					resizable: false,
					headerSort: false,
				},
				height: "1000px",
				columns: [
					// responsive: 0 = never collapse
					// responsive: higher number = first collapse
					{
						title: "Title",
						field: "col0",
						formatter: "html",
						minWidth: 130,
						responsive: 0,
						headerFilter: "input",
					},
					{
						title: "Type",
						field: "col2",
						formatter: "html",
						width: 85,
						responsive: 0,
						headerFilter: "list",
						headerFilterParams: { valuesLookup: true, clearable: true },
					},
					{
						title: "Description",
						field: "col1",
						formatter: "html",
						minWidth: 250,
						responsive: 1,
						headerFilter: "input",
					},
					{
						title: "Level",
						field: "col4",
						formatter: "html",
						minWidth: 130,
						responsive: 1,
						headerFilter: "list",
						headerFilterParams: {
							values: ["Beginner", "Intermediate", "Advanced", "Expert"],
							clearable: true,
						},
					},
					{
						title: "Free?",
						field: "col6",
						formatter: "html",
						width: 85,
						responsive: 1,
						hozAlign: "center",
						headerFilter: "list",
						headerFilterParams: { valuesLookup: true, clearable: true },
					},
					// Collapse this group first on mobile
					{
						title: "Topic",
						field: "col3",
						formatter: "html",
						minWidth: 110,
						responsive: 3,
						headerFilter: "input",
					},
					{
						title: "My Verdict",
						field: "col5",
						formatter: "html",
						minWidth: 140,
						responsive: 3,
						headerFilter: "input",
					},
					{
						title: "Language",
						field: "col7",
						formatter: "html",
						minWidth: 100,
						responsive: 2,
						headerFilter: "list",
						headerFilterParams: { valuesLookup: true, clearable: true },
					},
					// Least important — collapse first 
					{
						title: "My Status",
						field: "col8",
						formatter: "html",
						width: 100,
						responsive: 4,
						headerFilter: "list",
						headerFilterParams: { valuesLookup: true, clearable: true },
					},
					{
						title: "Source/Author",
						field: "col9",
						formatter: "html",
						width: 110,
						responsive: 4,
						headerFilter: "input",
					},
				],
			},
		},
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

						if (config.tabulatorOptions) {
							next.properties = {
								...next.properties,
								"data-tabulator-opts": JSON.stringify(config.tabulatorOptions),
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
						content: `https://${cfg.configuration.baseUrl}/static/tabulator-quartz.css`,
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
											var cell = cells[i]
											if (!cell) { row[col.field] = ""; return row }
											row[col.field] = cell.innerHTML.trim()
											row[col.field + "_text"] = cell.textContent.trim()
											return row
										}, {})
									})

									var container = document.createElement("div")
									container.className = "tabulator-container"
									tableEl.insertAdjacentElement("afterend", container)
									tableEl.style.display = "none"
									tableEl.setAttribute("aria-hidden", "true")

									// Per-marker tabulatorOptions injected through data-tabulator-opts
									var perTableOpts = {}
									if (tableEl.dataset.tabulatorOpts) {
										try {
											Object.assign(perTableOpts, JSON.parse(tableEl.dataset.tabulatorOpts))
										} catch (e) { }
									}

									if (perTableOpts.columns) {
										perTableOpts.columns = perTableOpts.columns.map(function (col) {
											if (col.formatter === "html" && col.headerFilter === "list") {
												col.headerFilterFunc = function (headerValue, _rowValue, rowData) {
													if (!headerValue) return true
													return (rowData[col.field + "_text"] || "")
														.toLowerCase()
														.includes(headerValue.toLowerCase())
												}
											}
											return col
										})
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
