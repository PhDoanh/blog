import { i18n } from "../../i18n"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

const NoTranslation: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
	return (
		<article className="popover-hint no-translation-page">
			<h1>{i18n(cfg.locale).pages.translation?.title || "Translation Not Available"}</h1>
			<p>{i18n(cfg.locale).pages.translation?.notAvailable || "The page you requested is not yet available in this language."}</p>

			<div className="contribute-section">
				<h2>{i18n(cfg.locale).pages.translation?.contributeTitle || "Want to help?"}</h2>
				<p>{i18n(cfg.locale).pages.translation?.contributeText || "We welcome contributions from our community. If you'd like to help translate this content:"}</p>
				<ol>
					<li>{i18n(cfg.locale).pages.translation?.step1 || "Fork our GitHub repository"}</li>
					<li>{i18n(cfg.locale).pages.translation?.step2 || "Create the missing translation file"}</li>
					<li>{i18n(cfg.locale).pages.translation?.step3 || "Submit a pull request"}</li>
				</ol>
			</div>

			<div className="original-link-container">
				<a href="#" className="original-link" id="original-link">
					{i18n(cfg.locale).pages.translation?.returnToOriginal || "Return to Original Content"}
				</a>
			</div>

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