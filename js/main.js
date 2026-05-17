async function loadContent(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

async function applySettings() {
    const settings = await loadContent('/content/settings.json');
    if (!settings) return;
    if (settings.header_phone) {
        document.querySelector('.header__phone').textContent = settings.header_phone;
        document.querySelector('.header__phone').href = 'tel:' + settings.header_phone.replace(/[^+\d]/g, '');
    }
    if (settings.footer_phone) {
        document.querySelector('.footer__phone').textContent = settings.footer_phone;
        document.querySelector('.footer__phone').href = 'tel:' + settings.footer_phone.replace(/[^+\d]/g, '');
    }
    if (settings.email) {
        document.querySelector('.footer__email').textContent = settings.email;
        document.querySelector('.footer__email').href = 'mailto:' + settings.email;
    }
    if (settings.address) document.querySelector('.footer__address').textContent = settings.address;
    document.querySelectorAll('.header__schedule, .footer__schedule').forEach(el => {
        if (settings.schedule) el.textContent = settings.schedule;
    });
    if (settings.copyright_year) {
        document.querySelector('.footer__bottom p').textContent = `© ${settings.copyright_year} Табуретка. Все права защищены.`;
    }
}

async function applyHero() {
    const hero = await loadContent('/content/hero.json');
    if (!hero) return;
    if (hero.title) document.querySelector('.hero__title').innerHTML = hero.title.replace(/\n/g, '<br>');
    if (hero.subtitle) document.querySelector('.hero__subtitle').textContent = hero.subtitle;
    if (hero.stats) {
        const statsContainer = document.querySelector('.hero__stats');
        if (statsContainer) {
            statsContainer.innerHTML = hero.stats.map(s => `
                <div class="hero__stat">
                    <span class="hero__stat-value">${s.value}</span>
                    <span class="hero__stat-label">${s.label}</span>
                </div>
            `).join('');
        }
    }
}

async function applyAdvantages() {
    const data = await loadContent('/content/advantages.json');
    if (!data || !data.items) return;
    const grid = document.querySelector('.advantages__grid');
    if (grid) {
        grid.innerHTML = data.items.map(item => `
            <div class="advantage-card">
                <div class="advantage-card__icon">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="22" stroke="#8B7355" stroke-width="2"/>
                        <path d="M15 24l6 6 12-12" stroke="#8B7355" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h3 class="advantage-card__title">${item.title}</h3>
                <p class="advantage-card__text">${item.text}</p>
            </div>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applySettings();
    applyHero();
    applyAdvantages();

    const catalogBtn = document.getElementById('catalogBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuClose = document.getElementById('menuClose');
    const categoryLinks = document.querySelectorAll('[data-category]');

    function openMenu() {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    }

    catalogBtn.addEventListener('click', openMenu);
    menuOverlay.addEventListener('click', closeMenu);
    menuClose.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    categoryLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            categoryLinks.forEach((l) => l.classList.remove('active'));
            const category = link.dataset.category;
            document.querySelectorAll(`[data-category="${category}"]`).forEach((l) => l.classList.add('active'));

            const catalogSection = document.getElementById('catalog');
            if (catalogSection) {
                const cards = catalogSection.querySelectorAll('.product-card');
                const filtered = category === 'accessories'
                    ? []
                    : Array.from(cards).filter((card) => card.dataset.category === category);

                cards.forEach((card) => {
                    card.style.display = '';
                });

                if (filtered.length > 0) {
                    filtered[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }

            closeMenu();
        });
    });

    const favoriteButtons = document.querySelectorAll('.product-card__favorite');
    favoriteButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
        });
    });

    const addToCartButtons = document.querySelectorAll('.product-card__actions .btn--primary');
    addToCartButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const cartCount = document.querySelector('.header__cart-count');
            if (cartCount) {
                const current = parseInt(cartCount.textContent) || 0;
                cartCount.textContent = current + 1;
            }
            btn.textContent = 'Добавлено ✓';
            btn.disabled = true;
            btn.style.background = '#4CAF50';
            setTimeout(() => {
                btn.textContent = 'В корзину';
                btn.disabled = false;
                btn.style.background = '';
            }, 1500);
        });
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.style.boxShadow = '0 0 0 3px rgba(91, 58, 26, 0.15)';
        });
        searchInput.addEventListener('blur', () => {
            searchInput.parentElement.style.boxShadow = '';
        });
    }

    const headerMain = document.querySelector('.header__main');
    const categories = document.querySelector('.categories');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            if (categories) categories.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        } else {
            if (categories) categories.style.boxShadow = '';
        }
    });
});