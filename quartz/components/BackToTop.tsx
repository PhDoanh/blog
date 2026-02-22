import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const BackToTop: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
	return (
		<div id="progress" class={classNames(displayClass)} title="Back to top">
			<span id="progress-value">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-icon lucide-arrow-up">
					<path d="m5 12 7-7 7 7" />
					<path d="M12 19V5" />
				</svg>
			</span>
		</div>
	)
}

BackToTop.css = `
#progress {
	cursor: pointer;
	z-index: 1;
	border-radius: 50%;
	place-items: center;
	width: 2rem;
	height: 2rem;
	position: fixed;
	bottom: 1.5rem;
	left: 50%;
	transform: translateX(-50%) translateY(20px);
	display: none;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
	transition: all 200ms ease;
	opacity: 0;
	visibility: hidden;
}

#progress.visible {
	opacity: 1;
	visibility: visible;
	transform: translateX(-50%) translateY(0);
	display: grid;
}

#progress:hover {
	transform: translateX(-50%) translateY(-2px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.31);
}

#progress-value {
	background-color: var(--light);
	border-radius: 50%;
	place-items: center;
	display: grid;
	width: calc(100% - 0.4rem);
	height: calc(100% - 0.4rem);
}

#progress-value svg {
	height: 1.2rem;
	width: 1.2rem;
}
`

BackToTop.afterDOMLoaded = `
let lastScrollPosition = 0;

let calcScrollValue = () => {
	let scrollProgress = document.getElementById("progress");
	if (!scrollProgress) return;
	
	let progressValue = document.getElementById("progress-value");
	let pos = document.documentElement.scrollTop;
	let calcHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
	let scrollValue = Math.round((pos * 100) / calcHeight);
	
	if (pos > 300 && pos <= lastScrollPosition) {
		scrollProgress.classList.add("visible");
	} else {
		scrollProgress.classList.remove("visible");
	}
	
	lastScrollPosition = pos;
	
	scrollProgress.style.background = \`conic-gradient(var(--secondary) \${scrollValue}%, var(--gray) \${scrollValue}%)\`;
};

let scrollToTop = () => {
	window.scrollTo({
		top: 0,
		behavior: "smooth"
	});
};

let setupBackToTop = () => {
	const scrollProgress = document.getElementById("progress");
	if (scrollProgress) {
		scrollProgress.addEventListener("click", scrollToTop);
	}
	window.onscroll = calcScrollValue;
	calcScrollValue();
};

document.addEventListener("DOMContentLoaded", setupBackToTop);
document.addEventListener("nav", setupBackToTop);

window.addCleanup?.(() => {
	window.onscroll = null;
	const scrollProgress = document.getElementById("progress");
	if (scrollProgress) {
		scrollProgress.removeEventListener("click", scrollToTop);
	}
});
`

export default (() => BackToTop) satisfies QuartzComponentConstructor
