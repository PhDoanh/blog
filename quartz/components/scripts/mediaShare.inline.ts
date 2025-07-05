// Định nghĩa callback ở scope module để giữ tham chiếu cố định
let toggleDropdown: ((e: MouseEvent) => void) | null = null;
let closeDropdownOutside: ((e: MouseEvent) => void) | null = null;
let copyLink: (() => void) | null = null;

function setupMediaShareEvents() {
	const shareButton = document.getElementById('share-button');
	const shareDropdown = document.getElementById('share-dropdown');
	const copyLinkButton = document.getElementById('copy-link');

	if (!shareButton || !shareDropdown || !copyLinkButton) {
		// Elements not found yet, try again after a short delay (tối đa 20 lần)
		if (!(window as any).__mediaShareRetry) (window as any).__mediaShareRetry = 0;
		if ((window as any).__mediaShareRetry++ < 20) {
			setTimeout(setupMediaShareEvents, 50);
		}
		return;
	}

	// Nếu đã có callback, gỡ event cũ
	if (toggleDropdown) shareButton.removeEventListener('click', toggleDropdown);
	if (closeDropdownOutside) document.removeEventListener('click', closeDropdownOutside);
	if (copyLink) copyLinkButton.removeEventListener('click', copyLink);

	// Định nghĩa callback chỉ một lần
	toggleDropdown = function (e: MouseEvent) {
		e.stopPropagation();
		shareDropdown.classList.toggle('active');
	};

	closeDropdownOutside = function (e: MouseEvent) {
		if (
			!shareButton.contains(e.target as Node) &&
			!shareDropdown.contains(e.target as Node)
		) {
			shareDropdown.classList.remove('active');
		}
	};

	copyLink = function () {
		const url = window.location.href;
		navigator.clipboard.writeText(url).then(() => {
			// Xóa feedback cũ nếu có
			document.querySelectorAll('.copy-feedback').forEach(fb => fb.remove());
			const feedback = document.createElement('div');
			feedback.className = 'copy-feedback';
			feedback.textContent = 'Link copied!';
			document.querySelector('.media-share')?.appendChild(feedback);

			setTimeout(() => {
				feedback.classList.add('active');
			}, 10);

			setTimeout(() => {
				feedback.classList.remove('active');
				setTimeout(() => {
					feedback.remove();
				}, 300);
			}, 2000);

			shareDropdown.classList.remove('active');
		}).catch(err => {
			console.error('Could not copy text: ', err);
		});
	};

	// Gắn event mới
	shareButton.addEventListener('click', toggleDropdown);
	document.addEventListener('click', closeDropdownOutside);
	copyLinkButton.addEventListener('click', copyLink);
}

// Initial setup
setupMediaShareEvents();

// For SPA navigation - reattach events when the page content changes
document.addEventListener('nav', setupMediaShareEvents);