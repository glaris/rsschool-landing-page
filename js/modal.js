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
                <p class="modal__meta">Series: ${work.series} · ${work.dimensions} · ${work.medium}</p>

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