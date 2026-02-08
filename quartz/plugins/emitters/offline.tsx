import { QuartzEmitterPlugin } from "../types"
import { FullSlug } from "../../util/path"
import { FullPageLayout } from "../../cfg"
import { sharedPageComponents } from "../../../quartz.layout"
import OfflineFallback from "../../components/pages/OfflineFallback"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { defaultProcessedContent } from "../vfile"
import { QuartzComponentProps } from "../../components/types"
import { BuildCtx } from "../../util/ctx"
import { StaticResources } from "../../util/resources"
import { ProcessedContent } from "../vfile"
import { write } from "./helpers"
import { i18n } from "../../i18n"

export const Offline: QuartzEmitterPlugin = () => {
	const opts: FullPageLayout = {
		head: sharedPageComponents.head,
		header: [],
		beforeBody: [],
		pageBody: OfflineFallback(),
		afterBody: [],
		left: [],
		right: [],
		footer: sharedPageComponents.footer,
	}

	const { head: Head, pageBody, footer: Footer } = opts
	const Body = BodyConstructor()

	const precachePages = Array.from(new Set([
		"./", // homepage
		"./bookmarks",
		"./offline",
		"./404",
	]))

	return {
		name: "OfflineSupport",
		getQuartzComponents() {
			return [Head, Body, pageBody, Footer]
		},
		async *emit(ctx: BuildCtx, _content: ProcessedContent[], resources: StaticResources) {
			const { cfg } = ctx

			const manifest = {
				name: cfg.configuration.webAppTitle || cfg.configuration.pageTitle,
				short_name: cfg.configuration.webAppTitle || cfg.configuration.pageTitle,
				description: cfg.configuration.description || "",
				theme_color: cfg.configuration.theme.colors.lightMode.lightgray,
				background_color: cfg.configuration.theme.colors.lightMode.lightgray,
				display: "standalone",
				start_url: "./",
				icons: [
					{
						"src": "./static/web-app-manifest-192x192.png",
						"sizes": "192x192",
						"type": "image/png",
						"purpose": "any"
					},
					{
						"src": "./static/web-app-manifest-512x512.png",
						"sizes": "512x512",
						"type": "image/png",
						"purpose": "any maskable"
					}
				],
				screenshots: [
					{
						"src": "./static/screenshot-desktop.png",
						"sizes": "1280x720",
						"type": "image/png",
						"form_factor": "wide"
					},
					{
						"src": "./static/screenshot-mobile.png",
						"sizes": "640x1136",
						"type": "image/png"
					}
				]
			}

			const slug = "offline" as FullSlug;

			const url = new URL(`https://${cfg.configuration.baseUrl ?? "example.com"}`);
			const path = url.pathname as FullSlug
			const externalResources = pageResources(path, resources)
			const noConnection = i18n(cfg.configuration.locale).pages.offlineFallback?.title || "Internet Disconnected!"
			const [tree, vfile] = defaultProcessedContent({
				slug,
				text: noConnection,
				description: noConnection,
				frontmatter: { title: noConnection, tags: [] },
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

			// Service worker script: optimized version with better error handling and performance
			const serviceWorker = `
		importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');
		const { staticResourceCache, googleFontsCache, imageCache, offlineFallback } = workbox.recipes;

		staticResourceCache();
		googleFontsCache();
		imageCache();
		offlineFallback({ pageFallback: './offline.html' });

		const CACHE_NAME = 'quartz-bookmark-cache-v3';
		const OLD_CACHE_NAME = 'quartz-bookmark-cache-v1';
		const MAX_CACHE_SIZE = 100;
		const NETWORK_TIMEOUT = 3000;

		// Utility: Normalize URL to avoid duplicate cache entries
		const normalizeUrl = (url) => {
			const normalized = new URL(url, self.location.origin);
			normalized.hash = '';
			return normalized.pathname;
		};

		// Utility: Trim cache to max size using LRU strategy
		const trimCache = async (cacheName, maxSize) => {
			const cache = await caches.open(cacheName);
			const keys = await cache.keys();
			if (keys.length > maxSize) {
				// Delete oldest entries (assuming keys are ordered by insertion time)
				const keysToDelete = keys.slice(0, keys.length - maxSize);
				await Promise.all(keysToDelete.map(key => cache.delete(key)));
			}
		};

		// Install event: Precache essential pages
		self.addEventListener('install', event => {
			console.log('[SW] Installing service worker v3');
			event.waitUntil(
				caches.open(CACHE_NAME)
					.then(cache => {
						// Cache precache pages
						return cache.addAll(${JSON.stringify(precachePages)}).catch(err => {
							console.warn('[SW] Failed to precache some pages:', err);
							// Try caching pages individually
							return Promise.allSettled(
								${JSON.stringify(precachePages)}.map(url => 
									cache.add(url).catch(e => console.warn(\`[SW] Failed to cache \${url}:\`, e))
								)
							);
						});
					})
					.then(() => self.skipWaiting()) // Activate immediately
			);
		});

		// Activate event: Clean up old caches
		self.addEventListener('activate', event => {
			console.log('[SW] Activating service worker v3');
			event.waitUntil(
				caches.keys()
					.then(cacheNames => {
						return Promise.all(
							cacheNames
								.filter(name => name !== CACHE_NAME && name.startsWith('quartz-bookmark-cache'))
								.map(name => {
									console.log('[SW] Deleting old cache:', name);
									return caches.delete(name);
								})
						);
					})
					.then(() => self.clients.claim()) // Take control of all pages
			);
		});

		// Message event: Handle cache/remove requests from client
		self.addEventListener('message', event => {
			const handleMessage = async () => {
				try {
					if (!event.data || !event.data.type) {
						return;
					}

					const { type, url } = event.data;
					const cache = await caches.open(CACHE_NAME);

					if (type === 'CACHE_PAGE') {
						const normalizedUrl = normalizeUrl(url);
						const response = await fetch(url);

						if (response && response.ok) {
							await cache.put(normalizedUrl, response.clone());
							await trimCache(CACHE_NAME, MAX_CACHE_SIZE);

							// Send response back to client
							event.ports[0]?.postMessage({ success: true, url });
							console.log('[SW] Cached page:', normalizedUrl);
						} else {
							event.ports[0]?.postMessage({ success: false, url, error: 'Response not OK' });
						}
					} else if (type === 'REMOVE_PAGE') {
						const normalizedUrl = normalizeUrl(url);
						const deleted = await cache.delete(normalizedUrl);

						event.ports[0]?.postMessage({ success: deleted, url });
						console.log('[SW] Removed page from cache:', normalizedUrl);
					}
				} catch (error) {
					console.error('[SW] Error handling message:', error);
					event.ports[0]?.postMessage({ success: false, error: error.message });
				}
			};

			event.waitUntil(handleMessage());
		});

		// Fetch event: Network-first with timeout, fallback to cache
		self.addEventListener('fetch', event => {
			const url = new URL(event.request.url);

			// Chỉ handle navigation requests
			if (event.request.mode !== 'navigate') {
				return;
			}

			event.respondWith(
				(async () => {
					const cache = await caches.open(CACHE_NAME);
					const normalizedPath = normalizeUrl(event.request.url);

					// Network-first with timeout
					const networkPromise = fetch(event.request).then(async response => {
						if (response && response.ok) {
							return response;
						}

						// If 404, return immediately (do not fallback to cache)
						if (response && response.status === 404) {
							return response;
						}

						// Other status codes, throw to fallback to cache
						throw new Error('Response not OK');
					});

					// Create timeout promise
					const timeoutPromise = new Promise((_, reject) => {
						setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT);
					});

					try {
						// Race between network and timeout
						return await Promise.race([networkPromise, timeoutPromise]);
					} catch (error) {
						console.warn(\`[SW] Network failed for \${normalizedPath}, using cache:\`, error.message);

						// Fallback to cache
						const cachedResponse = await cache.match(normalizedPath);
						if (cachedResponse) {
							return cachedResponse;
						}

						// Finally fallback to offline page
						return cache.match('./offline.html') || new Response('Offline', {
							status: 503,
							statusText: 'Service Unavailable'
						});
					}
				})()
			);
		});

		console.log('[SW] Service Worker v3 loaded');
			`;

			yield write({
				ctx,
				content: JSON.stringify(manifest),
				slug: "site" as FullSlug,
				ext: ".webmanifest",
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

