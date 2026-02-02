import { QuartzComponentProps } from "../types"
import { i18n } from "../../i18n"

function updateOnlineStatus() {
	if (navigator.onLine) {
		document.body.classList.remove('offline');
	} else {
		document.body.classList.add('offline');
	}
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// Bookmark logic
function getBookmarks() {
	try {
		return JSON.parse(localStorage.getItem('quartz-bookmarks') || '[]');
	} catch { return []; }
}
function saveBookmarks(bookmarks: string[]) {
	try {
		localStorage.setItem('quartz-bookmarks', JSON.stringify(bookmarks));
	} catch {
		// Ignore
	}
}
function isBookmarked(slug: string) {
	if (!slug) return false;
	return getBookmarks().includes(slug);
}
function updateBookmarkBtns() {
	const btns = document.querySelectorAll<HTMLButtonElement>('#bookmark-btn, .bookmark-btn');
	btns.forEach(btn => {
		const slug = btn.getAttribute('data-slug');
		if (isBookmarked(slug || '')) btn.classList.add('active');
		else btn.classList.remove('active');
	});
}
function showBookmarkModal(slug: string, isRemoving: boolean, props?: QuartzComponentProps) {
	if (!slug) return;
	// Overlay
	const overlay = document.createElement('div');
	overlay.className = 'bookmark-modal-overlay';
	// Modal
    const locale = props?.cfg?.locale || 'en-US';
	const modal = document.createElement('div');
	modal.className = 'bookmark-modal';
	modal.innerHTML = `
        <div class="bookmark-modal-title">
		${isRemoving ?
			i18n(locale).components.bookmark?.removeModalTitle || "Remove saved article?"
			: i18n(locale).components.bookmark?.addModalTitle || "Save article for offline use?"}
		</div>
        <div class="bookmark-modal-desc">
		${isRemoving ?
			i18n(locale).components.bookmark?.removeModalDescription || "This article will no longer be available offline."
			: i18n(locale).components.bookmark?.addModalDescription || "This article will be downloaded to your device for offline reading."}
		</div>
        <div class="bookmark-modal-buttons">
            <button class="bookmark-modal-btn secondary" id="cancel-btn">${i18n(locale).components.bookmark?.modalCancelButton || "Cancel"}</button>
            <button class="bookmark-modal-btn primary" id="confirm-btn">${i18n(locale).components.bookmark?.modalConfirmButton || "Confirm"}</button>
        </div>`;
	document.body.appendChild(overlay);
	document.body.appendChild(modal);
	const cancelBtn = document.getElementById('cancel-btn');
	if (cancelBtn) {
		cancelBtn.onclick = () => {
			document.body.removeChild(overlay);
			document.body.removeChild(modal);
		};
	}
	const confirmBtn = document.getElementById('confirm-btn');
	if (confirmBtn) {
		confirmBtn.onclick = async () => {
			let bookmarks = getBookmarks();
			if (isRemoving) {
				bookmarks = bookmarks.filter((s: string) => s !== slug);
				// Remove from cache with message channel to receive feedback
				if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
					try {
						const messageChannel = new MessageChannel();
						messageChannel.port1.onmessage = (event) => {
							if (event.data.success) {
								console.log('Page removed from cache:', event.data.url);
							} else {
								console.warn('Failed to remove page from cache:', event.data.error);
							}
						};
						navigator.serviceWorker.controller.postMessage(
							{ type: 'REMOVE_PAGE', url: '/' + slug },
							[messageChannel.port2]
						);
					} catch (error) {
						console.error('Error communicating with service worker:', error);
					}
				}
			} else {
				if (!bookmarks.includes(slug)) {
					bookmarks.push(slug);
					// Cache page with message channel to receive feedback
					if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
						try {
							const messageChannel = new MessageChannel();
							messageChannel.port1.onmessage = (event) => {
								if (event.data.success) {
									console.log('Page cached successfully:', event.data.url);
								} else {
									console.warn('Failed to cache page:', event.data.error);
								}
							};
							navigator.serviceWorker.controller.postMessage(
								{ type: 'CACHE_PAGE', url: '/' + slug },
								[messageChannel.port2]
							);
						} catch (error) {
							console.error('Error communicating with service worker:', error);
						}
					}
				}
			}
			saveBookmarks(bookmarks);
			updateBookmarkBtns();

			// Dispatch custom event for same-tab updates (e.g., graph re-render)
			document.dispatchEvent(new CustomEvent('bookmarkchange', {
				detail: { slug, isRemoving }
			}));

			document.body.removeChild(overlay);
			document.body.removeChild(modal);
		};
	}
}

// Ensure each button has only one event listener
const bookmarkBtnHandlers: WeakMap<HTMLButtonElement, EventListener> = new WeakMap();

function setupBookmarkBtns() {
	const btns = document.querySelectorAll<HTMLButtonElement>('#bookmark-btn, .bookmark-btn');
	btns.forEach(btn => {
		// Cleanup old event listener if any
		const oldHandler = bookmarkBtnHandlers.get(btn);
		if (oldHandler) btn.removeEventListener('click', oldHandler);

		// Use EventListener instead of (e: MouseEvent) => void to avoid TS2345 error
		const handler: EventListener = (e) => {
			e.preventDefault();
			const slug = btn.getAttribute('data-slug');
			const isMarked = isBookmarked(slug || '');
			showBookmarkModal(slug || '', isMarked, {} as QuartzComponentProps);
		};
		btn.addEventListener('click', handler);
		bookmarkBtnHandlers.set(btn, handler);
	});
	updateBookmarkBtns();
}

// Synchronize icon state across tabs
window.addEventListener('storage', (e) => {
	if (e.key === 'quartz-bookmarks') updateBookmarkBtns();
});

// Initial setup when DOM loaded
setupBookmarkBtns();
// Re-setup on SPA navigation
document.addEventListener('nav', setupBookmarkBtns);