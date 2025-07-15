// @ts-ignore
import script from "./scripts/mediaShare.inline"
import style from "./styles/mediaShare.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { i18n } from "../i18n"

interface MediaShareOptions {
	platforms: {
		facebook: boolean
		linkedin: boolean
		reddit: boolean
		twitter: boolean
		instagram: boolean
	}
}

const defaultOptions: MediaShareOptions = {
	platforms: {
		facebook: true,
		linkedin: true,
		reddit: true,
		twitter: false,
		instagram: false
	}
}

export default ((opts?: Partial<MediaShareOptions>) => {
	const options = { ...defaultOptions, ...opts }

	const MediaShare: QuartzComponent = (props: QuartzComponentProps) => {
		// Lấy FullSlug từ props.fileData và tạo URL đầy đủ
		const baseUrl = props.cfg.baseUrl ?? ""
		const fullSlug = props.fileData.slug ?? ""
		const fullUrl = `https://${baseUrl}/${fullSlug}`
		const encodedUrl = encodeURIComponent(fullUrl)

		return (
			<div className="media-share">
				<button className="share-button" id="share-button" aria-label={i18n(props.cfg.locale).components.mediaShare.title} title={i18n(props.cfg.locale).components.mediaShare.tooltip}>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-share2-icon lucide-share-2">
						<circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
					</svg>
					<span className="share-text">{i18n(props.cfg.locale).components.mediaShare.title}</span>
				</button>
				<div className="share-dropdown" id="share-dropdown">
					{options.platforms.facebook && (
						<a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="share-option">
							<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 16 16" fill="none"><path fill="#1877F2" d="M15 8a7 7 0 00-7-7 7 7 0 00-1.094 13.915v-4.892H5.13V8h1.777V6.458c0-1.754 1.045-2.724 2.644-2.724.766 0 1.567.137 1.567.137v1.723h-.883c-.87 0-1.14.54-1.14 1.093V8h1.941l-.31 2.023H9.094v4.892A7.001 7.001 0 0015 8z" />
								<path fill="#ffffff" d="M10.725 10.023L11.035 8H9.094V6.687c0-.553.27-1.093 1.14-1.093h.883V3.87s-.801-.137-1.567-.137c-1.6 0-2.644.97-2.644 2.724V8H5.13v2.023h1.777v4.892a7.037 7.037 0 002.188 0v-4.892h1.63z" />
							</svg>
							<span>Facebook</span>
						</a>
					)}
					{options.platforms.linkedin && (
						<a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="share-option">
							<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 32 32" fill="none">
								<rect x="2" y="2" width="28" height="28" rx="14" fill="#1275B1" />
								<path d="M12.6186 9.69215C12.6186 10.6267 11.8085 11.3843 10.8093 11.3843C9.81004 11.3843 9 10.6267 9 9.69215C9 8.7576 9.81004 8 10.8093 8C11.8085 8 12.6186 8.7576 12.6186 9.69215Z" fill="white" />
								<path d="M9.24742 12.6281H12.3402V22H9.24742V12.6281Z" fill="white" />
								<path d="M17.3196 12.6281H14.2268V22H17.3196C17.3196 22 17.3196 19.0496 17.3196 17.2049C17.3196 16.0976 17.6977 14.9855 19.2062 14.9855C20.911 14.9855 20.9008 16.4345 20.8928 17.5571C20.8824 19.0244 20.9072 20.5219 20.9072 22H24V17.0537C23.9738 13.8954 23.1508 12.4401 20.4433 12.4401C18.8354 12.4401 17.8387 13.1701 17.3196 13.8305V12.6281Z" fill="white" />
							</svg>
							<span>LinkedIn</span>
						</a>
					)}
					{options.platforms.reddit && (
						<a href={`https://www.reddit.com/submit?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="share-option">
							<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 32 32" fill="none">
								<path d="M16 2C8.27812 2 2 8.27812 2 16C2 23.7219 8.27812 30 16 30C23.7219 30 30 23.7219 30 16C30 8.27812 23.7219 2 16 2Z" fill="#FC471E" />
								<path fill-rule="evenodd" clip-rule="evenodd" d="M20.0193 8.90951C20.0066 8.98984 20 9.07226 20 9.15626C20 10.0043 20.6716 10.6918 21.5 10.6918C22.3284 10.6918 23 10.0043 23 9.15626C23 8.30819 22.3284 7.6207 21.5 7.6207C21.1309 7.6207 20.7929 7.7572 20.5315 7.98359L16.6362 7L15.2283 12.7651C13.3554 12.8913 11.671 13.4719 10.4003 14.3485C10.0395 13.9863 9.54524 13.7629 9 13.7629C7.89543 13.7629 7 14.6796 7 15.8103C7 16.5973 7.43366 17.2805 8.06967 17.6232C8.02372 17.8674 8 18.1166 8 18.3696C8 21.4792 11.5817 24 16 24C20.4183 24 24 21.4792 24 18.3696C24 18.1166 23.9763 17.8674 23.9303 17.6232C24.5663 17.2805 25 16.5973 25 15.8103C25 14.6796 24.1046 13.7629 23 13.7629C22.4548 13.7629 21.9605 13.9863 21.5997 14.3485C20.2153 13.3935 18.3399 12.7897 16.2647 12.7423L17.3638 8.24143L20.0193 8.90951ZM12.5 18.8815C13.3284 18.8815 14 18.194 14 17.3459C14 16.4978 13.3284 15.8103 12.5 15.8103C11.6716 15.8103 11 16.4978 11 17.3459C11 18.194 11.6716 18.8815 12.5 18.8815ZM19.5 18.8815C20.3284 18.8815 21 18.194 21 17.3459C21 16.4978 20.3284 15.8103 19.5 15.8103C18.6716 15.8103 18 16.4978 18 17.3459C18 18.194 18.6716 18.8815 19.5 18.8815ZM12.7773 20.503C12.5476 20.3462 12.2372 20.4097 12.084 20.6449C11.9308 20.8802 11.9929 21.198 12.2226 21.3548C13.3107 22.0973 14.6554 22.4686 16 22.4686C17.3446 22.4686 18.6893 22.0973 19.7773 21.3548C20.0071 21.198 20.0692 20.8802 19.916 20.6449C19.7628 20.4097 19.4524 20.3462 19.2226 20.503C18.3025 21.1309 17.1513 21.4449 16 21.4449C15.3173 21.4449 14.6345 21.3345 14 21.1137C13.5646 20.9621 13.1518 20.7585 12.7773 20.503Z" fill="white" />
							</svg>
							<span>Reddit</span>
						</a>)}
					{options.platforms.twitter && (
						<a href={`https://twitter.com/intent/tweet?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="share-option">
							<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 32 32" fill="none">
								<rect width="32" height="32" rx="16" fill="#1DA1F2" />
								<path d="M24 11.0071C23.3306 11.3037 22.6174 11.5084 21.8737 11.5991C22.6388 11.1264 23.2226 10.3978 23.4971 9.5241C22.7839 9.95201 21.9964 10.2567 21.1574 10.4176C20.4799 9.69602 19.5146 9.25 18.4616 9.25C16.4186 9.25 14.7616 10.9203 14.7616 12.9516C14.7616 13.2521 14.7984 13.5464 14.8676 13.8284C11.7959 13.6716 9.07255 12.1839 7.25336 9.92088C6.92529 10.493 6.73837 11.1264 6.73837 11.8003C6.73837 13.0752 7.37355 14.2043 8.34977 14.8587C7.7394 14.8386 7.16874 14.6739 6.67086 14.3987C6.67086 14.4141 6.67086 14.4311 6.67086 14.4481C6.67086 16.2223 7.95509 17.7015 9.6492 18.0512C9.33115 18.1404 8.99805 18.188 8.6568 18.188C8.41379 18.188 8.17924 18.1626 7.9447 18.1133C8.42875 19.5686 9.79499 20.6225 11.3969 20.6548C10.1354 21.6318 8.54345 22.2105 6.8232 22.2105C6.51337 22.2105 6.2092 22.1912 5.90503 22.1528C7.52677 23.1952 9.44719 23.7962 11.4964 23.7962C18.4524 23.7962 22.1679 18.2505 22.1679 13.4345C22.1679 13.2622 22.1633 13.0913 22.1542 12.9219C22.8766 12.3856 23.4986 11.7383 24 11.0071Z" fill="white" />
							</svg>
							<span>X (Twitter)</span>
						</a>
					)}
					{options.platforms.instagram && (
						<a href={`https://www.instagram.com/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="share-option">
							<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 32 32" fill="none">
								<rect x="2" y="2" width="28" height="28" rx="6" fill="url(#paint0_radial_87_7153)" />
								<rect x="2" y="2" width="28" height="28" rx="6" fill="url(#paint1_radial_87_7153)" />
								<rect x="2" y="2" width="28" height="28" rx="6" fill="url(#paint2_radial_87_7153)" />
								<path d="M23 10.5C23 11.3284 22.3284 12 21.5 12C20.6716 12 20 11.3284 20 10.5C20 9.67157 20.6716 9 21.5 9C22.3284 9 23 9.67157 23 10.5Z" fill="white" />
								<path fill-rule="evenodd" clip-rule="evenodd" d="M16 21C18.7614 21 21 18.7614 21 16C21 13.2386 18.7614 11 16 11C13.2386 11 11 13.2386 11 16C11 18.7614 13.2386 21 16 21ZM16 19C17.6569 19 19 17.6569 19 16C19 14.3431 17.6569 13 16 13C14.3431 13 13 14.3431 13 16C13 17.6569 14.3431 19 16 19Z" fill="white" />
								<path fill-rule="evenodd" clip-rule="evenodd" d="M6 15.6C6 12.2397 6 10.5595 6.65396 9.27606C7.2292 8.14708 8.14708 7.2292 9.27606 6.65396C10.5595 6 12.2397 6 15.6 6H16.4C19.7603 6 21.4405 6 22.7239 6.65396C23.8529 7.2292 24.7708 8.14708 25.346 9.27606C26 10.5595 26 12.2397 26 15.6V16.4C26 19.7603 26 21.4405 25.346 22.7239C24.7708 23.8529 23.8529 24.7708 22.7239 25.346C21.4405 26 19.7603 26 16.4 26H15.6C12.2397 26 10.5595 26 9.27606 25.346C8.14708 24.7708 7.2292 23.8529 6.65396 22.7239C6 21.4405 6 19.7603 6 16.4V15.6ZM15.6 8H16.4C18.1132 8 19.2777 8.00156 20.1779 8.0751C21.0548 8.14674 21.5032 8.27659 21.816 8.43597C22.5686 8.81947 23.1805 9.43139 23.564 10.184C23.7234 10.4968 23.8533 10.9452 23.9249 11.8221C23.9984 12.7223 24 13.8868 24 15.6V16.4C24 18.1132 23.9984 19.2777 23.9249 20.1779C23.8533 21.0548 23.7234 21.5032 23.564 21.816C23.1805 22.5686 22.5686 23.1805 21.816 23.564C21.5032 23.7234 21.0548 23.8533 20.1779 23.9249C19.2777 23.9984 18.1132 24 16.4 24H15.6C13.8868 24 12.7223 23.9984 11.8221 23.9249C10.9452 23.8533 10.4968 23.7234 10.184 23.564C9.43139 23.1805 8.81947 22.5686 8.43597 21.816C8.27659 21.5032 8.14674 21.0548 8.0751 20.1779C8.00156 19.2777 8 18.1132 8 16.4V15.6C8 13.8868 8.00156 12.7223 8.0751 11.8221C8.14674 10.9452 8.27659 10.4968 8.43597 10.184C8.81947 9.43139 9.43139 8.81947 10.184 8.43597C10.4968 8.27659 10.9452 8.14674 11.8221 8.0751C12.7223 8.00156 13.8868 8 15.6 8Z" fill="white" />
								<defs>
									<radialGradient id="paint0_radial_87_7153" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12 23) rotate(-55.3758) scale(25.5196)">
										<stop stop-color="#B13589" />
										<stop offset="0.79309" stop-color="#C62F94" />
										<stop offset="1" stop-color="#8A3AC8" />
									</radialGradient>
									<radialGradient id="paint1_radial_87_7153" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(11 31) rotate(-65.1363) scale(22.5942)">
										<stop stop-color="#E0E8B7" />
										<stop offset="0.444662" stop-color="#FB8A2E" />
										<stop offset="0.71474" stop-color="#E2425C" />
										<stop offset="1" stop-color="#E2425C" stop-opacity="0" />
									</radialGradient>
									<radialGradient id="paint2_radial_87_7153" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0.5 3) rotate(-8.1301) scale(38.8909 8.31836)">
										<stop offset="0.156701" stop-color="#406ADC" />
										<stop offset="0.467799" stop-color="#6A45BE" />
										<stop offset="1" stop-color="#6A45BE" stop-opacity="0" />
									</radialGradient>
								</defs>
							</svg>
							<span>Instagram</span>
						</a>
					)}
					<button className="share-option copy-link" id="copy-link">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
							<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
						</svg>
						<span>{i18n(props.cfg.locale).components.mediaShare.copyLink}</span>
					</button>
				</div>
			</div>
		)
	}

	MediaShare.css = style
	MediaShare.afterDOMLoaded = script

	return MediaShare
}) satisfies QuartzComponentConstructor
