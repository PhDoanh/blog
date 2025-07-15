interface Contributor {
	name: string;
	id?: number;
	username?: string;
	link?: string;
	avatar: string;
}

interface GithubCommit {
	commit?: {
		author?: {
			name?: string;
		};
	};
	author?: {
		id?: number;
		login?: string;
		html_url?: string;
		avatar_url?: string;
	};
}

// Function to fetch contributors from GitHub API
async function fetchContributors() {
	const containers = document.querySelectorAll('.contributors-container');

	for (const container of containers) {
		const apiUrl = container.getAttribute('data-github-api-url');
		const limit = parseInt(container.getAttribute('data-limit') || '10');
		const blameUrl = container.getAttribute('data-blame-url');

		if (!apiUrl) continue;

		try {
			// Show loading state
			container.innerHTML = '<p>Loading...</p>';

			// Fetch contributors
			const response = await fetch(apiUrl);

			if (!response.ok) {
				throw new Error('Failed to fetch contributors');
			}

			const data = await response.json();

			// Process contributors to get unique ones
			const contributors = data
				.map((item: GithubCommit) => ({
					name: item.commit?.author?.name || item.author?.login || 'Unknown',
					id: item.author?.id,
					username: item.author?.login,
					link: item.author?.html_url,
					avatar: item.author?.avatar_url || 'https://github.com/identicons/placeholder.png'
				}))
				.filter((item: Contributor, index: number, self: Contributor[]) =>
					// Filter out duplicates based on ID
					item.id && self.findIndex(t => t.id === item.id) === index
				);

			if (contributors.length === 0) {
				container.innerHTML = '<p>Not found</p>';
				return;
			}

			// Remain number of contributors
			const remainContributors = contributors.length - limit;

			// Determine if we need to show the "+N" avatar (when exceeding limit)
			const showRemainWithCount = contributors.length > limit;

			// Number of avatars to display (always one less to leave room for the total/clock icon)
			const displayCount = Math.min(limit - 1, contributors.length);

			// Display avatars
			let html = contributors
				.slice(0, displayCount)
				.map((contributor: Contributor) =>
					`<a class="contributor" href="${contributor.link}" target="_blank" title="${contributor.name}">
						<img src="${contributor.avatar}" alt="${contributor.name}" loading="lazy" />
					</a>`
				)
				.join('');

			// Always add the last avatar, either as clock or as count
			if (showRemainWithCount) {
				// If exceeding limit, show total count
				html += `<a class="contributor contributor-total" href="${blameUrl}" target="_blank" title="View ${remainContributors} remain contributors">+${remainContributors}</a>`;
			} else {
				// If not exceeding limit, show clock icon
				const clockSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-clock-icon lucide-file-clock"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 22h2a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"/><path d="M8 14v2.2l1.6 1"/><circle cx="8" cy="16" r="6"/></svg>`;
				html += `<a class="contributor contributor-total" href="${blameUrl}" target="_blank" title="View file history">${clockSvg}</a>`;
			}
			container.innerHTML = html;
		} catch (error) {
			console.error('Error fetching contributors:', error);
			container.innerHTML = '<p>Failed to load contributors</p>';
		}
	}
}

// Call the function when DOM is loaded
fetchContributors();
