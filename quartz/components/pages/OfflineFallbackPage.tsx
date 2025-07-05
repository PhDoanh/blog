import { QuartzComponentConstructor } from "../types"

function OfflineFallbackPage() {
	return (
		<article class="popover-hint">
			<h1>Offline</h1>
			<p>This page isn't offline available yet.</p>
			<h2>Your bookmarks</h2>
			<ul id="bookmark-list">
				<li>Đang tải danh sách...</li>
			</ul>
			<script dangerouslySetInnerHTML={{
				__html: `
                (function() {
                    function renderBookmarks() {
                        const el = document.getElementById('bookmark-list');
                        if (!el) return;
                        let bookmarks = [];
                        try {
                            bookmarks = JSON.parse(localStorage.getItem('quartz-bookmarks') || '[]');
                        } catch {}
                        if (!bookmarks.length) {
                            el.innerHTML = '<li>Chưa có bài viết nào được sao lưu.</li>';
                            return;
                        }
                        el.innerHTML = bookmarks.map(slug =>
                            '<li><a href=\"/' + slug + '\">' + slug + '</a></li>'
                        ).join('');
                    }
                    renderBookmarks();
                })();
                `
			}} />
		</article>
	)
}

export default (() => OfflineFallbackPage) satisfies QuartzComponentConstructor
