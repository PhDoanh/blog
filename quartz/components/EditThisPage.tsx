import { QuartzComponentConstructor, QuartzComponentProps } from "./types";
import { i18n } from "../i18n";

interface Options {
	// GitHub repository details
	owner: string
	repo: string
}

export default ((opts: Options) => {

	function EditThisPage({ fileData, cfg }: QuartzComponentProps) {
		const fileRelativePath = fileData.relativePath;
		const editUrl = `https://github.com/${opts.owner}/${opts.repo}/edit/main/${fileRelativePath}`;

		return (
			<a
				href={editUrl}
				class="edit-page-btn"
				target="_blank"
				rel="noopener noreferrer"
				title={i18n(cfg.locale).components.editThisPage.tooltip}
				aria-label={i18n(cfg.locale).components.editThisPage.title}
			>
				<svg
					class="edit-icon"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M12 20h9" />
					<path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
				</svg>
				<span class="edit-text">{i18n(cfg.locale).components.editThisPage.title}</span>
			</a>
		);
	}

	EditThisPage.css = `
    .edit-page-btn {
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0.69rem;
		border-radius: 4px;
		transition: background-color 0.2s;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--darkgray);
		gap: 5px;
    }

    .edit-page-btn svg {
		width: 20px;
		height: 20px;
    }

    .edit-page-btn:hover {
		background-color: var(--lightgray);
		color: var(--darkgray);
    }

    .edit-text {
		font-size: 1rem;
		font-weight: 500;
    }`;

	return EditThisPage;
}) satisfies QuartzComponentConstructor<Options>;
