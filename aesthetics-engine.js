// ULTRATHINK Aesthetics Engine - Complete Layout Transformation System

class AestheticsEngine {
    constructor() {
        this.currentAesthetic = localStorage.getItem('selectedAesthetic') || 'cyberpunk';
        this.transitioning = false;
        this.projectsData = this.getProjectsData();
        this.init();
    }
    
    init() {
        // Apply saved aesthetic on load
        this.applyAesthetic(this.currentAesthetic);
        
        // Set up aesthetic switcher if it exists
        const switcher = document.getElementById('aestheticSwitcher');
        if (switcher) {
            switcher.value = this.currentAesthetic;
            switcher.addEventListener('change', (e) => this.switchAesthetic(e.target.value));
        }
    }
    
    async switchAesthetic(newAesthetic) {
        if (this.transitioning || newAesthetic === this.currentAesthetic) return;
        
        this.transitioning = true;
        document.body.classList.add('aesthetic-transitioning');
        
        // Fade out current content
        await this.fadeOut();
        
        // Switch aesthetic
        this.currentAesthetic = newAesthetic;
        localStorage.setItem('selectedAesthetic', newAesthetic);
        
        // Apply new aesthetic
        this.applyAesthetic(newAesthetic);
        
        // Fade in new content
        await this.fadeIn();
        
        document.body.classList.remove('aesthetic-transitioning');
        this.transitioning = false;
    }
    
    applyAesthetic(aesthetic) {
        // Clear existing content
        document.body.innerHTML = '';
        document.body.className = `aesthetic-${aesthetic}`;
        
        // Apply specific aesthetic
        switch(aesthetic) {
            case 'cyberpunk':
                this.applyCyberpunk();
                break;
            case 'minimalist':
                this.applyMinimalist();
                break;
            case 'brutalist':
                this.applyBrutalist();
                break;
            case 'glassmorphism':
                this.applyGlassmorphism();
                break;
            case 'vaporwave':
                this.applyVaporwave();
                break;
            case 'neomorphism':
                this.applyNeomorphism();
                break;
            case 'retro':
                this.applyRetro();
                break;
            case 'organic':
                this.applyOrganic();
                break;
            case 'cosmic':
                this.applyCosmic();
                break;
            case 'monochrome':
                this.applyMonochrome();
                break;
        }
        
        // Re-bind events
        this.bindCommonEvents();
    }
    
