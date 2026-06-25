document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DADOS E RENDERIZAÇÃO DO CATÁLOGO ---
    const productGrid = document.getElementById('product-grid');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.cat-card');
    const numeroWhatsApp = '5511991857347';
    let produtosData = [];

    fetch('data/produtos.json')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar os dados');
            return response.json();
        })
        .then(data => {
            produtosData = data;
            renderProducts(produtosData);
        })
        .catch(error => {
            console.error(error);
            if (productGrid) {
                productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">Erro ao carregar o catálogo. Tente novamente mais tarde.</p>';
            }
        });

    function renderProducts(produtos) {
        if (!productGrid) return;
        productGrid.innerHTML = '';

        if (produtos.length === 0) {
            productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">Nenhum produto encontrado.</p>';
            return;
        }

        produtos.forEach(produto => {
            const card = document.createElement('div');
            card.classList.add('card');

            const msgCodificada = encodeURIComponent(produto.whatsappMensagem);
            const linkWhats = `https://wa.me/${numeroWhatsApp}?text=${msgCodificada}`;

            card.innerHTML = `
                <img src="${produto.imagem}" alt="${produto.nome}" class="card-img" loading="lazy"
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/300x300?text=Sem+Imagem'">
                <h3 class="card-title">${produto.nome}</h3>
                <div class="card-details">
                    <p>${produto.altura}</p>
                </div>
                <p class="card-price">R$ ${produto.preco}</p>
                <div class="card-actions">
                    <a href="${linkWhats}" target="_blank" class="btn-icon btn-icon-red" title="Comprar no WhatsApp">
                        <i class="fa-brands fa-whatsapp"></i>
                    </a>
                    <a href="${produto.shopee}" target="_blank" class="btn-icon btn-icon-outline" title="Ver na Shopee">
                        <i class="fa-solid fa-bag-shopping"></i>
                    </a>
                </div>
            `;
            productGrid.appendChild(card);
        });
    }

    // --- 2. SISTEMA DE FILTROS ---
    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cardBtn = e.target.closest('.cat-card');
                if (!cardBtn) return;

                filterBtns.forEach(b => b.classList.remove('active'));
                cardBtn.classList.add('active');

                const categoriaSelecionada = cardBtn.getAttribute('data-filter');

                if (categoriaSelecionada === 'Todos') {
                    renderProducts(produtosData);
                } else {
                    const filtrados = produtosData.filter(prod => prod.categoria === categoriaSelecionada);
                    renderProducts(filtrados);
                }

                if (searchInput) searchInput.value = '';
            });
        });
    }

    // --- 3. BUSCA ---
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase();
            const filtrados = produtosData.filter(prod =>
                prod.nome.toLowerCase().includes(termo) ||
                prod.categoria.toLowerCase().includes(termo)
            );

            filterBtns.forEach(b => b.classList.remove('active'));
            const btnTodos = document.querySelector('[data-filter="Todos"]');
            if (btnTodos) btnTodos.classList.add('active');

            renderProducts(filtrados);
        });
    }

    // --- 4. MENU MOBILE ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.style.display = navMenu.style.display === 'block' ? 'none' : 'block';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) navMenu.style.display = 'none';
            });
        });
    }

    // --- 5. ANIMAÇÕES NO SCROLL ---
    const faders = document.querySelectorAll('.fade-in');

    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    faders.forEach(fader => appearOnScroll.observe(fader));

    // --- 6. ANO NO FOOTER ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // --- 7. CARROSSEL DE CATEGORIAS ---
    const carousel = document.getElementById('categoryFilters');
    const prevBtn  = document.getElementById('prevCat');
    const nextBtn  = document.getElementById('nextCat');

    if (carousel) {
        // Setas
        if (prevBtn) prevBtn.addEventListener('click', () => carousel.scrollBy({ left: -280, behavior: 'smooth' }));
        if (nextBtn) nextBtn.addEventListener('click', () => carousel.scrollBy({ left: 280, behavior: 'smooth' }));

        // Arrastar com mouse (desktop)
        let isDown = false;
        let startX, scrollLeft;

        carousel.addEventListener('mousedown', (e) => {
            isDown = true;
            carousel.classList.add('grabbing');
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });

        carousel.addEventListener('mouseleave', () => {
            isDown = false;
            carousel.classList.remove('grabbing');
        });

        carousel.addEventListener('mouseup', () => {
            isDown = false;
            carousel.classList.remove('grabbing');
        });

        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            carousel.scrollLeft = scrollLeft - (x - startX) * 1.5;
        });

        // Ocultar/mostrar setas conforme posição do scroll
        function atualizarSetas() {
            if (prevBtn) prevBtn.style.opacity = carousel.scrollLeft <= 10 ? '0.4' : '1';
            if (nextBtn) nextBtn.style.opacity = carousel.scrollLeft >= (carousel.scrollWidth - carousel.clientWidth - 10) ? '0.4' : '1';
        }

        carousel.addEventListener('scroll', atualizarSetas);
        atualizarSetas(); // estado inicial
    }

});
