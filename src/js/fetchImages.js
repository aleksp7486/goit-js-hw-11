'Use strict';

const axios = require('axios').default;

const URL_API = 'https://pixabay.com/api/';

export async function fetchImages(search, pageNumber = 1) {
  const params = new URLSearchParams({
    key: '30931366-a07d02e157d3797ab4f355b57',
    q: `${search}`,
    lang: 'en,ru',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page: pageNumber,
  });
  return await axios.get(`${URL_API}?${params}`);
}