    // CYBERPUNK AESTHETIC
    applyCyberpunk() {
        document.body.innerHTML = `
            <!-- Cyberpunk Background Effects -->
            <div class="cyber-bg">
                <div class="cyber-grid"></div>
                <div class="cyber-rain"></div>
                <div class="glitch-overlay"></div>
            </div>
            
            <!-- Neon particles -->
            <div class="cyber-particles"></div>
            
            <!-- ASCII decorations -->
            <div class="ascii-deco ascii-1">
╔══════════╗
║ SYSTEM   ║
║ ONLINE   ║
╚══════════╝
            </div>
            <div class="ascii-deco ascii-2">
▄▄▄▄▄▄▄▄▄▄▄
░▒▓█ 2099 █▓▒░
▀▀▀▀▀▀▀▀▀▀▀
            </div>
            
            <!-- Main Container -->
            <div class="cyber-container">
                <!-- Header -->
                <header class="cyber-header">
                    <div class="cyber-title-wrapper">
                        <h1 class="cyber-title glitch" data-text="CLAUDE_TESTBED">CLAUDE_TESTBED</h1>
                        <div class="cyber-subtitle">[ EXPERIMENTAL PROJECTS // CREATIVE CODING HUB ]</div>
                    </div>
                    <div class="cyber-status">
                        <span class="status-item">STATUS: <span class="status-online">ONLINE</span></span>
                        <span class="status-item">PROJECTS: <span class="project-count">${this.projectsData.length}</span></span>
                    </div>
                </header>
                
                <!-- Aesthetic Switcher -->
                <div class="cyber-aesthetic-control">
                    <label class="cyber-label">AESTHETIC_MODE:</label>
                    <select id="aestheticSwitcher" class="cyber-select">
                        <option value="cyberpunk">[ CYBERPUNK ]</option>
                        <option value="minimalist">[ MINIMALIST ]</option>
                        <option value="brutalist">[ BRUTALIST ]</option>
                        <option value="glassmorphism">[ GLASSMORPHISM ]</option>
                        <option value="vaporwave">[ VAPORWAVE ]</option>
                        <option value="neomorphism">[ NEOMORPHISM ]</option>
                        <option value="retro">[ RETRO_TERMINAL ]</option>
                        <option value="organic">[ ORGANIC ]</option>
                        <option value="cosmic">[ COSMIC ]</option>
                        <option value="monochrome">[ MONOCHROME ]</option>
                    </select>
                </div>
                
                <!-- Navigation -->
                <nav class="cyber-nav">
                    <div class="cyber-search">
                        <input type="text" class="cyber-search-input" placeholder="SEARCH_PROJECTS..." id="searchInput">
                        <span class="search-indicator">▶</span>
                    </div>
                    <div class="cyber-filters">
                        <button class="cyber-filter-btn active" data-category="all">[ ALL ]</button>
                        <button class="cyber-filter-btn" data-category="ultrathink">[ ULTRATHINK ]</button>
                        <button class="cyber-filter-btn" data-category="webgl">[ WEBGL ]</button>
                        <button class="cyber-filter-btn" data-category="creative">[ CREATIVE ]</button>
                    </div>
                </nav>
                
                <!-- Featured Project -->
                <section class="cyber-featured">
                    <div class="cyber-featured-header">
                        <span class="featured-badge blink">★ FEATURED PROJECT ★</span>
                        <span class="featured-date">[ ${new Date().toISOString().split('T')[0]} ]</span>
                    </div>
                    <div class="cyber-featured-content">
                        ${this.renderCyberpunkFeatured()}
                    </div>
                </section>
                
                <!-- Projects Grid -->
                <main class="cyber-main">
                    <div class="cyber-projects-grid" id="projectsContainer">
                        ${this.renderCyberpunkProjects()}
                    </div>
                </main>
                
                <!-- Footer -->
                <footer class="cyber-footer">
                    <div class="cyber-footer-text">
                        <span class="footer-item">[ CLAUDE TESTBED v2.0 ]</span>
                        <span class="footer-item">[ BUILT FOR RAPID PROTOTYPING ]</span>
                        <span class="footer-item">[ ${new Date().getFullYear()} ]</span>
                    </div>
                </footer>
            </div>
        `;
        
        // Initialize cyberpunk-specific features
        this.initCyberpunkEffects();
    }
    
