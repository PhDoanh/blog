import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import Link from "./Link"

export default (() => {
	const GitHubEditLink: QuartzComponent = (props: QuartzComponentProps) => {
		const fileRelativePath = props.fileData.relativePath
		const editUrl = `https://github.com/PhDoanh/content/edit/main/${fileRelativePath}`

		// Sử dụng component Link đã có sẵn với URL động
		const LinkComponent = Link({
			to: editUrl,
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pen-line-icon lucide-pen-line"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>',
			description: "Edit this page",
			iconSize: "1.2em",
		})

		return <LinkComponent {...props} />
	}

	// Sao chép CSS từ Link component
	GitHubEditLink.css = Link({} as any).css

	return GitHubEditLink
}) satisfies QuartzComponentConstructor
