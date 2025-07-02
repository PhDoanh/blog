import { useCallback } from "preact/hooks"
import { JSX } from "preact"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export interface LinkOptions {
	// Đường dẫn đích
	to: string
	// Icon (tùy chọn) - có thể chứa mã SVG
	icon?: string
	// Nội dung hiển thị (tùy chọn)
	label?: preact.ComponentChildren
	// Mô tả cho khả năng truy cập (tùy chọn)
	description?: string
	// Kích thước icon (tùy chọn) - mặc định là 1em (bằng kích cỡ label)
	iconSize?: string
	// Các thuộc tính HTML tùy chọn
	rel?: string
	target?: string
	className?: string
}

export default ((opts: LinkOptions) => {
	const Link: QuartzComponent = (props: QuartzComponentProps) => {
		// Kiểm tra ít nhất một trong hai trường icon hoặc label phải được cung cấp
		if (!opts.icon && !opts.label) {
			console.error("Link component requires either an icon or a label")
			return null
		}

		// Xác định kích thước icon, mặc định là 1em
		const iconSize = opts.iconSize || '1em'

		// Xác định link nội bộ hay ngoại bộ
		const isExternalLink = opts.to.startsWith("http")
		// Xác định nếu đường dẫn hiện tại (từ props) trùng với đường dẫn đích
		const isCurrentPage = props.fileData.slug === opts.to.replace(/^\//, "")

		// Handler cho sự kiện click
		const handleClick = useCallback((e: JSX.TargetedMouseEvent<HTMLAnchorElement>) => {
			// Xử lý điều hướng nội bộ nếu cần
			if (!isExternalLink) {
				e.preventDefault()
				// Sử dụng history API để điều hướng
				window.history.pushState({}, "", opts.to)
				// Gửi sự kiện để thông báo chuyển trang
				window.dispatchEvent(new Event("popstate"))
			}
		}, [isExternalLink, opts.to])

		return (
			<a
				href={opts.to}
				className={`quartz-link ${isCurrentPage ? "active" : ""} ${opts.className || ""}`}
				rel={isExternalLink ? "noopener noreferrer" : opts.rel}
				target={isExternalLink ? "_blank" : opts.target}
				onClick={handleClick}
				aria-label={opts.description}
				title={opts.description}
				style={opts.icon ? { "--icon-size": iconSize } as JSX.CSSProperties : undefined}
			>
				{opts.icon && <span className="link-icon" dangerouslySetInnerHTML={{ __html: opts.icon }}></span>}
				{opts.label && <span className="link-label">{opts.label}</span>}
			</a>
		)
	}

	Link.css = `
		.quartz-link {
			text-decoration: none;
			color: var(--dark);
			display: inline-flex;
			align-items: center;
		}
		
		.quartz-link:hover {
			text-decoration: none;
		}
		
		.quartz-link .link-icon {
			font-size: var(--icon-size, 1em);
			line-height: 1;
			display: inline-flex;
			align-items: center;
		}
		
		.quartz-link .link-icon svg {
			width: 1em;
			height: 1em;
		}
		
		.quartz-link .link-icon + .link-label {
			margin-left: 0.5rem;
		}
	`

	return Link
}) satisfies QuartzComponentConstructor<LinkOptions>