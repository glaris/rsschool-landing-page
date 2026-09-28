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

function renderGrid(artworks, series) {
    const grid = document.querySelector('.catalog__grid');
    const seriesOrderMap = new Map(series.map(s => [s.id, s.order]));

    const sorted = [...artworks].sort((a, b) => {
        const seriesOrderA = seriesOrderMap.get(a.seriesSlug);
        const seriesOrderB = seriesOrderMap.get(b.seriesSlug);
        if (seriesOrderA !== seriesOrderB) {
            return seriesOrderA - seriesOrderB;
        }
        return a.order - b.order;
    });

    grid.innerHTML = sorted.map(renderCard).join('');
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
    const allCards = Array.from(document.querySelectorAll('.catalog__grid .card'));
    const matchingCards = allCards.filter(card =>
        seriesId === 'all' || card.dataset.seriesId === seriesId
    );

    matchingCards.forEach((card, index) => {
        card.style.display = index < currentVisibleCount ? '' : 'none';
    });

    allCards.forEach(card => {
        if (!matchingCards.includes(card)) {
            card.style.display = 'none';
        }
    });

    const moreBtn = document.querySelector('.catalog__more-btn');
    const hasMore = matchingCards.length > currentVisibleCount;
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

function formatSize(opt) {
    const [h, w] = opt.cm;
    const inch = n => (n / 2.54).toFixed(1);
    const line = `${h} × ${w} cm (${inch(h)} × ${inch(w)} in.)`;
    return opt.note ? `${line}<br>${opt.note}` : line;
}

function openModal(work) {
    const mainImage = work.images.find(img => img.type === 'main');
    const modal = document.getElementById('artworkModal');
    const content = modal.querySelector('.modal__content');

    const frameButtonsHtml = work.options && work.options.frame ? `
        <div class="modal__option-group" data-option="frame">
            ${work.options.frame.map((opt, i) => `
                <button type="button" class="modal__option-btn ${i === 0 ? 'modal__option-btn--active' : ''}" data-value="${opt.value}">
                    ${opt.label}
                </button>
            `).join('')}
        </div>
       <p class="modal__result-text" data-result="frame">${formatSize(work.options.frame[0])}</p>
    ` : '';

    content.innerHTML = `
        <div class="modal__body">
            <div class="modal__image-wrapper">
                <img src="${mainImage.src}" alt="${mainImage.alt}" class="modal__image">
            </div>
            <div class="modal__info">
                <h2 class="modal__title">${work.title}, ${work.date}</h2>
                <p class="modal__meta">From "${work.series}" series · ${work.dimensions} · ${work.medium}</p>

                ${frameButtonsHtml}

                <div class="modal__option-group" data-option="aboutFocus">
                    <button type="button" class="modal__option-btn modal__option-btn--active" data-value="artwork">About Artwork</button>
                    <button type="button" class="modal__option-btn" data-value="series">About Series</button>
                </div>
                <p class="modal__result-text" data-result="aboutFocus">${work.about.artwork}</p>
            </div>
        </div>
    `;

    content.querySelectorAll('.modal__option-group').forEach(group => {
        group.addEventListener('click', (e) => {
            const btn = e.target.closest('.modal__option-btn');
            if (!btn) return;

            group.querySelectorAll('.modal__option-btn').forEach(b =>
                b.classList.toggle('modal__option-btn--active', b === btn)
            );

            const optionType = group.dataset.option;
            const value = btn.dataset.value;
            const resultEl = content.querySelector(`[data-result="${optionType}"]`);

            if (optionType === 'aboutFocus') {
                resultEl.textContent = work.about[value];
            }
            if (optionType === 'frame') {
                const chosen = work.options.frame.find(f => f.value === value);
                resultEl.innerHTML = formatSize(chosen);
            }
        });
    });

    modal.classList.add('modal--open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('artworkModal');
    modal.classList.remove('modal--open');
    document.body.style.overflow = '';
}

function initModalEvents(artworks) {
    document.querySelector('.catalog__grid').addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (!card) return;
        const work = artworks.find(w => w.id === card.dataset.id);
        if (work) openModal(work);
    });

    document.querySelector('.modal__close').addEventListener('click', closeModal);
    document.querySelector('.modal__overlay').addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

async function initCatalog() {
    const artworks = await loadArtworks();
    const series = await loadSeries();
    renderGrid(artworks, series);
    renderFilterButtons(series);
    initFilterEvents();
    initShowMoreButton();
    initModalEvents(artworks);
    setActiveFilter('all');
}

initCatalog();
