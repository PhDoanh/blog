// @ts-ignore
import script from "./scripts/githubContributors.inline"
import styles from "./styles/githubContributors.scss"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

interface Options {
  // GitHub repository details
  owner: string
  repo: string
  // Maximum number of contributors to display
  limit?: number
  // Title for the contributors section
  title?: string
}

export default ((opts: Options) => {
  const GitHubContributors = ({ fileData, displayClass }: QuartzComponentProps) => {
    // Default options
    const defaultOpts = {
      limit: 10,
      title: "Contributors"
    }

    // Merge options
    const options = { ...defaultOpts, ...opts }

    // Determine API URL based on the file path
    const apiUrl = `https://api.github.com/repos/${options.owner}/${options.repo}/commits?path=${fileData.relativePath}`

    // Generate blame URL for the "view history" link
    const blameUrl = `https://github.com/${options.owner}/${options.repo}/blame/main/${fileData.relativePath}`

    return (
      <div class={classNames(displayClass, "contributors")}>
        <h3>{options.title}</h3>
        <div
          class="contributors-container"
          data-github-api-url={apiUrl}
          data-limit={options.limit}
          data-blame-url={blameUrl}
          data-repo-owner={options.owner}
          data-repo-name={options.repo}
          data-file-path={fileData.relativePath}
        >
          <p>Loading contributors...</p>
        </div>
      </div>
    )
  }

  // Add styles for the component
  GitHubContributors.css = styles

  // JavaScript to fetch and display contributors
  GitHubContributors.afterDOMLoaded = script

  return GitHubContributors
}) as QuartzComponentConstructor<Options>