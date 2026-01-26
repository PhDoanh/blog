// Hiển thị thông báo offline
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
function showBookmarkModal(slug: string, isRemoving: boolean) {
	if (!slug) return;
	// Overlay
	const overlay = document.createElement('div');
	overlay.className = 'bookmark-modal-overlay';
	// Modal
	const modal = document.createElement('div');
	modal.className = 'bookmark-modal';
	modal.innerHTML = `
        <div class="bookmark-modal-title">${isRemoving ? 'Remove saved article?' : 'Save article for offline use?'}</div>
        <div class="bookmark-modal-desc">${isRemoving ? 'This article will no longer be available offline.' : 'It will be downloaded to your device.'}<br>See <a href="/bookmarks">my bookmarks</a>.</div>
        <div class="bookmark-modal-buttons">
            <button class="bookmark-modal-btn secondary" id="cancel-btn">Cancel</button>
            <button class="bookmark-modal-btn primary" id="confirm-btn">Confirm</button>
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
				// Xóa khỏi cache với message channel để nhận feedback
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
					// Cache trang với message channel để nhận feedback
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
			document.body.removeChild(overlay);
			document.body.removeChild(modal);
		};
	}
}

// Đảm bảo không double event
const bookmarkBtnHandlers: WeakMap<HTMLButtonElement, EventListener> = new WeakMap();

function setupBookmarkBtns() {
	const btns = document.querySelectorAll<HTMLButtonElement>('#bookmark-btn, .bookmark-btn');
	btns.forEach(btn => {
		// Cleanup event cũ nếu có
		const oldHandler = bookmarkBtnHandlers.get(btn);
		if (oldHandler) btn.removeEventListener('click', oldHandler);

		// Sử dụng EventListener thay vì (e: MouseEvent) => void để tránh lỗi TS2345
		const handler: EventListener = (e) => {
			e.preventDefault();
			const slug = btn.getAttribute('data-slug');
			const isMarked = isBookmarked(slug || '');
			showBookmarkModal(slug || '', isMarked);
		};
		btn.addEventListener('click', handler);
		bookmarkBtnHandlers.set(btn, handler);
	});
	updateBookmarkBtns();
}

// Đồng bộ trạng thái icon giữa các tab
window.addEventListener('storage', (e) => {
	if (e.key === 'quartz-bookmarks') updateBookmarkBtns();
});

// Initial setup khi DOM loaded
setupBookmarkBtns();
// Gắn lại khi SPA navigation
document.addEventListener('nav', setupBookmarkBtns);