'Use strict';

import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { fetchImages } from './js/fetchImages';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadBtn: document.querySelector('.load-more'),
};

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  disableScroll: true,
  scrollZoom: false,
});

const per_page = 40;
let currentInputValue = null;
let page = 1;

refs.form.addEventListener('submit', onSearch);

refs.loadBtn.addEventListener('click', onLoad);

async function onSearch(e) {
  e.preventDefault();
  const inputValue = refs.form.elements.searchQuery.value;
  if (currentInputValue !== inputValue) {
    page = 1;
  }
  refs.loadBtn.classList.add('disable');
  refs.gallery.innerHTML = '';
  try {
    const {
      data: { totalHits },
      data: { hits },
    } = await fetchImages(inputValue, per_page, page);
    if (!inputValue) {
      return;
    }
    if (!hits.length) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    if (page < 2) {
      Notify.info(`Hooray! We found ${totalHits} images.`);
    }
    renderCards(hits);
    smoothScroll();
    lightbox.refresh();
    page += 1;
    currentInputValue = inputValue;
    refs.loadBtn.classList.remove('disable');
  } catch (error) {
    console.log(error);
  }
}

async function onLoad(e) {
  e.preventDefault();
  const inputValue = refs.form.elements.searchQuery.value;
  try {
    const {
      data: { totalHits },
      data: { hits },
    } = await fetchImages(inputValue, per_page, page);
    if (page > Math.floor(totalHits / per_page)) {
      refs.loadBtn.classList.add('disable');
      Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }
    renderCards(hits);
    smoothScroll();
    lightbox.refresh();
    page += 1;
  } catch (error) {
    console.log(error);
  }
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function renderCards(cards) {
  const markup = cards
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a href="${largeImageURL}" class="photo-card">
      <img src="${webformatURL}" alt="${tags}" loading="lazy" />
      <div class="info">
        <p class="info-item">
          <b>Likes</b>${likes}
        </p>
        <p class="info-item">
          <b>Views</b>${views}
        </p>
        <p class="info-item">
          <b>Comments</b>${comments}
        </p>
        <p class="info-item">
          <b>Downloads</b>${downloads}
        </p>
      </div>
      </a>`;
      }
    )
    .join('');

  refs.gallery.insertAdjacentHTML('beforeend', markup);
}
