document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DADOS E RENDERIZAÇÃO DO CATÁLOGO ---
    const productGrid = document.getElementById('product-grid');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.cat-card'); 
    const numeroWhatsApp = '5511991857347'; 
    let produtosData = [];

    // Busca os produtos no JSON
    fetch('data/produtos.json')
        .then(response => {
            if(!response.ok) throw new Error('Erro ao carregar os dados');
            return response.json();
        })
        .then(data => {
            produtosData = data;
            renderProducts(produtosData);
        })
        .catch(error => {
            console.error(error);
            if(productGrid) {
                productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Erro ao carregar o catálogo. Tente novamente mais tarde.</p>';
            }
        });

    // Função para renderizar os cards com o NOVO DESIGN
    function renderProducts(produtos) {
        if(!productGrid) return;
        productGrid.innerHTML = ''; // Limpa o grid

        if(produtos.length === 0) {
            productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Nenhum produto encontrado.</p>';
            return;
        }

        produtos.forEach(produto => {
            const card = document.createElement('div');
            card.classList.add('card');
            
            // Link dinâmico do WhatsApp
            const msgCodificada = encodeURIComponent(produto.whatsappMensagem);
            const linkWhats = `https://wa.me/${numeroWhatsApp}?text=${msgCodificada}`;

            card.innerHTML = `
                <!-- Correção do onerror para evitar loop infinito e tela piscando -->
                <img src="${produto.imagem}" alt="${produto.nome}" class="card-img" loading="lazy" onerror="this.onerror=null; this.src='https://via.placeholder.com/300x300?text=Sem+Imagem'">
                <h3 class="card-title">${produto.nome}</h3>
                <div class="card-details">
                    <p>${produto.altura}</p>
                </div>
                <p class="card-price">R$ ${produto.preco}</p>
                
                <!-- Botões circulares novos -->
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
    if(filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Garante que o clique registre a div principal (.cat-card)
                const cardBtn = e.target.closest('.cat-card');
                if(!cardBtn) return;

                // Remove classe active de todos e adiciona no clicado
                filterBtns.forEach(b => b.classList.remove('active'));
                cardBtn.classList.add('active');

                const categoriaSelecionada = cardBtn.getAttribute('data-filter');
                
                if(categoriaSelecionada === 'Todos') {
                    renderProducts(produtosData);
                } else {
                    const filtrados = produtosData.filter(prod => prod.categoria === categoriaSelecionada);
                    renderProducts(filtrados);
                }
                
                // Limpa a barra de busca ao usar botões de filtro
                if(searchInput) searchInput.value = '';
            });
        });
    }

    // --- 3. SISTEMA DE BUSCA ---
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase();
            
            const filtrados = produtosData.filter(prod => {
                return prod.nome.toLowerCase().includes(termo) || 
                       prod.categoria.toLowerCase().includes(termo);
            });

            // Reseta os botões de filtro para "Todos" visualmente
            filterBtns.forEach(b => b.classList.remove('active'));
            const btnTodos = document.querySelector('[data-filter="Todos"]');
            if(btnTodos) btnTodos.classList.add('active');

            renderProducts(filtrados);
        });
    }

    // --- 4. MENU MOBILE ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if(mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            if (navMenu.style.display === 'block') {
                navMenu.style.display = 'none';
            } else {
                navMenu.style.display = 'block';
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navMenu.style.display = 'none';
                }
            });
        });
    }

    // --- 5. ANIMAÇÕES NO SCROLL (Intersection Observer) ---
    const faders = document.querySelectorAll('.fade-in');
    
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); 
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // --- 6. ATUALIZA O ANO NO FOOTER ---
    const yearSpan = document.getElementById('year');
    if(yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- 7. CARROSSEL DE CATEGORIAS (Arrastar e Setas) ---
    const carousel = document.getElementById('categoryFilters');
    const prevBtn = document.getElementById('prevCat');
    const nextBtn = document.getElementById('nextCat');

    if (carousel) {
        // Controle das setinhas
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                carousel.scrollBy({ left: -250, behavior: 'smooth' });
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                carousel.scrollBy({ left: 250, behavior: 'smooth' });
            });
        }

        // Lógica para arrastar com o Mouse no Desktop
        let isDown = false;
        let startX;
        let scrollLeft;

        carousel.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });
        
        carousel.addEventListener('mouseleave', () => {
            isDown = false;
        });
        
        carousel.addEventListener('mouseup', () => {
            isDown = false;
        });
        
        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2; // Multiplicador de velocidade do arrasto
            carousel.scrollLeft = scrollLeft - walk;
        });
    }

});