import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { FullPageLayout } from "../../cfg"
import { FullSlug } from "../../util/path"
import { left, sharedPageComponents } from "../../../quartz.layout"
import { BookmarksContent, BackToTop, Breadcrumbs, ArticleTitle } from "../../components"
import { defaultProcessedContent } from "../vfile"
import { write } from "./helpers"
import { i18n } from "../../i18n"

export const BookmarksPage: QuartzEmitterPlugin = () => {
	const opts: FullPageLayout = {
		head: sharedPageComponents.head,
		header: [],
		beforeBody: [
			Breadcrumbs(),
			ArticleTitle(),
		],
		pageBody: BookmarksContent(),
		afterBody: [
			BackToTop(),
		],
		left: left,
		right: [],
		footer: sharedPageComponents.footer,
	}

	const { head: Header, pageBody, footer: Footer } = opts
	const Body = BodyConstructor()

	return {
		name: "BookmarksPage",
		getQuartzComponents() {
			return [Header, Body, pageBody, Footer]
		},
		async *emit(ctx, _content, resources) {
			const cfg = ctx.cfg.configuration
			const slug = "bookmarks" as FullSlug

			const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
			const path = url.pathname as FullSlug
			const title = i18n(cfg.locale).pages.bookmarks?.title || "Bookmarks"

			const [tree, vfile] = defaultProcessedContent({
				slug,
				text: title,
				title,
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