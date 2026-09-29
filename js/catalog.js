async function loadArtworks() {
    const response = await fetch('data/artworks.json');
    const artworks = await response.json();
    return artworks;
}

async function loadSeries() {
    const response = await fetch('data/series.json');
    const series = await response.json();
    return series;
}

function renderCard(work) {
    const mainImage = work.images.find(img => img.type === 'main');

    return `
        <article class="card" data-id="${work.id}" data-series-id="${work.seriesSlug}">
            <div class="card__image-wrapper">
                <img src="${mainImage.src}" alt="${mainImage.alt}" class="card__image">
            </div>
            <div class="card__content">
                <h2 class="card__title"><span class="card__label">Title:</span> ${work.title}</h2>
                <p class="card__series"><span class="card__label">Series:</span> ${work.series}</p>
                <p class="card__date"><span class="card__label">Date:</span> ${work.date}</p>
                <p class="card__dimensions"><span class="card__label">Dimensions:</span> ${work.dimensions}</p>
                <p class="card__medium"><span class="card__label">Medium:</span> ${work.medium}</p>
            </div>
        </article>
    `;
}

let sortedArtworksCache = [];

function renderGrid(artworks, series) {
    const seriesOrderMap = new Map(series.map(s => [s.id, s.order]));

    sortedArtworksCache = [...artworks].sort((a, b) => {
        const seriesOrderA = seriesOrderMap.get(a.seriesSlug);
        const seriesOrderB = seriesOrderMap.get(b.seriesSlug);
        if (seriesOrderA !== seriesOrderB) {
            return seriesOrderA - seriesOrderB;
        }
        return a.order - b.order;
    });
}

function renderFilterButtons(series) {
    const filterContainer = document.querySelector('.catalog__filter');

    const allButton = series.find(s => s.id === 'all');
    const sortedSeries = series
        .filter(s => s.id !== 'all')
        .sort((a, b) => a.order - b.order);

    const orderedSeries = [allButton, ...sortedSeries];

    filterContainer.innerHTML = orderedSeries.map(oneSeries => `
        <button type="button" class="filter__btn" data-series-id="${oneSeries.id}">
            ${oneSeries.label}
        </button>
    `).join('');
}

function setActiveFilter(seriesId) {
    document.querySelectorAll('.filter__btn').forEach(btn => {
        btn.classList.toggle('filter__btn--active', btn.dataset.seriesId === seriesId);
    });

    currentVisibleCount = CARDS_PER_PAGE;
    updateCardsVisibility(seriesId);
}

const CARDS_PER_PAGE = 6;
let currentVisibleCount = CARDS_PER_PAGE;


function updateCardsVisibility(seriesId) {
    const grid = document.querySelector('.catalog__grid');
    const matchingWorks = sortedArtworksCache.filter(work =>
        seriesId === 'all' || work.seriesSlug === seriesId
    );

    const visibleWorks = matchingWorks.slice(0, currentVisibleCount);
    grid.innerHTML = visibleWorks.map(renderCard).join('');

    const moreBtn = document.querySelector('.catalog__more-btn');
    const hasMore = matchingWorks.length > currentVisibleCount;
    moreBtn.style.display = hasMore ? '' : 'none';
}

function initShowMoreButton() {
    const moreBtn = document.querySelector('.catalog__more-btn');
    moreBtn.addEventListener('click', () => {
        const activeBtn = document.querySelector('.filter__btn--active');
        const seriesId = activeBtn ? activeBtn.dataset.seriesId : 'all';
        currentVisibleCount += CARDS_PER_PAGE;
        updateCardsVisibility(seriesId);
    });
}

function initFilterEvents() {
    const filterContainer = document.querySelector('.catalog__filter');
    filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter__btn');
        if (!btn) return;
        setActiveFilter(btn.dataset.seriesId);
    });
}

async function initCatalog() {
    const artworks = await loadArtworks();
    const series = await loadSeries();

    renderFilterButtons(series);
    renderGrid(artworks, series);
    initFilterEvents();
    initShowMoreButton();
    initModalEvents(artworks);
    setActiveFilter('all');
}

initCatalog();
