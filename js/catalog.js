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

function renderGrid(artworks) {
    const grid = document.querySelector('.catalog__grid');
    const sorted = [...artworks].sort((a, b) => a.order - b.order);
    grid.innerHTML = sorted.map(renderCard).join('');
}

function renderFilterButtons(series) {
    const filterContainer = document.querySelector('.catalog__filter');
    filterContainer.innerHTML = series.map(oneSeries => `
        <button type="button" class="filter__btn" data-series-id="${oneSeries.id}">
            ${oneSeries.label}
        </button>
    `).join('');
}

function setActiveFilter(seriesId) {
    document.querySelectorAll('.filter__btn').forEach(btn => {
        btn.classList.toggle('filter__btn--active', btn.dataset.seriesId === seriesId);
    });

    document.querySelectorAll('.catalog__grid .card').forEach(card => {
        const matches = seriesId === 'all' || card.dataset.seriesId === seriesId;
        card.style.display = matches ? '' : 'none';
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
    renderGrid(artworks);
    renderFilterButtons(series);
    initFilterEvents();
    setActiveFilter('all');
}

initCatalog();