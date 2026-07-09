const app = {
    posts: [],
    currentPage: 1,
    postsPerPage: 6,

    init() {
        this.setupTheme();
        this.setupScrollEvents();
        this.setupSearch();
        this.updateDate();
        
        // Check which page we are on
        if (document.getElementById('latest-news')) {
            this.loadIndexData();
        }
    },

    setupTheme() {
        const toggleBtn = document.getElementById('theme-toggle');
        if(!toggleBtn) return;
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    },

    setupScrollEvents() {
        const progressBar = document.getElementById('scroll-progress');
        const backToTopBtn = document.getElementById('back-to-top');
        
        window.addEventListener('scroll', () => {
            // Progress bar
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            if(progressBar) progressBar.style.width = scrolled + '%';

            // Back to top button
            if(backToTopBtn) {
                if (winScroll > 300) {
                    backToTopBtn.classList.add('show');
                } else {
                    backToTopBtn.classList.remove('show');
                }
            }
        });

        if(backToTopBtn) {
            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    },

    updateDate() {
        const dateDisplay = document.getElementById('current-date');
        if (dateDisplay) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateDisplay.textContent = new Date().toLocaleDateString('en-GB', options);
        }
        const yearDisplay = document.getElementById('year');
        if (yearDisplay) yearDisplay.textContent = new Date().getFullYear();
    },

    async loadIndexData() {
        try {
            const response = await fetch('posts/posts.json');
            if (!response.ok) throw new Error("Could not load posts index");
            this.posts = await response.json();
            this.renderHomepage();
        } catch (error) {
            console.error(error);
            document.getElementById('featured-article').innerHTML = '<p>Error loading content.</p>';
        }
    },

    renderHomepage() {
        if(this.posts.length === 0) return;

        // Render Ticker
        const ticker = document.getElementById('ticker-text');
        ticker.innerHTML = this.posts.slice(0,5).map(p => `<a href="article.html?id=${p.id}">${p.title}</a>`).join(' &nbsp; | &nbsp; ');

        // Render Featured
        const featured = this.posts[0];
        const featuredSection = document.getElementById('featured-article');
        featuredSection.innerHTML = `
            <a href="article.html?id=${featured.id}" class="featured-card">
                <img src="${featured.thumbnail}" alt="${featured.title}" loading="lazy">
                <div class="featured-info">
                    <span class="cat-tag">${featured.category}</span>
                    <h2>${featured.title}</h2>
                    <div class="news-meta">By ${featured.author} • ${featured.publishDate}</div>
                </div>
            </a>
        `;

        // Render Sidebar (Trending)
        const trendingList = document.getElementById('trending-posts');
        trendingList.innerHTML = this.posts.slice(1, 5).map(p => `
            <li>
                <a href="article.html?id=${p.id}"><img src="${p.thumbnail}" alt="${p.title}" loading="lazy"></a>
                <div>
                    <span class="cat-tag" style="font-size:0.65rem; padding: 2px 5px;">${p.category}</span>
                    <h4><a href="article.html?id=${p.id}">${p.title}</a></h4>
                </div>
            </li>
        `).join('');

        // Render Latest Grid
        this.renderLatestGrid();

        // Load More logic
        const loadBtn = document.getElementById('load-more');
        loadBtn.addEventListener('click', () => {
            this.currentPage++;
            this.renderLatestGrid();
        });
    },

    renderLatestGrid() {
        const grid = document.getElementById('latest-news');
        const start = 1; // Skip featured
        const end = start + (this.currentPage * this.postsPerPage);
        const postsToShow = this.posts.slice(start, end);

        let html = '';
        postsToShow.forEach(p => {
            html += `
                <article class="news-card">
                    <a href="article.html?id=${p.id}"><img src="${p.thumbnail}" alt="${p.title}" loading="lazy"></a>
                    <div class="news-card-content">
                        <span class="cat-tag" style="font-size:0.65rem; padding: 2px 5px; background:var(--text-muted);">${p.category}</span>
                        <h3><a href="article.html?id=${p.id}">${p.title}</a></h3>
                        <p class="news-meta">${p.publishDate}</p>
                    </div>
                </article>
            `;
        });
        grid.innerHTML = html;

        if (end >= this.posts.length) {
            document.getElementById('load-more').style.display = 'none';
        }
    },

    setupSearch() {
        const btn = document.getElementById('search-btn');
        const input = document.getElementById('search-input');
        if(!btn || !input) return;

        btn.addEventListener('click', () => {
            const query = input.value.toLowerCase();
            if(query && this.posts.length > 0) {
                const results = this.posts.filter(p => p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
                // Replace main content with search results (Simplified for Vanilla JS)
                document.getElementById('featured-article').style.display = 'none';
                document.querySelector('.section-title h2').textContent = `Search Results for "${query}"`;
                
                const grid = document.getElementById('latest-news');
                grid.innerHTML = results.map(p => `
                    <article class="news-card">
                        <a href="article.html?id=${p.id}"><img src="${p.thumbnail}" alt="${p.title}"></a>
                        <div class="news-card-content">
                            <h3><a href="article.html?id=${p.id}">${p.title}</a></h3>
                        </div>
                    </article>
                `).join('');
                document.getElementById('load-more').style.display = 'none';
            }
        });
    },

    async loadArticle() {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        if (!articleId) {
            document.getElementById('article-content').innerHTML = '<h2>Article not found.</h2><a href="index.html">Return home</a>';
            return;
        }

        try {
            const response = await fetch(`posts/${articleId}.json`);
            if (!response.ok) throw new Error("Article file not found");
            const article = await response.json();
            
            // Set Meta SEO
            document.title = `${article.seoTitle} | BBC EU NEWS`;
            document.querySelector('meta[name="description"]')?.setAttribute("content", article.seoDescription);

            // Render content
            let mediaHtml = '';
            if (article.video) {
                mediaHtml = `<video controls poster="${article.thumbnail}" style="width:100%; border-radius:8px;"><source src="${article.video}" type="video/mp4"></video>`;
            } else if (article.youtubeEmbed) {
                mediaHtml = `<div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:8px; margin-bottom:20px;">
                                <iframe src="${article.youtubeEmbed}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe>
                             </div>`;
            } else {
                mediaHtml = `<img src="${article.featuredImage}" alt="${article.title}">`;
            }

            const html = `
                <div class="breadcrumb">
                    <a href="index.html">Home</a> &gt; <a href="#">${article.category}</a> &gt; ${article.title}
                </div>
                <header class="article-header">
                    <span class="cat-tag">${article.category}</span>
                    <h1>${article.title}</h1>
                    <p class="article-subtitle">${article.subtitle}</p>
                    
                    <div class="article-meta-bar">
                        <div class="author-info">By ${article.author} <br><span style="font-size:0.8rem; font-weight:normal; color:var(--text-muted)">Reading time: ${article.readingTime}</span></div>
                        <div class="article-dates">
                            Published: ${article.publishDate}<br>
                            Updated: ${article.updatedDate}
                        </div>
                    </div>
                </header>

                <div class="article-featured-media">
                    ${mediaHtml}
                    ${article.imageCaption ? `<div class="image-caption">${article.imageCaption}</div>` : ''}
                </div>

                <div class="article-body">
                    ${article.fullArticle}
                </div>

                ${article.galleryImages && article.galleryImages.length > 0 ? `
                    <h3>Gallery</h3>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:20px 0;">
                        ${article.galleryImages.map(img => `<img src="${img}" class="lightbox-trigger" style="width:100%; border-radius:4px;">`).join('')}
                    </div>
                ` : ''}

                <div class="tags-container">
                    <strong>Tags:</strong> 
                    ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>

                <div class="share-buttons">
                    <button onclick="navigator.clipboard.writeText(window.location.href); alert('Link copied!')">🔗 Copy Link</button>
                    <button onclick="window.open('https://twitter.com/intent/tweet?url='+window.location.href, '_blank')">Share on X</button>
                    <button onclick="window.open('https://www.facebook.com/sharer/sharer.php?u='+window.location.href, '_blank')">Share on Facebook</button>
                </div>
            `;

            document.getElementById('article-content').innerHTML = html;
            this.setupLightbox();
            
            // Load related sidebars (simulated by fetching index)
            this.loadRelatedSidebar();

        } catch (error) {
            document.getElementById('article-content').innerHTML = `<h2>Error loading article.</h2><p>${error.message}</p>`;
        }
    },

    setupLightbox() {
        const modal = document.getElementById("lightbox");
        const modalImg = document.getElementById("lightbox-img");
        const closeBtn = document.querySelector(".lightbox-close");
        
        document.querySelectorAll('.article-body img, .lightbox-trigger').forEach(img => {
            img.addEventListener('click', function() {
                modal.style.display = "block";
                modalImg.src = this.src;
            });
        });

        if(closeBtn) {
            closeBtn.addEventListener('click', () => modal.style.display = "none");
            window.addEventListener('click', (e) => {
                if (e.target == modal) modal.style.display = "none";
            });
        }
    },

    async loadRelatedSidebar() {
        try {
            const res = await fetch('posts/posts.json');
            const allPosts = await res.json();
            const sidebar = document.getElementById('related-posts');
            sidebar.innerHTML = allPosts.slice(0, 4).map(p => `
                <li>
                    <a href="article.html?id=${p.id}"><img src="${p.thumbnail}" alt="${p.title}" style="width:80px;height:80px;object-fit:cover;"></a>
                    <div>
                        <h4><a href="article.html?id=${p.id}">${p.title}</a></h4>
                        <span style="font-size:0.75rem; color:var(--text-muted)">${p.publishDate}</span>
                    </div>
                </li>
            `).join('');
        } catch (e) {
            console.error(e);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});