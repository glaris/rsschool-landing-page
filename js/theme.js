const themeToggleBtn = document.querySelector('.theme-toggle');
const themeToggleText = document.querySelector('.theme-toggle__text');
const currentTheme = localStorage.getItem('theme');

if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
    if (themeToggleText) themeToggleText.textContent = 'Light';
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');

        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
            if (themeToggleText) themeToggleText.textContent = 'Light';
        } else {
            localStorage.setItem('theme', 'light');
            if (themeToggleText) themeToggleText.textContent = 'Dark';
        }
    });
}
