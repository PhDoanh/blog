import { QuartzTransformerPlugin } from "../types"
import { Root } from "mdast"
import { visit } from "unist-util-visit"

export const HandText: QuartzTransformerPlugin = () => ({
	name: "HandText",
	markdownPlugins() {
		return [
			() => (tree: Root, _file) => {
				visit(tree, "code", (node) => {
					if (node.lang === "handtext") {
						node.type = "html" as "code"
						node.value = `<pre class="handtext">${node.value}</pre>`
					}
				})
			},
		]
	},
})