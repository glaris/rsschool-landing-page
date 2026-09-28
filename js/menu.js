function initMobileMenu() {
    const burger = document.getElementById('burgerBtn');
    const menu = document.getElementById('mobileMenu');

    function openMenu() {
        menu.classList.add('mobile-menu--open');
        burger.classList.add('burger--open');
        burger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        menu.classList.remove('mobile-menu--open');
        burger.classList.remove('burger--open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    burger.addEventListener('click', () => {
        const isOpen = menu.classList.contains('mobile-menu--open');
        isOpen ? closeMenu() : openMenu();
    });

    menu.addEventListener('click', (e) => {
        if (e.target.closest('.mobile-menu__link')) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 769) closeMenu();
    });
}

initMobileMenu();