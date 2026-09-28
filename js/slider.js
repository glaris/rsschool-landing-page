let currentIndex = 0;
let slidesCount = 0;

async function loadArtworks() {
    const response = await fetch('data/artworks.json');
    const artworks = await response.json();
    return artworks;
}

function renderSlide(work) {
    let fragmentImage = work.images.find(img => img.type === 'fragment');
    let imgSrc = fragmentImage ? fragmentImage.src : '';

    if (work.id === 'the-cut-drawing') {
        imgSrc = 'img/drawings/head-garden/the-cut-fragment.webp';
    }

    return `
        <figure class="slider__slide" data-id="${work.id}">
            <img class="slider__image" src="${imgSrc}" alt="${work.title}">
        </figure>
    `;
}

function renderSlider(sliderWorks) {
    const track = document.querySelector('.slider__track');
    track.innerHTML = sliderWorks.map(renderSlide).join('');
    slidesCount = sliderWorks.length;
}

function updateSliderPosition() {
    const track = document.querySelector('.slider__track');
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
}

function initSliderEvents() {
    const prevBtn = document.querySelector('.slider__arrow--prev');
    const nextBtn = document.querySelector('.slider__arrow--next');

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = slidesCount - 1;
        }

        updateSliderPosition();
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex < slidesCount - 1) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }

        updateSliderPosition();
    });
}

async function initSlider() {
    const artworks = await loadArtworks();

    const targetIds = [
        'the-cut-drawing',
        'search-red-flags',
        'cyberfreaks'
    ];

    const sliderWorks = artworks.filter(work =>
        targetIds.includes(work.id)
    );

    renderSlider(sliderWorks);
    initSliderEvents();
}

initSlider();