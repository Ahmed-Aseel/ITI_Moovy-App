// index.ts
import { fetchMoviesByEndpoint, fetchTVByEndpoint } from "./api.js";
import { showPopup } from "./shared.js";
import { deleteSavedUser, redirectToSignIn } from "./auth.js";
// DOM elements
const trendingList = document.getElementById("trendingList");
const topRatedList = document.getElementById("topRatedList");
const tvSeriesList = document.getElementById("tvSeriesList");
const nav = document.getElementById("mainNav");
const signoutBtn = document.getElementById("signoutBtn");
// On DOM ready
document.addEventListener("DOMContentLoaded", async () => {
    if (nav) {
        const navHeight = nav.offsetHeight;
        document.body.style.paddingTop = `${navHeight}px`;
    }
    try {
        const trending = await fetchMoviesByEndpoint("trending/movie/week");
        const topRated = await fetchMoviesByEndpoint("movie/top_rated");
        const tvShows = await fetchTVByEndpoint("tv/popular");
        renderMediaCards(trendingList, trending, "movie");
        renderMediaCards(topRatedList, topRated, "movie");
        renderMediaCards(tvSeriesList, tvShows, "tv");
    }
    catch (error) {
        showPopup("Failed to load content. Try again later.");
    }
});
// Render media cards (movie or TV) into a scroll container
function renderMediaCards(container, mediaList, type) {
    container.innerHTML = mediaList.map(media => {
        const id = media.id;
        const title = media.title || media.name;
        const poster = media.poster_path;
        const rating = media.vote_average;
        return `
            <div class="card h-100 shadow-sm" data-id="${id}" data-type="${type}">
                <img src="https://image.tmdb.org/t/p/w500${poster}" class="card-img-top" alt="${title}">
                <div class="card-body">
                    <h5 class="card-title text-truncate">${title}</h5>
                    <p class="card-text"><i class="fa-solid fa-star text-warning"></i> ${rating.toFixed(1)}</p>
                </div>
            </div>
        `;
    }).join("");
    // Attach click event to each card
    container.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", () => {
            const id = card.dataset.id;
            const type = card.dataset.type;
            if (id && type) {
                window.location.href = `details.html?id=${id}&type=${type}`;
            }
        });
    });
}
// Navbar scroll effect
window.addEventListener("scroll", () => {
    if (!nav)
        return;
    if (window.scrollY > 10) {
        nav.classList.add("scrolled");
    }
    else {
        nav.classList.remove("scrolled");
    }
});
// Signout
signoutBtn.addEventListener("click", () => {
    deleteSavedUser();
    redirectToSignIn();
});
