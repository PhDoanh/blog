import { i18n } from "../../i18n"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

const NoTranslation: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
	return (
		<article className="popover-hint no-translation-page">
			<h1>{i18n(cfg.locale).pages.translation?.title || "Translation Not Available"}</h1>
			<p>{i18n(cfg.locale).pages.translation?.translationRequest || "The page you requested is not yet available in this language. Can you help me complete the translation?"}</p>

			<a href="/article-contribution-guide">
				{i18n(cfg.locale).pages.translation?.acceptResponse || "Return to Original Content"}
			</a>
			<br />
			<a href="#" id="original-link">
				{i18n(cfg.locale).pages.translation?.declineResponse || "Return to Original Content"}
			</a>

			<script dangerouslySetInnerHTML={{
				__html: `
				document.addEventListener('DOMContentLoaded', function () {
					const urlParams = new URLSearchParams(window.location.search);
					const originalPath = urlParams.get('originalPath') || '/';

					const originalLink = document.getElementById('original-link');
					if (originalLink) {
						originalLink.href = originalPath;
					}
				});
			` }}></script>
		</article>
	)
}

export default (() => NoTranslation) satisfies QuartzComponentConstructor