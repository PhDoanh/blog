import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { FullPageLayout } from "../../cfg"
import { FullSlug } from "../../util/path"
import { sharedPageComponents } from "../../../quartz.layout"
import { NoTranslation } from "../../components"
import { defaultProcessedContent } from "../vfile"
import { write } from "./helpers"
import { i18n } from "../../i18n"

export const NoTranslationPage: QuartzEmitterPlugin = () => {
	const opts: FullPageLayout = {
		...sharedPageComponents,
		pageBody: NoTranslation(),
		beforeBody: [],
		left: [],
		right: [],
	}

	const { head: Head, pageBody, footer: Footer } = opts
	const Body = BodyConstructor()

	return {
		name: "NoTranslationPage",
		getQuartzComponents() {
			return [Head, Body, pageBody, Footer]
		},
		async *emit(ctx, _content, resources) {
			const cfg = ctx.cfg.configuration
			const slug = "translation-not-available" as FullSlug

			const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
			const path = url.pathname as FullSlug
			const title = i18n(cfg.locale).pages.translation?.title || "Translation Not Available!"
			const description = i18n(cfg.locale).pages.translation?.translationRequest ||
				"Feel free to contribute translations if you'd like."

			const [tree, vfile] = defaultProcessedContent({
				slug,
				text: title,
				description,
				frontmatter: { title, tags: [] },
			})

			const externalResources = pageResources(path, resources)
			const componentData: QuartzComponentProps = {
				ctx,
				fileData: vfile.data,
				externalResources,
				cfg,
				children: [],
				tree,
				allFiles: [],
			}

			yield write({
				ctx,
				content: renderPage(cfg, slug, componentData, opts, externalResources),
				slug,
				ext: ".html",
			})
		},
		async *partialEmit() { },
	}
}