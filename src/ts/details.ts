import {
  fetchDetailsAndCredits
} from "./api.js";

import { showPopup } from "./shared.js";
import { getSavedUser } from "./auth.js";

interface Review {
  userName: string;
  review: string;
}

interface User {
  id: number;
  email: string;
}

let reviews: Review[] = [];
let currentUser: User | null = null;

document.addEventListener('DOMContentLoaded', () => {
  const userData = getSavedUser();
  currentUser = userData ? JSON.parse(userData) : null;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));
  const type = params.get('type') as 'movie' | 'tv';

  if (!id || !type) {
    const container = document.getElementById('details-container');
    if (container) container.innerHTML = '<p>Invalid media ID or type.</p>';
    return;
  }

  renderDetails(type, id);
});

async function renderDetails(type: 'movie' | 'tv', id: number) {
  try {
    const { details, cast } = await fetchDetailsAndCredits(type, id);
    reviews = JSON.parse(localStorage.getItem(String(id)) || '[]');
    const container = document.getElementById('details-container')!;

    let duration = '';
    if (details.seasons) {
      duration = `${details.number_of_seasons} Seasons`;
    } else if (details.runtime) {
      const h = Math.floor(details.runtime / 60);
      const m = details.runtime % 60;
      duration = `${h}h ${m}m`;
    }

    container.innerHTML = `
      <section class="details">
        <div class="hero" style="background-image: url('https://image.tmdb.org/t/p/w1280${details.backdrop_path}')">
          <h2 class="hero__title">${details.name || details.title}</h2>
          <div class="hero__btns">
            <a href="#" class="btn btn-danger"><img src="images/play.png" alt=""> <span>Play</span></a>
            <a href="#" class="btn btn-danger"><img src="images/Plus.png" alt=""></a>
          </div>
        </div>

        <div class="media-info">
          <div class="media-info__wrapper">
            <span>${details.release_date?.split('-')[0] || details.last_air_date?.split('-')[0]}</span>
            <span>${duration}</span>
            <span><img src="images/hd.png" alt=""></span>
            <span><img src="images/AD.png" alt=""></span>
            <span><img src="images/subtitles.png" alt=""></span>
          </div>
          <p>${details.overview.slice(0, 250)}...</p>
          <p><strong>Genre:</strong> ${details.genres.map((g: any) => g.name).join(', ')}</p>
          ${cast.length ? `<p><strong>Cast:</strong> ${cast.slice(0, 4).map(c => c.name).join(', ')}</p>` : ''}
        </div>

        <div class="media__reviews">
          <h3>Leave a review</h3>
          <form id="review-form">
            <textarea class="review__textarea" placeholder="Write your review..." required></textarea>
            <button type="submit" class="btn btn-danger">Submit</button>
          </form>
          <ul class="reviews__container"></ul>
        </div>
      </section>
    `;

    renderReviews(reviews);

    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
      reviewForm.addEventListener('submit', (e) => addReview(e, id));
    }
  } catch (error) {
    showPopup(`Error rendering details: ${error}`);
  }
}

function addReview(e: Event, id: number) {
  e.preventDefault();
  if (!currentUser) {
    showPopup('Please sign in to leave a review.');
    return;
  }

  const textarea = document.querySelector('.review__textarea') as HTMLTextAreaElement;
  const content = textarea.value.trim();
  if (!content) return;

  reviews.push({ userName: currentUser.email, review: content });
  localStorage.setItem(String(id), JSON.stringify(reviews));
  textarea.value = '';
  renderReviews(reviews);
}

function renderReviews(reviews: Review[]) {
  const container = document.querySelector('.reviews__container')!;
  container.innerHTML = reviews.map(r => `
    <li>
      <h4>${r.userName}</h4>
      <p>${r.review}</p>
    </li>
  `).join('');
}
