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

function showNotification(title, text) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerHTML = `
        <button class="notification__close" aria-label="Закрыть">✕</button>
        <div class="notification__title">${title}</div>
        <div class="notification__text">${text}</div>
    `;
    document.body.appendChild(notif);

    requestAnimationFrame(() => {
        notif.classList.add('show');
    });

    notif.querySelector('.notification__close').addEventListener('click', () => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 400);
    });

    setTimeout(() => {
        if (notif.parentNode) {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 400);
        }
    }, 8000);
}



async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.querySelector('#formName').value.trim();
    const phone = form.querySelector('#formPhone').value.trim();
    const date = form.querySelector('#formDate').value;

    if (!name || !phone || !date) return;

    const submitBtn = form.querySelector('.form__submit');
    submitBtn.textContent = 'Отправляем...';
    submitBtn.disabled = true;

    try {
        const msg = `Новая заявка на замер 📏

Имя: ${name}
Телефон: ${phone}
Дата: ${date}`;

        const res = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: CHAT_ID, text: msg }),
            }
        );

        if (!res.ok) throw new Error('Telegram error');

        showNotification(
            'Спасибо за заявку!',
            `${name}, мы получили вашу заявку на замер ${date}. Наш менеджер свяжется с вами в ближайшее время.<br><br>📋 Чек-лист «Что спросить у замерщика»:<br>1. Уточните стоимость доставки<br>2. Спросите про подготовку стен<br>3. Узнайте сроки изготовления<br>4. Обсудите варианты оплаты`
        );
        form.reset();
    } catch {
        showNotification(
            'Ошибка',
            'Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.'
        );
    } finally {
        submitBtn.textContent = 'Записаться на замер';
        submitBtn.disabled = false;
    }
}

const blogArticles = {
    1: {
        title: '5 ошибок при меблировке студии',
        date: '15 апреля 2026',
        content: `
            <p>Обустройство студии — задача посложнее, чем меблировка обычной квартиры. Здесь каждый квадратный метр на счету, и одна неверная покупка может превратить уютное пространство в захламлённую клетушку. Разберём пять самых частых ошибок.</p>

            <h3>1. Покупка громоздкой мебели</h3>
            <p>Соблазн поставить полноценный диван и огромный шкаф велик, но в студии такой подход крадёт 30% полезной площади. Выход: трансформеры, откидные кровати, модульные системы. Современный рынок предлагает десятки вариантов, которые днём компактны, а ночью превращаются в полноценное спальное место.</p>

            <h3>2. Отсутствие зонирования</h3>
            <p>Студия — это одна комната, выполняющая роль гостиной, спальни и кухни одновременно. Без чёткого зонирования пространство выглядит хаотичным. Используйте стеллажи, раздвижные перегородки, разные покрытия пола и освещение для разделения зон.</p>

            <h3>3. Экономия на хранении</h3>
            <p>В студии критически важна каждая система хранения. Недостаток шкафов и полок быстро приводит к тому, что вещи начинают лежать на виду, создавая визуальный шум. Продумайте системы хранения на этапе планирования — встроенные шкафы, ниши, кровати с ящиками.</p>

            <h3>4. Неправильное освещение</h3>
            <p>Одна люстра по центру потолка — худшее решение для студии. Нужна многоуровневая система: общий свет, локальный (торшеры, бра) и рабочая подсветка кухонной зоны. Это не только функционально, но и визуально расширяет пространство.</p>

            <h3>5. Игнорирование вертикального пространства</h3>
            <p>Полки под потолком, высокие шкафы, настенные крючки — используйте стены. Это освободит пол и создаст ощущение простора.</p>

            <p>Хотите избежать этих ошибок? Закажите бесплатный замер — наш дизайнер приедет, сделает проект студии с учётом всех нюансов и подберёт мебель, которая действительно подходит.</p>
        `
    },
    2: {
        title: 'Почему кухня из массива — это выгодно на 20 лет',
        date: '2 апреля 2026',
        content: `
            <p>Многие считают, что кухня из натурального дерева — это дорого и неоправданно. Давайте посчитаем реальную стоимость владения и разберёмся, почему массив окупается с лихвой.</p>

            <h3>Срок службы</h3>
            <p>Кухня из МДФ или ЛДСП служит в среднем 5–8 лет. После этого фасады теряют вид, кромка отклеивается, плита разбухает от влаги. Кухня из массива дуба или ясеня служит 20–30 лет без потери внешнего вида. При бережном уходе — ещё дольше.</p>

            <h3>Ремонтопригодность</h3>
            <p>Массив можно реставрировать: отшлифовать, затонировать, покрыть новым лаком. МДФ и ЛДСП ремонту не подлежат — только замена фасадов целиком. Через 10 лет вы просто обновите массивную кухню, а не купите новую.</p>

            <h3>Экологичность</h3>
            <p>Натуральное дерево — это безопасно. Никаких формальдегидных смол, никаких испарений. Для семьи с детьми это принципиальный момент.</p>

            <h3>Престиж и стоимость жилья</h3>
            <p>Кухня из массива — это инвестиция в стоимость квартиры. При продаже такая кухня станет весомым аргументом и повысит цену объекта.</p>

            <h3>Сравнение за 20 лет</h3>
            <p>Кухня из МДФ среднего сегмента: 150 000 ₽ × 3 замены = 450 000 ₽. Кухня из массива премиум: 350 000 ₽ × 1 раз = 350 000 ₽. Экономия очевидна, а с учётом удовольствия от использования — выбор в пользу массива становится ещё убедительнее.</p>

            <p>В нашей мастерской мы делаем кухни из массива дуба и ясеня под заказ. Индивидуальный проект, австрийская фурнитура, натуральный камень. Срок изготовления — от 30 дней.</p>
        `
    },
    3: {
        title: 'Как мы соблюдаем сроки: производство и логистика',
        date: '20 марта 2026',
        content: `
            <p>«Мебель сделают через месяц» — фраза, которая часто звучит как приговор. В нашей практике 90% заказов готовы точно в срок. Рассказываем, как нам это удаётся.</p>

            <h3>Этап 1: Замер и проект</h3>
            <p>После заявки выезжаем на объект в течение 2 дней. Замерщик не просто снимает размеры, а сразу консультирует по планировке. Через 1–2 дня готов дизайн-проект и смета. Никаких «подумаем неделю» — решения принимаем быстро.</p>

            <h3>Этап 2: Подтверждение и запуск</h3>
            <p>После утверждения проекта заявка уходит в производство. Все материалы проверены и зарезервированы заранее (наши партнёры — 40+ фабрик, с которыми мы работаем годами). Это исключает ситуацию «нужного материала нет на складе».</p>

            <h3>Этап 3: Производство</h3>
            <p>Собственное производство позволяет контролировать каждый этап. Распил, кромление, сборка — всё идёт по графику. Каждую неделю клиент получает фотоотчёт о ходе работ.</p>

            <h3>Этап 4: Доставка и сборка</h3>
            <p>Доставку планируем так, чтобы не было простоев. Штатные сборщики (не наёмные бригады) приезжают строго по графику. В день сборки мастер проверяет всю фурнитуру и комплектацию.</p>

            <h3>Почему это работает</h3>
            <p>Система: прозрачные сроки, регулярные отчёты, личная ответственность мастера. Если мы видим, что срок сдвигается (что бывает редко), предупреждаем клиента минимум за неделю и предлагаем варианты компенсации.</p>

            <p>Хотите мебель без нервотрёпки? Запишитесь на замер, и мы покажем, как должно работать.</p>
        `
    }
};