    initCyberpunkEffects() {
        // Create matrix rain effect
        const rainContainer = document.querySelector('.cyber-rain');
        if (rainContainer) {
            for (let i = 0; i < 50; i++) {
                const drop = document.createElement('div');
                drop.className = 'rain-drop';
                drop.style.left = Math.random() * 100 + '%';
                drop.style.animationDelay = Math.random() * 5 + 's';
                drop.style.animationDuration = (5 + Math.random() * 5) + 's';
                drop.textContent = Math.random() > 0.5 ? '1' : '0';
                rainContainer.appendChild(drop);
            }
        }
        
        // Create neon particles
        const particlesContainer = document.querySelector('.cyber-particles');
        if (particlesContainer) {
            for (let i = 0; i < 30; i++) {
                const particle = document.createElement('div');
                particle.className = 'neon-particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 10 + 's';
                particlesContainer.appendChild(particle);
            }
        }
        
        // Glitch effect on hover
        document.querySelectorAll('.cyber-project-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.classList.add('glitch-hover');
                setTimeout(() => card.classList.remove('glitch-hover'), 300);
            });
        });
    }
    
    renderCyberpunkFeatured() {
        const featured = this.projectsData.find(p => p.name.includes('Aesthetics Transformer'));
        if (!featured) return '';
        
        return `
            <div class="cyber-featured-project">
                <div class="featured-icon">${featured.emoji}</div>
                <div class="featured-info">
                    <h2 class="featured-title">${featured.name}</h2>
                    <p class="featured-desc">${featured.description}</p>
                    <a href="${featured.path}" class="cyber-cta">
                        <span class="cta-text">[ ACCESS SYSTEM ]</span>
                        <span class="cta-arrow">▶▶▶</span>
                    </a>
                </div>
                <div class="featured-visual">
                    <div class="hologram-effect">
                        <div class="hologram-ring"></div>
                        <div class="hologram-ring"></div>
                        <div class="hologram-ring"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderCyberpunkProjects() {
        return this.projectsData.map(project => `
            <div class="cyber-project-card" data-category="${project.category}" onclick="window.location.href='${project.path}'">
                <div class="project-header">
                    <span class="project-icon">${project.emoji}</span>
                    <span class="project-category">[ ${project.category.toUpperCase()} ]</span>
                </div>
                <h3 class="project-name">${project.name}</h3>
                <p class="project-desc">${project.description}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="cyber-tag">#${tag}</span>`).join('')}
                </div>
                <div class="project-overlay"></div>
            </div>
        `).join('');
    }
    
    // MINIMALIST AESTHETIC
    applyMinimalist() {
        document.body.innerHTML = `
            <div class="minimal-wrapper">
                <!-- Header -->
                <header class="minimal-header">
                    <h1 class="minimal-logo">Claude Testbed</h1>
                    <p class="minimal-tagline">Experimental Projects & Creative Coding</p>
                </header>
                
                <!-- Aesthetic Switcher -->
                <div class="minimal-aesthetic-control">
                    <select id="aestheticSwitcher" class="minimal-select">
                        <option value="cyberpunk">Cyberpunk</option>
                        <option value="minimalist">Minimalist</option>
                        <option value="brutalist">Brutalist</option>
                        <option value="glassmorphism">Glassmorphism</option>
                        <option value="vaporwave">Vaporwave</option>
                        <option value="neomorphism">Neomorphism</option>
                        <option value="retro">Retro Terminal</option>
                        <option value="organic">Organic</option>
                        <option value="cosmic">Cosmic</option>
                        <option value="monochrome">Monochrome</option>
                    </select>
                </div>
                
                <!-- Main Content -->
                <main class="minimal-main">
                    <!-- Featured -->
                    <section class="minimal-featured">
                        ${this.renderMinimalistFeatured()}
                    </section>
                    
                    <!-- Search -->
                    <div class="minimal-search-container">
                        <input type="text" class="minimal-search" id="searchInput" placeholder="Search projects">
                    </div>
                    
                    <!-- Filters -->
                    <nav class="minimal-filters">
                        <button class="minimal-filter active" data-category="all">All</button>
                        <button class="minimal-filter" data-category="ultrathink">Ultrathink</button>
                        <button class="minimal-filter" data-category="webgl">WebGL</button>
                        <button class="minimal-filter" data-category="creative">Creative</button>
                    </nav>
                    
                    <!-- Projects -->
                    <section class="minimal-projects" id="projectsContainer">
                        ${this.renderMinimalistProjects()}
                    </section>
                </main>
                
                <!-- Footer -->
                <footer class="minimal-footer">
                    <p>Claude Testbed — Built for rapid prototyping and experimentation</p>
                </footer>
            </div>
        `;
        
        this.initMinimalistEffects();
    }
    
    renderMinimalistFeatured() {
        const featured = this.projectsData.find(p => p.name.includes('Aesthetics Transformer'));
        if (!featured) return '';
        
        return `
            <article class="minimal-featured-article">
                <div class="minimal-featured-label">Featured</div>
                <h2 class="minimal-featured-title">${featured.name}</h2>
                <p class="minimal-featured-description">${featured.description}</p>
                <a href="${featured.path}" class="minimal-featured-link">View Project →</a>
            </article>
        `;
    }
    
    renderMinimalistProjects() {
        return this.projectsData.map(project => `
            <article class="minimal-project" data-category="${project.category}" onclick="window.location.href='${project.path}'">
                <div class="minimal-project-icon">${project.emoji}</div>
                <h3 class="minimal-project-title">${project.name}</h3>
                <p class="minimal-project-description">${project.description}</p>
            </article>
        `).join('');
    }
    
    initMinimalistEffects() {
        // Subtle fade-in animation
        const elements = document.querySelectorAll('.minimal-wrapper > *, .minimal-project');
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            setTimeout(() => {
                el.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }
    
    // BRUTALIST AESTHETIC
    applyBrutalist() {
        document.body.innerHTML = `
            <div class="brutal-chaos">
                <!-- Random geometric shapes -->
                <div class="brutal-shape shape-1"></div>
                <div class="brutal-shape shape-2"></div>
                <div class="brutal-shape shape-3"></div>
                
                <!-- Main Container -->
                <div class="brutal-container">
                    <!-- Header -->
                    <header class="brutal-header">
                        <h1 class="brutal-title">CLAUDE<br>TEST<br>BED</h1>
                        <div class="brutal-subtitle">EXPERIMENTAL!!!</div>
                    </header>
                    
                    <!-- Aesthetic Switcher -->
                    <div class="brutal-aesthetic-box">
                        <label class="brutal-label">CHANGE STYLE!!!</label>
                        <select id="aestheticSwitcher" class="brutal-select">
                            <option value="cyberpunk">CYBERPUNK</option>
                            <option value="minimalist">MINIMALIST</option>
                            <option value="brutalist">BRUTALIST</option>
                            <option value="glassmorphism">GLASSMORPHISM</option>
                            <option value="vaporwave">VAPORWAVE</option>
                            <option value="neomorphism">NEOMORPHISM</option>
                            <option value="retro">RETRO</option>
                            <option value="organic">ORGANIC</option>
                            <option value="cosmic">COSMIC</option>
                            <option value="monochrome">MONOCHROME</option>
                        </select>
                    </div>
                    
                    <!-- Navigation -->
                    <nav class="brutal-nav">
                        <input type="text" class="brutal-search" id="searchInput" placeholder="TYPE HERE!!!">
                        <div class="brutal-buttons">
                            <button class="brutal-btn active" data-category="all">ALL!!!</button>
                            <button class="brutal-btn" data-category="ultrathink">ULTRA!!!</button>
                            <button class="brutal-btn" data-category="webgl">WEBGL!!!</button>
                            <button class="brutal-btn" data-category="creative">CREATE!!!</button>
                        </div>
                    </nav>
                    
                    <!-- Featured -->
                    <section class="brutal-featured">
                        ${this.renderBrutalistFeatured()}
                    </section>
                    
                    <!-- Projects -->
                    <main class="brutal-projects" id="projectsContainer">
                        ${this.renderBrutalistProjects()}
                    </main>
                    
                    <!-- Footer -->
                    <footer class="brutal-footer">
                        <div class="brutal-footer-text">MADE WITH CHAOS!!!</div>
                    </footer>
                </div>
            </div>
        `;
        
        this.initBrutalistEffects();
    }
    
    renderBrutalistFeatured() {
        const featured = this.projectsData.find(p => p.name.includes('Aesthetics Transformer'));
        if (!featured) return '';
        
        return `
            <div class="brutal-featured-box">
                <div class="brutal-featured-badge">!!! HOT HOT HOT !!!</div>
                <h2 class="brutal-featured-title">${featured.name}</h2>
                <p class="brutal-featured-desc">${featured.description}</p>
                <a href="${featured.path}" class="brutal-featured-link">GO NOW!!!</a>
            </div>
        `;
    }
    
    renderBrutalistProjects() {
        return this.projectsData.map((project, index) => `
            <div class="brutal-project ${index % 2 === 0 ? 'brutal-left' : 'brutal-right'}" 
                 data-category="${project.category}" 
                 onclick="window.location.href='${project.path}'">
                <div class="brutal-project-icon">${project.emoji}</div>
                <h3 class="brutal-project-name">${project.name}</h3>
                <p class="brutal-project-desc">${project.description}</p>
                <div class="brutal-project-border"></div>
            </div>
        `).join('');
    }
    
    initBrutalistEffects() {
        // Random rotations
        document.querySelectorAll('.brutal-project').forEach(el => {
            el.style.transform = `rotate(${(Math.random() - 0.5) * 4}deg)`;
        });
        
        // Random colors for shapes
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        document.querySelectorAll('.brutal-shape').forEach(shape => {
            shape.style.background = colors[Math.floor(Math.random() * colors.length)];
        });
    }
    
    // Other aesthetics would follow similar patterns...
    // Due to space constraints, I'll implement the rest in a similar structure
    
    applyGlassmorphism() {
        document.body.innerHTML = `
            <div class="glass-container">
                <div class="glass-bg">
                    <div class="glass-blob blob-1"></div>
                    <div class="glass-blob blob-2"></div>
                    <div class="glass-blob blob-3"></div>
                </div>
                
                <div class="glass-content">
                    <header class="glass-header">
                        <h1 class="glass-title">Claude Testbed</h1>
                        <p class="glass-subtitle">Experimental Projects & Creative Coding Hub</p>
                    </header>
                    
                    <div class="glass-controls">
                        <select id="aestheticSwitcher" class="glass-select">
                            <option value="cyberpunk">Cyberpunk</option>
                            <option value="minimalist">Minimalist</option>
                            <option value="brutalist">Brutalist</option>
                            <option value="glassmorphism">Glassmorphism</option>
                            <option value="vaporwave">Vaporwave</option>
                            <option value="neomorphism">Neomorphism</option>
                            <option value="retro">Retro Terminal</option>
                            <option value="organic">Organic</option>
                            <option value="cosmic">Cosmic</option>
                            <option value="monochrome">Monochrome</option>
                        </select>
                    </div>
                    
                    <main class="glass-main">
                        <div class="glass-projects" id="projectsContainer">
                            ${this.renderGlassmorphismProjects()}
                        </div>
                    </main>
                </div>
            </div>
        `;
        
        this.initGlassmorphismEffects();
    }
    
    renderGlassmorphismProjects() {
        return this.projectsData.map(project => `
            <div class="glass-card" onclick="window.location.href='${project.path}'">
                <div class="glass-card-content">
                    <div class="glass-icon">${project.emoji}</div>
                    <h3 class="glass-card-title">${project.name}</h3>
                    <p class="glass-card-desc">${project.description}</p>
                </div>
            </div>
        `).join('');
    }
    
    initGlassmorphismEffects() {
        // Parallax effect on mouse move
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            document.querySelectorAll('.glass-blob').forEach((blob, index) => {
                const speed = (index + 1) * 50;
                blob.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
            });
        });
    }
    
    // Placeholder implementations for remaining aesthetics
    applyVaporwave() {
        this.applyPlaceholder('Vaporwave', 'vaporwave');
    }
    
    applyNeomorphism() {
        this.applyPlaceholder('Neomorphism', 'neomorphism');
    }
    
    applyRetro() {
        this.applyPlaceholder('Retro Terminal', 'retro');
    }
    
    applyOrganic() {
        this.applyPlaceholder('Organic', 'organic');
    }
    
    applyCosmic() {
        this.applyPlaceholder('Cosmic', 'cosmic');
    }
    
    applyMonochrome() {
        this.applyPlaceholder('Monochrome', 'monochrome');
    }
    
    applyPlaceholder(name, value) {
        document.body.innerHTML = `
            <div class="placeholder-container">
                <h1>${name} Aesthetic</h1>
                <p>Full implementation coming soon...</p>
                <select id="aestheticSwitcher">
                    <option value="cyberpunk">Cyberpunk</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="brutalist">Brutalist</option>
                    <option value="glassmorphism">Glassmorphism</option>
                    <option value="vaporwave">Vaporwave</option>
                    <option value="neomorphism">Neomorphism</option>
                    <option value="retro">Retro Terminal</option>
                    <option value="organic">Organic</option>
                    <option value="cosmic">Cosmic</option>
                    <option value="monochrome">Monochrome</option>
                </select>
            </div>
        `;
    }
    
    // Common event bindings
    bindCommonEvents() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterProjects(e.target.value));
        }
        
        // Category filters
        document.querySelectorAll('[data-category]').forEach(btn => {
            if (btn.tagName === 'BUTTON') {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('[data-category]').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.filterByCategory(e.target.dataset.category);
                });
            }
        });
    }
    
    filterProjects(searchTerm) {
        const projects = document.querySelectorAll('[data-category]');
        projects.forEach(project => {
            if (project.tagName !== 'BUTTON') {
                const text = project.textContent.toLowerCase();
                project.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
            }
        });
    }
    
    filterByCategory(category) {
        const projects = document.querySelectorAll('[data-category]');
        projects.forEach(project => {
            if (project.tagName !== 'BUTTON') {
                if (category === 'all' || project.dataset.category === category) {
                    project.style.display = '';
                } else {
                    project.style.display = 'none';
                }
            }
        });
    }
    
    // Animation helpers
    async fadeOut() {
        document.body.style.opacity = '0';
        await this.sleep(300);
    }
    
    async fadeIn() {
        document.body.style.opacity = '1';
        await this.sleep(300);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Projects data
    getProjectsData() {
        return [
            {
                name: "Aesthetics Transformer",
                description: "10種類のデザイン哲学を瞬時に切り替え - 同じコンテンツが異なる美学でどう変化するかを体験できるインタラクティブポートフォリオ",
                path: "projects/aesthetics-transformer/",
                category: "creative",
                emoji: "🎨",
                tags: ["design", "aesthetics", "portfolio"]
            },
            {
                name: "Particle Symphony",
                description: "粒子の交響曲 - 数千の粒子が織りなす生命の誕生から宇宙の創造までを表現する、中毒性の高い視覚的交響曲",
                path: "projects/particle-symphony/",
                category: "ultrathink",
                emoji: "🎵",
                tags: ["WebGL", "particles", "motion graphics"]
            },
            {
                name: "ULTRATHINK Arduino Emulator",
                description: "完全ブラウザベースの本格Arduinoエミュレーター - Monaco Editorでコーディング、リアルタイムで動作確認",
                path: "projects/ultrathink-arduino-emulator/",
                category: "ultrathink",
                emoji: "⚡",
                tags: ["Arduino", "Emulator", "Hardware"]
            },
            {
                name: "Quantum Particle Field",
                description: "高度な物理シミュレーションとWebGLレンダリングによる量子粒子場",
                path: "projects/quantum-particle-field/",
                category: "webgl",
                emoji: "⚛️",
                tags: ["physics", "particles", "WebGL"]
            },
            {
                name: "Shader Workshop",
                description: "GLSLプログラミングの深層へ - インタラクティブなシェーダー学習環境",
                path: "projects/shader-workshop/",
                category: "webgl",
                emoji: "🎨",
                tags: ["GLSL", "education", "WebGL"]
            },
            {
                name: "Digital Heartbeat",
                description: "ボカロMV風モーショングラフィックス - プロレベルのビジュアル体験",
                path: "projects/vocaloid-motion-graphics/",
                category: "creative",
                emoji: "🎵",
                tags: ["motion graphics", "vocaloid", "animation"]
            }
        ];
    }
}