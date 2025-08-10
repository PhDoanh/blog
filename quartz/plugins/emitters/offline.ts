import { QuartzEmitterPlugin } from "../types"
import { FullSlug } from "../../util/path"
import { FullPageLayout } from "../../cfg"
import { sharedPageComponents } from "../../../quartz.layout"
import OfflineFallbackPage from "../../components/pages/OfflineFallbackPage"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { defaultProcessedContent } from "../vfile"
import { QuartzComponentProps } from "../../components/types"
import { BuildCtx } from "../../util/ctx"
import { StaticResources } from "../../util/resources"
import { ProcessedContent } from "../vfile"
import { write } from "./helpers"

interface Options {
	precachePages?: string[]
}

export const Offline: QuartzEmitterPlugin<Options> = (usrOpts) => {
	const opts: FullPageLayout = {
		...sharedPageComponents,
		pageBody: OfflineFallbackPage(),
		beforeBody: [],
		left: [],
		right: [],
	}

	const { head: Head, pageBody, footer: Footer } = opts
	const Body = BodyConstructor()

	const precachePages = Array.from(new Set([
		"./offline.html",
		...(usrOpts?.precachePages ?? [])
	]))

	return {
		name: "OfflineSupport",
		getQuartzComponents() {
			return [Head, Body, pageBody, Footer]
		},
		async *emit(ctx: BuildCtx, _content: ProcessedContent[], resources: StaticResources) {
			const { cfg } = ctx

			const manifest = {
				short_name: cfg.configuration.pageTitle,
				name: cfg.configuration.pageTitle,
				description: cfg.configuration.description,
				background_color: cfg.configuration.theme.colors.darkMode.light,
				theme_color: cfg.configuration.theme.colors.darkMode.light,
				display: "minimal-ui",
				icons: [
					{
						src: "./static/icon.png",
						sizes: "any",
						purpose: "maskable",
					},
					{
						src: "./static/icon.png",
						sizes: "any",
						purpose: "any",
					},
				],
				start_url: "./",
			}

			const slug = "offline" as FullSlug;

			const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";
			const url = new URL(isLocalhost ? "http://localhost:8080" : `https://${cfg.configuration.baseUrl}`);
			const path = url.pathname as FullSlug
			const externalResources = pageResources(path, resources)
			const [tree, vfile] = defaultProcessedContent({
				slug,
				text: "Offline",
				description: "This page isn't offline available yet.",
				frontmatter: { title: "Offline", tags: [] },
			})

			const componentData: QuartzComponentProps = {
				ctx,
				fileData: vfile.data,
				externalResources,
				cfg: cfg.configuration,
				children: [],
				tree,
				allFiles: [],
			}

			// Service worker script: chỉ cache các trang được yêu cầu qua postMessage
			const serviceWorker = `
			importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');
			const { staticResourceCache, googleFontsCache, imageCache, offlineFallback } = workbox.recipes;

			staticResourceCache();
			googleFontsCache();
			imageCache();
			offlineFallback({ pageFallback: './offline.html' });

			const CACHE_NAME = 'quartz-bookmark-cache-v1';

			const validateUrls = async (urls) => {
				const validUrls = [];
				for (const url of urls) {
					try {
						const response = await fetch(url, { method: 'HEAD' });
						if (response.ok) {
							validUrls.push(url);
						} else {
							console.warn(\`Invalid URL: ${url}\`);
						}
					} catch (error) {
						console.error(\`Error validating URL ${url}:\`, error);
					}
				}
				return validUrls;
			};

			self.addEventListener('install', event => {
				event.waitUntil(
					validateUrls(${ JSON.stringify(precachePages) }).then(validUrls =>
						caches.open(CACHE_NAME).then(cache => cache.addAll(validUrls))
					)
				);
			});

			self.addEventListener('message', event => {
				if (event.data && event.data.type === 'CACHE_PAGE') {
					const url = event.data.url;
					caches.open(CACHE_NAME).then(cache => {
						fetch(url).then(response => {
							if (response.ok) {
								cache.put(url, response);
							}
						});
					});
				} else if (event.data && event.data.type === 'REMOVE_PAGE') {
					const url = event.data.url;
					caches.open(CACHE_NAME).then(cache => {
						cache.delete(url);
					});
				}
			});

			self.addEventListener('fetch', (event) => {
				const url = new URL(event.request.url);

				if (event.request.mode === 'navigate') {
					event.respondWith(
						caches.open(CACHE_NAME).then(async (cache) => {
							const cachedResponse = await cache.match(url.pathname);

							try {
								const networkResponse = await fetch(event.request);
								if (networkResponse && networkResponse.ok) {
									const networkETag = networkResponse.headers.get('ETag');
									const cachedETag = cachedResponse?.headers.get('ETag');

									if (!cachedETag || networkETag !== cachedETag) {
										// Chỉ cập nhật cache nếu ETag khác nhau
										cache.put(url.pathname, networkResponse.clone());
									}
									return networkResponse;
								}
								if (networkResponse && networkResponse.status === 404) {
									return networkResponse;
								}
							} catch (error) {
								console.warn(\`Network request failed for ${url.pathname}:\`, error);
							}

							return cachedResponse || cache.match('./offline.html');
						})
					);
				}
			});
			`;

			yield write({
				ctx,
				content: JSON.stringify(manifest),
				slug: "manifest" as FullSlug,
				ext: ".json",
			})

			yield write({
				ctx,
				content: serviceWorker,
				slug: "sw" as FullSlug,
				ext: ".js",
			})

			yield write({
				ctx,
				content: renderPage(cfg.configuration, slug, componentData, opts, externalResources),
				slug,
				ext: ".html",
			})
		},
		async *partialEmit() { },
	}
}

