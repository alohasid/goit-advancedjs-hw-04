import { fetchImages } from './js/pixabay-api.js';
import { renderGallery, clearGallery } from './js/render-functions.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const loadMoreBtn = document.createElement('button');
loadMoreBtn.textContent = 'Load more';
loadMoreBtn.classList.add('load-more');
loadMoreBtn.style.display = 'none';
document.body.appendChild(loadMoreBtn);

let lightbox = new SimpleLightbox('.gallery a');
let currentPage = 1;
let currentQuery = '';
let totalHits = 0;

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = event.target.elements.searchQuery.value.trim();

  if (!query) {
    iziToast.error({ title: 'Error', message: 'Search query cannot be empty!' });
    return;
  }

  currentQuery = query;
  currentPage = 1;
  totalHits = 0;
  clearGallery(gallery);
  loadMoreBtn.style.display = 'none';
  loader.style.display = 'block';

  try {
    const data = await fetchImages(query, currentPage);
    loader.style.display = 'none';

    if (data.hits.length === 0) {
      iziToast.warning({ title: 'No Results', message: 'Sorry, there are no images matching your search query.' });
      return;
    }

    totalHits = data.totalHits;
    gallery.innerHTML = renderGallery(data.hits);
    lightbox.refresh();
    loadMoreBtn.style.display = 'block';
  } catch (error) {
    loader.style.display = 'none';
    iziToast.error({ title: 'Error', message: 'Failed to fetch images. Please try again later.' });
  }
});

loadMoreBtn.addEventListener('click', async () => {
  currentPage += 1;
  loader.style.display = 'block';

  try {
    const data = await fetchImages(currentQuery, currentPage);
    loader.style.display = 'none';

    gallery.insertAdjacentHTML('beforeend', renderGallery(data.hits));
    lightbox.refresh();

    if (currentPage * 15 >= totalHits) {
      loadMoreBtn.style.display = 'none';
      iziToast.info({ title: 'End of Results', message: "We're sorry, but you've reached the end of search results." });
    }

    const { height } = gallery.firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: height * 2,
      behavior: 'smooth',
    });
  } catch (error) {
    loader.style.display = 'none';
    iziToast.error({ title: 'Error', message: 'Failed to fetch images. Please try again later.' });
  }
});