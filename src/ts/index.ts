// index.ts
import { fetchMoviesByEndpoint, fetchTVByEndpoint, searchTMDB } from "./api.js";
import { showPopup } from "./shared.js";
import { protectRoute, deleteSavedUser, redirectToSignIn } from "./auth.js";

// DOM elements
const trendingList = document.getElementById("trendingList")!;
const topRatedList = document.getElementById("topRatedList")!;
const tvSeriesList = document.getElementById("tvSeriesList")!;
const nav = document.getElementById("mainNav");
const navbarCollapse = document.getElementById('navbarContent');
const signoutBtn = document.getElementById("signoutBtn")!;

// On DOM ready
document.addEventListener("DOMContentLoaded", async () => {
    protectRoute(); // Redirect if not signed in
    initSearch();   // Initialize search functionality

    if (nav) {
        const navHeight = nav.offsetHeight;
        document.body.style.paddingTop = `${navHeight}px`;
    }

    if (nav && navbarCollapse) {
        navbarCollapse.addEventListener('show.bs.collapse', () => {
            nav.classList.add('show-bg-on-toggle');
        });

        navbarCollapse.addEventListener('hide.bs.collapse', () => {
            nav.classList.remove('show-bg-on-toggle');
        });
    }

    try {
        const trending = await fetchMoviesByEndpoint("trending/movie/week");
        const topRated = await fetchMoviesByEndpoint("movie/top_rated");
        const tvShows = await fetchTVByEndpoint("tv/popular");

        renderMediaList(trendingList, trending, "movie");
        renderMediaList(topRatedList, topRated, "movie");
        renderMediaList(tvSeriesList, tvShows, "tv");
    } catch (error) {
        showPopup("Failed to load content. Try again later.");
    }
});

function initSearch() {
    const searchInput = document.getElementById("searchInput") as HTMLInputElement;
    const mainContainer = document.querySelector("main");
    let searchSection: HTMLElement | null = null;

    if (!searchInput || !mainContainer) return;

    searchInput.addEventListener("input", async () => {
        const query = searchInput.value.trim();

        // Remove section if input is cleared
        if (!query) {
            if (searchSection) {
                searchSection.remove();
                searchSection = null;
            }
            return;
        }

        if (!searchSection) {
            searchSection = document.createElement("section");
            searchSection.id = "searchResults";
            searchSection.className = "mb-5";
            mainContainer.prepend(searchSection);
        }

        try {
            const results = await searchTMDB(query);
            const filtered = results.filter(media =>
                media.poster_path && (media.media_type === "movie" || media.media_type === "tv")
            );

            if (filtered.length === 0) {
                searchSection.innerHTML = `<h4 class="text-white">No results found for "${query}"</h4>`;
                return;
            }

            renderMediaList(searchSection, filtered, undefined, `Results for: "${query}"`);
        } catch (error) {
            console.error("Search failed:", error);
            searchSection.innerHTML = `<p class="text-danger">Failed to load search results. Please try again later.</p>`;
        }
    });
}

// Render media cards (used for both movie & TV lists or search)
function renderMediaList(
    container: HTMLElement,
    mediaList: any[],
    defaultType?: "movie" | "tv",
    heading?: string
) {
    container.innerHTML = "";

    if (heading) {
        const h4 = document.createElement("h4");
        h4.className = "text-white mb-3";
        h4.textContent = heading;
        container.appendChild(h4);
    }

    // Determine layout style based on target section
    const isHorizontalScroll = container.id === "trendingList" || container.id === "topRatedList" || container.id === "tvSeriesList";

    const wrapper = document.createElement("div");
    wrapper.className = isHorizontalScroll
        ? "scroll-container d-flex flex-nowrap gap-3 overflow-auto"
        : "scroll-container d-flex flex-wrap gap-3";

    wrapper.innerHTML = mediaList.map(media => {
        const id = media.id;
        const type = media.media_type || media.type || defaultType || "movie";
        const title = media.title || media.name;
        const poster = media.poster_path;
        const rating = media.vote_average ?? 0;

        return `
            <div class="card" style="width: 10rem; flex: 0 0 auto; cursor: pointer;" data-id="${id}" data-type="${type}">
                <img src="https://image.tmdb.org/t/p/w500${poster}" class="card-img-top" alt="${title}">
                <div class="card-body p-2">
                    <h6 class="card-title text-truncate mb-0">${title}</h6>
                    <small><i class="fa-solid fa-star text-warning"></i> ${rating.toFixed(1)}</small>
                </div>
            </div>
        `;
    }).join("");

    container.appendChild(wrapper);

    // Add click listeners
    wrapper.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", () => {
            const id = (card as HTMLElement).dataset.id;
            const type = (card as HTMLElement).dataset.type;
            if (id && type) {
                window.location.href = `details.html?id=${id}&type=${type}`;
            }
        });
    });
}

// Navbar scroll effect
window.addEventListener("scroll", () => {
    if (!nav) return;

    if (window.scrollY > 10) {
        nav.classList.add("scrolled");
    } else {
        nav.classList.remove("scrolled");
    }
});

// Signout
signoutBtn.addEventListener("click", () => {
    deleteSavedUser();
    redirectToSignIn();
});
