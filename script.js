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

  // Semua styling card via Tailwind utility classes
  article.className = [
    "project relative flex flex-col min-w-0 h-full p-7",
    "border border-line rounded-[14px] bg-white/[.015]",
    "cursor-pointer overflow-hidden transition duration-200",
    "hover:border-[#3b3f4d] hover:bg-white/[.03] hover:-translate-y-[3px]",
    "hover:shadow-[0_12px_28px_rgba(0,0,0,.35)]",
    "focus-visible:outline-none focus-visible:border-accent",
    "focus-visible:shadow-[0_0_0_2px_rgba(157,124,255,.35),0_12px_28px_rgba(0,0,0,.35)]",
  ].join(" ");

  article.tabIndex = 0;
  article.setAttribute("role", "link");
  article.setAttribute(
    "aria-label",
    `Open ${formatRepoName(repo.name)} on GitHub (opens in new tab)`
  );

  const openRepo = () => {
    window.open(repo.html_url, "_blank", "noopener,noreferrer");
  };

  article.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    openRepo();
  });

  article.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openRepo();
    }
  });

  const description = repo.description
    ? escapeHtml(repo.description)
    : "No description provided.";

  const parent = repo.parent
    ? `<p class="text-[.85rem] opacity-75 -mt-1 relative z-[1]">
         Forked from
         <a href="${repo.parent.html_url}" target="_blank" rel="noopener" class="underline">
           ${escapeHtml(repo.parent.full_name)}
         </a>
       </p>`
    : "";

  const chip = (label) =>
    `<span class="px-2.5 py-1.5 border border-line rounded-full text-[#c7cad5] font-mono text-[.7rem]">${label}</span>`;

  const starsChip = repo.stargazers_count > 0 ? chip(`★ ${repo.stargazers_count}`) : "";
  const forksChip = repo.forks_count > 0       ? chip(`⑂ ${repo.forks_count}`)       : "";

  article.innerHTML = `
    <div class="flex flex-col h-full">
      <p class="font-mono uppercase tracking-[.13em] text-[.68rem] text-accent2 mb-1">
        Updated ${formatDate(repo.updated_at)}
      </p>
      <h3 class="text-[1.35rem] leading-[1.2] tracking-[-.035em] mt-3 mb-3.5 break-words">
        ${escapeHtml(formatRepoName(repo.name))}
      </h3>
      <p class="text-muted text-justify hyphens-auto">${description}</p>
      ${parent}
      <div class="flex flex-wrap gap-2 mt-auto pt-6">
        ${starsChip}
        ${forksChip}
      </div>
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