function setupMediaShareEvents() {
	// Get DOM elements
	const shareButton = document.getElementById('share-button');
	const shareDropdown = document.getElementById('share-dropdown');
	const copyLinkButton = document.getElementById('copy-link');

	if (!shareButton || !shareDropdown || !copyLinkButton) {
		// Elements not found yet, try again after a short delay
		setTimeout(setupMediaShareEvents, 50);
		return;
	}

	// Remove any existing event listeners (to prevent duplicates)
	shareButton.removeEventListener('click', toggleDropdown);
	document.removeEventListener('click', closeDropdownOutside);
	copyLinkButton.removeEventListener('click', copyLink);

	// Handle share button click
	function toggleDropdown(e: MouseEvent) {
		e.stopPropagation();
		shareDropdown?.classList.toggle('active');
	}

	// Close dropdown when clicking outside
	function closeDropdownOutside(e: MouseEvent) {
		if (!shareButton?.contains(e.target as Node) && !shareDropdown?.contains(e.target as Node)) {
			shareDropdown?.classList.remove('active');
		}
	}

	// Handle copy link button click
	function copyLink() {
		// Get the current URL
		const url = window.location.href;

		// Copy to clipboard
		navigator.clipboard.writeText(url).then(() => {
			// Show feedback
			const feedback = document.createElement('div');
			feedback.className = 'copy-feedback';
			feedback.textContent = 'Link copied!';
			document.querySelector('.media-share')?.appendChild(feedback);

			// Animate feedback
			setTimeout(() => {
				feedback.classList.add('active');
			}, 10);

			// Remove feedback after delay
			setTimeout(() => {
				feedback.classList.remove('active');
				setTimeout(() => {
					feedback.remove();
				}, 300);
			}, 2000);

			// Close dropdown
			shareDropdown?.classList.remove('active');
		}).catch(err => {
			console.error('Could not copy text: ', err);
		});
	}

	// Add event listeners
	shareButton.addEventListener('click', toggleDropdown);
	document.addEventListener('click', closeDropdownOutside);
	copyLinkButton.addEventListener('click', copyLink);
}

// Initial setup
setupMediaShareEvents();

// For SPA navigation - reattach events when the page content changes
document.addEventListener('nav', setupMediaShareEvents);