function openBlogArticle(id) {
    const article = blogArticles[id];
    if (!article) return;

    const modal = document.getElementById('blogModal');
    const content = document.getElementById('blogModalContent');
    if (!modal || !content) return;

    content.innerHTML = `
        <div style="color: var(--color-text-muted); font-size: 13px; margin-bottom: 8px;">${article.date}</div>
        <h2>${article.title}</h2>
        ${article.content}
        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--color-border); text-align: center;">
            <a href="#form-section" class="btn btn--primary" style="text-decoration: none;" onclick="document.getElementById('blogModal').classList.remove('open'); document.body.style.overflow = '';">Заказать бесплатный замер</a>
        </div>
    `;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeBlogModal() {
    const modal = document.getElementById('blogModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applySettings();
    applyHero();

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeBlogModal();
    });

    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', handleFormSubmit);
    }

    const packageBtns = document.querySelectorAll('.package-card__btn');
    packageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const formSection = document.getElementById('form-section');
            if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth' });
            }
            showNotification(
                'Вы выбрали пакет!',
                'Отличный выбор! Заполните форму для замера, и мы подберём оптимальные решения по выбранному пакету.'
            );
        });
    });

    const blogBtns = document.querySelectorAll('.blog-card__btn');
    blogBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.article);
            openBlogArticle(id);
        });
    });

    const blogModalOverlay = document.getElementById('blogModalOverlay');
    if (blogModalOverlay) {
        blogModalOverlay.addEventListener('click', closeBlogModal);
    }

    const blogModalClose = document.getElementById('blogModalClose');
    if (blogModalClose) {
        blogModalClose.addEventListener('click', closeBlogModal);
    }

    setMinDate();
});

function setMinDate() {
    const dateInput = document.getElementById('formDate');
    if (!dateInput) return;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
}