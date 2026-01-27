import { QuartzComponent, QuartzComponentConstructor } from "../types"

const Bookmarks: QuartzComponent = () => {
	return (
		<article class="popover-hint">
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

export default (() => Bookmarks) satisfies QuartzComponentConstructor
