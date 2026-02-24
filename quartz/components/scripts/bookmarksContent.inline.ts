import { ContentDetails } from "../../plugins/emitters/contentIndex"
import { i18n, ValidLocale } from "../../i18n"
import { joinSegments } from "../../util/path"
import { tagsToExclude, pagesToExcludeAllTags } from "../../cfg"

function getBookmarks(): string[] {
	try {
		return JSON.parse(localStorage.getItem("quartz-bookmarks") || "[]")
	} catch {
		return []
	}
}

function getBasePath(): string {
	const metaBase = document.head.querySelector<HTMLMetaElement>('meta[name="base-url"]')?.content
	if (metaBase) {
		return new URL(`https://${metaBase}`).pathname
	}
	const pathParts = window.location.pathname.split("/")
	return pathParts.length > 1 && pathParts[1] ? `/${pathParts[1]}` : "/"
}

async function renderBookmarks() {
	const locale = (document.head.querySelector<HTMLMetaElement>('meta[name="locale"]')?.content) as ValidLocale;
	const countEl = document.getElementById("bookmark-count")
	const containerEl = document.getElementById("bookmark-list-container")
	if (!countEl || !containerEl) return

	const bookmarkSlugs = getBookmarks()
	const count = bookmarkSlugs.length

	// Update count with i18n
	countEl.textContent = i18n(locale).pages.bookmarks?.itemsUnderBookmarks({ count }) || `${count} bookmarked article(s).`

	if (!count) {
		containerEl.innerHTML = ""
		return
	}

	// Fetch full metadata from contentIndex
	try {
		const basePath = getBasePath()
		const res = await fetch(joinSegments(basePath, "static/contentIndex.json"))
		const allContent = Object.values(await res.json()) as ContentDetails[]

		// Filter bookmarked pages
		const bookmarkedPages = allContent.filter((page) =>
			bookmarkSlugs.includes(page.slug!),
		)

		// Sort by date (newest first), matching PageList sorting logic
		bookmarkedPages.sort((a, b) => {
			if (a.date && b.date) {
				const dateA = new Date(a.date)
				const dateB = new Date(b.date)
				return dateB.getTime() - dateA.getTime()
			} else if (a.date && !b.date) {
				return -1
			} else if (!a.date && b.date) {
				return 1
			}
			// Fallback to alphabetical by title
			return (a.title ?? "").localeCompare(b.title ?? "")
		})

		// Build list HTML (matching PageList structure)
		const ul = document.createElement("ul")
		ul.className = "section-ul"

		bookmarkedPages.forEach((page) => {
			const li = document.createElement("li")
			li.className = "section-li"

			const section = document.createElement("div")
			section.className = "section"

			// Meta (date) - positioned first to match PageList structure
			if (page.date) {
				const meta = document.createElement("p")
				meta.className = "meta"
				const date = new Date(page.date)
				meta.textContent = date.toLocaleDateString(locale, {
					year: "numeric",
					month: "short",
					day: "numeric",
				})
				section.appendChild(meta)
			}

			// Description area with title
			const desc = document.createElement("div")
			desc.className = "desc"

			const h3 = document.createElement("h3")
			const link = document.createElement("a")
			link.href = joinSegments(basePath, `${page.slug}`)
			link.className = "internal"
			link.textContent = page.title ?? page.slug!
			h3.appendChild(link)
			desc.appendChild(h3)

			section.appendChild(desc)

			// Tags
			if (page.tags && page.tags.length > 0) {
				const tags = pagesToExcludeAllTags.includes(page.slug!) ? [] : page.tags?.filter(tag => !tagsToExclude.includes(tag)) ?? []
				const tagList = document.createElement("ul")
				tagList.className = "tags"
				tags.forEach((tag) => {
					const tagLi = document.createElement("li")
					const tagLink = document.createElement("a")
					tagLink.className = "internal tag-link"
					tagLink.href = joinSegments(basePath, `/tags/${tag}`)
					tagLink.textContent = tag
					tagLi.appendChild(tagLink)
					tagList.appendChild(tagLi)
				})
				section.appendChild(tagList)
			}

			li.appendChild(section)
			ul.appendChild(li)
		})

		containerEl.replaceChildren(ul)

		// Setup popover for dynamically created links without triggering nav event
		// Dispatch a custom event to setup popovers for this specific container
		const setupPopoverEvent = new CustomEvent('setup-popover', {
			detail: { container: ul }
		})
		document.dispatchEvent(setupPopoverEvent)
	} catch (error) {
		console.error("Failed to load bookmarks:", error)
		containerEl.innerHTML = "<p>Failed to load bookmarks.</p>"
	}
}

// Initial render
document.addEventListener("DOMContentLoaded", () => renderBookmarks())

// Re-render on navigation and storage changes (sync across tabs)
document.addEventListener("nav", () => renderBookmarks())
window.addEventListener("storage", (e) => {
	if (e.key === "quartz-bookmarks") {
		renderBookmarks()
	}
})
