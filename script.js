const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle?.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

document.getElementById("year").textContent = new Date().getFullYear();

const GITHUB_USERNAME = "Aldiansyah-ar";

const EXCLUDED_REPOS = new Set([
  "archive",
  "Aldiansyah-ar.github.io",
  "Aldiansyah-ar",
]);

const repoContainer = document.getElementById("github-repos");
const repoStatus = document.getElementById("github-repos-status");

/* ---------- Helpers ---------- */
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatRepoName(name = "") {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[-_.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function createRepoCard(repo) {
  const article = document.createElement("article");
  article.className = "project";

  const description = repo.description
    ? escapeHtml(repo.description)
    : "No description provided.";

  const parent = repo.parent
    ? `<p class="fork-source">Forked from
         <a href="${repo.parent.html_url}" target="_blank" rel="noopener">
           ${escapeHtml(repo.parent.full_name)}
         </a>
       </p>`
    : "";

  const starsChip =
    repo.stargazers_count > 0 ? `<span>★ ${repo.stargazers_count}</span>` : "";
  const forksChip =
    repo.forks_count > 0 ? `<span>⑂ ${repo.forks_count}</span>` : "";

  article.innerHTML = `
    <div>
      <p class="tag">Updated ${formatDate(repo.updated_at)}</p>
      <h3>${escapeHtml(formatRepoName(repo.name))}</h3>
      <p>${description}</p>
      ${parent}
      <div class="chips">
        ${starsChip}
        ${forksChip}
      </div>
      <a class="text-link" href="${repo.html_url}" target="_blank" rel="noopener">
        View on GitHub ↗
      </a>
    </div>
  `;
  return article;
}

async function fetchGitHubRepos() {
  if (!repoContainer) return;

  repoStatus.textContent = "Loading repositories…";
  repoStatus.classList.remove("error");

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`,
      { headers: { Accept: "application/vnd.github+json" } }
    );

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const repos = await res.json();

    const filtered = repos
      .filter((r) => !EXCLUDED_REPOS.has(r.name))
      .sort((a, b) => {
        if (b.stargazers_count !== a.stargazers_count) {
          return b.stargazers_count - a.stargazers_count;
        }
        return new Date(b.updated_at) - new Date(a.updated_at);
      });

    repoContainer.innerHTML = "";

    if (filtered.length === 0) {
      repoStatus.textContent = "No public repositories to display.";
      return;
    }

    const fragment = document.createDocumentFragment();
    filtered.forEach((repo) => fragment.appendChild(createRepoCard(repo)));
    repoContainer.appendChild(fragment);

    repoStatus.textContent = `Showing ${filtered.length} repositories from GitHub`;
  } catch (err) {
    console.error(err);
    repoStatus.textContent =
      "Could not load repositories from GitHub right now. Please visit the GitHub profile directly.";
    repoStatus.classList.add("error");
  }
}

fetchGitHubRepos();