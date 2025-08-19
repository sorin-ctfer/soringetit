// SORIN 基础界面管理系统

class SORINBaseSystem {
    constructor() {
        this.currentState = 'loading'; // loading, main, menu, platform-selection
        this.platforms = JSON.parse(localStorage.getItem('sorin-platforms') || JSON.stringify({
            'ctfshow': {
                name: 'CTFShow',
                description: 'SORIN-刷题计划',
                icon: 'bx-trophy',
                path: 'static/ctfshow/index.html',
                problems: 859,
                completed: 0,
                isDefault: true
            }
        }));
        this.articles = JSON.parse(localStorage.getItem('sorin-articles') || '[]');
        this.isAuthenticated = false;
        this.loadingMessages = [
            '我一直在等你...',
            '正在为你努力加载中...',
            '正在连接VPN...',
            '初始化SORIN系统...',
            '准备进入学习模式...',
            '加载个人数据...',
            '建立安全连接...',
            '几乎完成了...'
        ];
        
        this.dynamicTexts = [
            '点击我，查看更多',
            '长按探索无限可能',
            '学海无涯 眼明心静',
            '静专思主 谦逊俨然',
            '进入我的世界'
        ];
        
        this.currentEditingArticle = null;
        this.currentEditingPlatform = null;
        this.selectedImagePath = null;
        
        this.init();
    }

    init() {
        this.startLoading();
        this.bindEvents();
        this.initializeArticleSystem();
        this.initializeNatureParticles();
    }

    // ===== 加载系统 =====
    
    startLoading() {
        let progress = 0;
        let messageIndex = 0;
        
        const progressElement = document.getElementById('progress-fill');
        const percentElement = document.getElementById('progress-percent');
        const messageElement = document.getElementById('loading-message');
        
        // 初始化加载界面粒子
        this.initLoadingParticles();
        
        const updateProgress = () => {
            progress += Math.random() * 15 + 5; // 随机增长5-20%
            
            if (progress >= 100) {
                progress = 100;
                setTimeout(() => {
                    this.completeLoading();
                }, 500);
            } else {
                // 随机切换加载消息
                if (Math.random() < 0.3) {
                    messageIndex = (messageIndex + 1) % this.loadingMessages.length;
                    messageElement.textContent = this.loadingMessages[messageIndex];
                }
                
                setTimeout(updateProgress, Math.random() * 800 + 400); // 400-1200ms间隔
            }
            
            progressElement.style.width = `${progress}%`;
            percentElement.textContent = Math.floor(progress);
        };
        
        updateProgress();
    }
    
    initLoadingParticles() {
        const container = document.getElementById('loading-particles');
        if (!container) return;
        
        const loadingParticleTypes = ['🌸', '🌿', '✨', '🦋', '🌱', '🍃', '💫', '🌺'];
        
        // 创建25个粒子分布在加载界面
        for (let i = 0; i < 25; i++) {
            const particle = document.createElement('div');
            particle.className = 'loading-particle';
            
            const randomType = loadingParticleTypes[Math.floor(Math.random() * loadingParticleTypes.length)];
            particle.textContent = randomType;
            
            // 随机位置，避开中心区域
            let x, y;
            do {
                x = Math.random() * 100;
                y = Math.random() * 100;
            } while (x > 25 && x < 75 && y > 25 && y < 75); // 避开中心50%区域
            
            particle.style.left = x + '%';
            particle.style.top = y + '%';
            particle.style.animationDelay = Math.random() * 5 + 's';
            particle.style.fontSize = (15 + Math.random() * 10) + 'px';
            
            container.appendChild(particle);
        }
    }
    
    completeLoading() {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
            this.showArticlePreview();
        }, 500);
    }
    
    showArticlePreview() {
        // 显示最新文章预览
        const latestArticles = this.articles
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);
            
        if (latestArticles.length > 0) {
            this.renderLatestArticles(latestArticles);
            document.getElementById('article-preview-modal').classList.remove('hidden');
        } else {
            this.enterMainInterface();
        }
    }
    
    renderLatestArticles(articles) {
        const container = document.getElementById('latest-articles');
        container.innerHTML = articles.map(article => `
            <div class="article-card" data-article-id="${article.id}">
                <div class="article-image" style="background-image: url('${article.image || 'static/images/default-article.jpg'}')"></div>
                <div class="article-info">
                    <div class="article-title">${article.title}</div>
                    <div class="article-excerpt">${article.excerpt || article.content.substring(0, 100) + '...'}</div>
                    <div class="article-meta">
                        <span class="article-date">${new Date(article.date).toLocaleDateString('zh-CN')}</span>
                        <span class="article-category">${article.category}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    enterMainInterface() {
        this.currentState = 'main';
        document.getElementById('main-interface').classList.remove('hidden');
        this.startDynamicText();
    }

    // ===== 主界面动态文本 =====
    
    startDynamicText() {
        const textElement = document.getElementById('dynamic-text');
        let currentIndex = 0;
        
        const typeText = (text, callback) => {
            let charIndex = 0;
            textElement.textContent = '';
            
            const typeChar = () => {
                if (charIndex < text.length) {
                    textElement.textContent += text[charIndex];
                    charIndex++;
                    setTimeout(typeChar, 100);
                } else {
                    setTimeout(callback, 2000);
                }
            };
            
            typeChar();
        };
        
        const deleteText = (callback) => {
            const currentText = textElement.textContent;
            let charIndex = currentText.length;
            
            const deleteChar = () => {
                if (charIndex > 0) {
                    textElement.textContent = currentText.substring(0, charIndex - 1);
                    charIndex--;
                    setTimeout(deleteChar, 50);
                } else {
                    setTimeout(callback, 500);
                }
            };
            
            deleteChar();
        };
        
        const cycle = () => {
            const currentText = this.dynamicTexts[currentIndex];
            typeText(currentText, () => {
                deleteText(() => {
                    currentIndex = (currentIndex + 1) % this.dynamicTexts.length;
                    cycle();
                });
            });
        };
        
        cycle();
    }

    // ===== 事件绑定 =====
    
    bindEvents() {
        // 关闭文章预览
        document.getElementById('close-article-preview').addEventListener('click', () => {
            document.getElementById('article-preview-modal').classList.add('hidden');
            this.enterMainInterface();
        });
        
        // 点击文章卡片
        document.addEventListener('click', (e) => {
            const articleCard = e.target.closest('.article-card');
            if (articleCard) {
                const articleId = articleCard.dataset.articleId;
                this.showArticleDetail(articleId);
            }
        });
        
        // 菜单切换
        document.getElementById('menu-toggle').addEventListener('click', () => {
            this.showMenu();
        });
        
        // 中心交互
        let pressTimer = null;
        const interactiveText = document.getElementById('interactive-text');
        
        interactiveText.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.startPlatformEntry();
        });
        
        interactiveText.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startPlatformEntry();
        });
        
        document.addEventListener('mouseup', () => {
            this.cancelPlatformEntry();
        });
        
        document.addEventListener('touchend', () => {
            this.cancelPlatformEntry();
        });
        
        // 文章按钮
        document.getElementById('articles-button').addEventListener('click', () => {
            this.toggleArticlesPanel();
        });
        
        document.getElementById('close-articles-panel').addEventListener('click', () => {
            this.closeArticlesPanel();
        });
        
        // 文章管理模态框事件
        const closeArticleManagementBtn = document.getElementById('close-article-management');
        if (closeArticleManagementBtn) {
            closeArticleManagementBtn.addEventListener('click', () => {
                document.getElementById('article-management-modal').classList.add('hidden');
            });
        }
        
        // 管理员密码验证
        document.getElementById('admin-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.verifyAdminPassword();
            }
        });
        
        // 菜单选项
        document.addEventListener('click', (e) => {
            const menuOption = e.target.closest('.menu-option');
            if (menuOption) {
                const action = menuOption.dataset.action;
                this.handleMenuAction(action);
            }
        });
        
        // 平台管理事件
        const addPlatformBtn = document.getElementById('add-new-platform');
        if (addPlatformBtn) {
            addPlatformBtn.addEventListener('click', () => {
                this.showAddPlatformDialog();
            });
        }
        
        const closeAddPlatformBtn = document.getElementById('close-add-platform-dialog');
        if (closeAddPlatformBtn) {
            closeAddPlatformBtn.addEventListener('click', () => {
                this.closeAddPlatformDialog();
            });
        }
        
        const cancelPlatformBtn = document.getElementById('cancel-platform-creation');
        if (cancelPlatformBtn) {
            cancelPlatformBtn.addEventListener('click', () => {
                this.closeAddPlatformDialog();
            });
        }
        
        const confirmPlatformBtn = document.getElementById('confirm-platform-creation');
        if (confirmPlatformBtn) {
            confirmPlatformBtn.addEventListener('click', () => {
                this.createNewPlatform();
            });
        }
        
        // 平台选择返回
        document.getElementById('back-to-main').addEventListener('click', () => {
            this.backToMain();
        });
        
        // 关闭模态框
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                e.target.closest('.modal').classList.add('hidden');
            }
        });
        
        // 关闭按钮
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.add('hidden');
            });
        });
        
        // 文章编辑器事件
        document.getElementById('create-new-article').addEventListener('click', () => {
            this.showArticleEditor();
        });
        
        document.getElementById('close-article-editor').addEventListener('click', () => {
            this.closeArticleEditor();
        });
        
        document.getElementById('select-image-btn').addEventListener('click', () => {
            this.showImageSelector();
        });
        
        document.getElementById('remove-image-btn').addEventListener('click', () => {
            this.removeSelectedImage();
        });
        
        document.getElementById('toggle-preview').addEventListener('click', () => {
            this.toggleContentPreview();
        });
        
        document.getElementById('cancel-article-edit').addEventListener('click', () => {
            this.closeArticleEditor();
        });
        
        document.getElementById('save-article-draft').addEventListener('click', () => {
            this.saveArticleDraft();
        });
        
        document.getElementById('publish-article').addEventListener('click', () => {
            this.publishArticle();
        });
        
        // 编辑器工具栏事件
        document.querySelectorAll('.toolbar-btn[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleToolbarAction(btn.dataset.action);
            });
        });
        
        // 平台编辑器事件
        const closePlatformEditBtn = document.getElementById('close-edit-platform-dialog');
        if (closePlatformEditBtn) {
            closePlatformEditBtn.addEventListener('click', () => {
                this.closePlatformEditor();
            });
        }
        
        const cancelPlatformEditBtn = document.getElementById('cancel-platform-edit');
        if (cancelPlatformEditBtn) {
            cancelPlatformEditBtn.addEventListener('click', () => {
                this.closePlatformEditor();
            });
        }
        
        const savePlatformEditBtn = document.getElementById('save-platform-edit');
        if (savePlatformEditBtn) {
            savePlatformEditBtn.addEventListener('click', () => {
                this.savePlatformEdit();
            });
        }
        
        // 图片选择器事件
        const closeImageSelectorBtn = document.getElementById('close-image-selector');
        if (closeImageSelectorBtn) {
            closeImageSelectorBtn.addEventListener('click', () => {
                this.closeImageSelector();
            });
        }
        
        // 使用事件委托处理动态生成的按钮
        document.addEventListener('click', (e) => {
            if (e.target.closest('.tab-btn')) {
                const tabBtn = e.target.closest('.tab-btn');
                const tab = tabBtn.dataset.tab;
                if (tab) {
                    this.switchTab(tab);
                }
            }
            
            // 添加类别按钮
            if (e.target.closest('#add-category')) {
                this.addNewCategory();
            }
            
            // 添加成就按钮
            if (e.target.closest('#add-achievement')) {
                this.addNewAchievement();
            }
            
            // 添加题目范围按钮
            if (e.target.closest('#add-problems-to-category')) {
                this.addProblemsToCategory();
            }
            
            // 文章管理按钮
            if (e.target.closest('.edit-article-btn')) {
                console.log('编辑文章按钮被点击');
                const articleId = e.target.closest('.edit-article-btn').dataset.articleId;
                this.editArticle(articleId);
            }
            
            if (e.target.closest('.delete-article-btn')) {
                console.log('删除文章按钮被点击');
                const articleId = e.target.closest('.delete-article-btn').dataset.articleId;
                this.deleteArticle(articleId);
            }
            
            // 平台管理按钮
            if (e.target.closest('.edit-platform-btn')) {
                const platformId = e.target.closest('.edit-platform-btn').dataset.platformId;
                this.editPlatform(platformId);
            }
            
            if (e.target.closest('.delete-platform-btn')) {
                const platformId = e.target.closest('.delete-platform-btn').dataset.platformId;
                this.deletePlatform(platformId);
            }
            
            // 类别管理按钮
            if (e.target.closest('.edit-category-btn')) {
                const index = parseInt(e.target.closest('.edit-category-btn').dataset.index);
                this.editCategory(index);
            }
            
            if (e.target.closest('.delete-category-btn')) {
                const index = parseInt(e.target.closest('.delete-category-btn').dataset.index);
                this.deleteCategory(index);
            }
            
            // 成就管理按钮
            if (e.target.closest('.edit-achievement-btn')) {
                const index = parseInt(e.target.closest('.edit-achievement-btn').dataset.index);
                this.editAchievement(index);
            }
            
            if (e.target.closest('.delete-achievement-btn')) {
                const index = parseInt(e.target.closest('.delete-achievement-btn').dataset.index);
                this.deleteAchievement(index);
            }
        });
    }

    // ===== 平台进入逻辑 =====
    
    startPlatformEntry() {
        const hint = document.getElementById('interaction-hint');
        const progressContainer = document.getElementById('pixel-progress-container');
        
        hint.classList.remove('hidden');
        progressContainer.classList.remove('hidden');
        
        let progress = 0;
        const progressFill = document.getElementById('pixel-progress-fill');
        const progressText = document.getElementById('pixel-progress-text');
        
        this.entryTimer = setInterval(() => {
            progress += 3.33; // 30 steps to reach 100%
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(this.entryTimer);
                this.completePlatformEntry();
            }
            
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.floor(progress)}%`;
        }, 100); // 3 seconds total
    }
    
    cancelPlatformEntry() {
        if (this.entryTimer) {
            clearInterval(this.entryTimer);
            this.entryTimer = null;
            
            document.getElementById('interaction-hint').classList.add('hidden');
            document.getElementById('pixel-progress-container').classList.add('hidden');
            
            // 重置进度
            document.getElementById('pixel-progress-fill').style.width = '0%';
            document.getElementById('pixel-progress-text').textContent = '0%';
        }
    }
    
    completePlatformEntry() {
        document.getElementById('main-interface').classList.add('hidden');
        this.showPlatformSelection();
    }

    // ===== 平台选择界面 =====
    
    showPlatformSelection() {
        this.currentState = 'platform-selection';
        document.getElementById('platform-selection').classList.remove('hidden');
        this.renderPlatforms();
    }
    
    renderPlatforms() {
        const container = document.getElementById('platforms-grid');
        container.innerHTML = Object.entries(this.platforms).map(([id, platform]) => `
            <div class="platform-card" data-platform-id="${id}">
                <div class="platform-icon">
                    <i class="bx ${platform.icon}"></i>
                </div>
                <div class="platform-name">${platform.name}</div>
                <div class="platform-description">${platform.description}</div>
                <div class="platform-stats">
                    <span>${platform.completed}/${platform.problems} 已完成</span>
                </div>
            </div>
        `).join('');
        
        // 绑定平台点击事件
        container.addEventListener('click', (e) => {
            const platformCard = e.target.closest('.platform-card');
            if (platformCard) {
                const platformId = platformCard.dataset.platformId;
                this.enterPlatform(platformId);
            }
        });
    }
    
    enterPlatform(platformId) {
        const platform = this.platforms[platformId];
        if (platform) {
            // 跳转到对应平台
            window.location.href = platform.path;
        }
    }
    
    backToMain() {
        document.getElementById('platform-selection').classList.add('hidden');
        document.getElementById('main-interface').classList.remove('hidden');
        this.currentState = 'main';
    }

    // ===== 菜单系统 =====
    
    showMenu() {
        document.getElementById('menu-interface').classList.remove('hidden');
        document.getElementById('admin-password').focus();
    }
    
    verifyAdminPassword() {
        const password = document.getElementById('admin-password').value;
        if (password === 'soringetit') {
            this.isAuthenticated = true;
            document.getElementById('auth-prompt').classList.add('hidden');
            document.getElementById('admin-menu').classList.remove('hidden');
            document.getElementById('admin-password').value = '';
        } else {
            document.getElementById('admin-password').value = '';
            document.getElementById('admin-password').placeholder = '密码错误，请重试';
            document.getElementById('admin-password').style.color = '#ff5555';
            
            setTimeout(() => {
                document.getElementById('admin-password').placeholder = '';
                document.getElementById('admin-password').style.color = '#00ff00';
            }, 2000);
        }
    }
    
    handleMenuAction(action) {
        switch (action) {
            case 'platforms':
                this.showPlatformManagement();
                break;
            case 'articles':
                this.showArticleManagement();
                break;
            case 'exit':
                this.exitMenu();
                break;
        }
    }
    
    exitMenu() {
        document.getElementById('menu-interface').classList.add('hidden');
        document.getElementById('auth-prompt').classList.remove('hidden');
        document.getElementById('admin-menu').classList.add('hidden');
        this.isAuthenticated = false;
    }

    // ===== 文章系统 =====
    
    initializeArticleSystem() {
        // 如果没有文章，创建一些示例文章
        if (this.articles.length === 0) {
            this.articles = [
                {
                    id: '1',
                    title: '欢迎来到SORIN学习平台',
                    content: '# 欢迎来到SORIN学习平台\n\n这是一个专门为学习和知识分享而设计的平台。在这里，你可以：\n\n- 刷CTF题目\n- 阅读技术文章\n- 管理学习进度\n- 分享学习心得\n\n让我们一起在学习的道路上前进！',
                    excerpt: '欢迎来到SORIN学习平台，一个专门为学习和知识分享而设计的平台。',
                    date: new Date().toISOString(),
                    category: '公告',
                    image: 'static/images/welcome.jpg'
                },
                {
                    id: '2',
                    title: 'CTF入门指南',
                    content: '# CTF入门指南\n\n## 什么是CTF？\n\nCTF（Capture The Flag）是一种网络安全竞赛形式...\n\n## 如何开始？\n\n1. 了解基础知识\n2. 选择合适的工具\n3. 多加练习\n4. 参与社区',
                    excerpt: 'CTF（Capture The Flag）是一种网络安全竞赛形式，本文将为你介绍如何入门CTF。',
                    date: new Date(Date.now() - 86400000).toISOString(),
                    category: '教程',
                    image: 'static/images/ctf-guide.jpg'
                }
            ];
            this.saveArticles();
        }
    }
    
    toggleArticlesPanel() {
        const panel = document.getElementById('articles-panel');
        if (panel.classList.contains('hidden')) {
            panel.classList.remove('hidden');
            this.renderAllArticles();
        } else {
            panel.classList.add('hidden');
        }
    }
    
    closeArticlesPanel() {
        document.getElementById('articles-panel').classList.add('hidden');
    }
    
    renderAllArticles() {
        const container = document.getElementById('articles-list');
        container.innerHTML = this.articles.map(article => `
            <div class="article-card" data-article-id="${article.id}">
                <div class="article-image" style="background-image: url('${article.image || 'static/images/default-article.jpg'}')"></div>
                <div class="article-info">
                    <div class="article-title">${article.title}</div>
                    <div class="article-excerpt">${article.excerpt || article.content.substring(0, 100) + '...'}</div>
                    <div class="article-meta">
                        <span class="article-date">${new Date(article.date).toLocaleDateString('zh-CN')}</span>
                        <span class="article-category">${article.category}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    showArticleDetail(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        if (article) {
            document.getElementById('article-title').textContent = article.title;
            document.getElementById('article-date').textContent = new Date(article.date).toLocaleDateString('zh-CN');
            document.getElementById('article-category').textContent = article.category;
            
            // 渲染Markdown内容
            const content = typeof marked !== 'undefined' ? 
                marked.parse(article.content) : 
                article.content.replace(/\n/g, '<br>');
            document.getElementById('article-content').innerHTML = content;
            
            document.getElementById('article-detail-modal').classList.remove('hidden');
        }
    }

    // ===== 平台管理 =====
    
    showPlatformManagement() {
        document.getElementById('platform-management-modal').classList.remove('hidden');
        this.renderPlatformManagement();
    }
    
    renderPlatformManagement() {
        const container = document.getElementById('platform-management-list');
        if (!container) return;
        
        container.innerHTML = Object.entries(this.platforms).map(([id, platform]) => `
            <div class="platform-management-card" data-platform-id="${id}">
                <div class="platform-card-header">
                    <div class="platform-icon">
                        <i class="bx ${platform.icon}"></i>
                    </div>
                    <div class="platform-info">
                        <h4>${platform.name}</h4>
                        <p>${platform.description}</p>
                        <span class="platform-path">路径: ${platform.path}</span>
                    </div>
                </div>
                <div class="platform-actions">
                    ${platform.type === 'template' ? `
                        <button class="action-btn secondary edit-platform-btn" data-platform-id="${id}">
                            <i class="bx bx-edit"></i>编辑
                        </button>
                    ` : ''}
                    ${!platform.isDefault ? `
                        <button class="action-btn delete-platform-btn" style="background: #dc2626; color: white;" data-platform-id="${id}">
                            <i class="bx bx-trash"></i>删除
                        </button>
                    ` : `
                        <span class="default-badge">默认平台</span>
                    `}
                </div>
            </div>
        `).join('');
    }

    // ===== 文章管理 =====
    
    showArticleManagement() {
        console.log('显示文章管理界面, 文章数量:', this.articles.length);
        document.getElementById('article-management-modal').classList.remove('hidden');
        this.renderArticleManagement();
    }
    
    renderArticleManagement() {
        console.log('渲染文章管理列表, 文章数量:', this.articles.length);
        const container = document.getElementById('article-management-list');
        if (!container) {
            console.error('找不到article-management-list容器');
            return;
        }
        
        container.innerHTML = this.articles.map(article => `
            <div class="article-management-card" data-article-id="${article.id}">
                <div class="article-card-content">
                    <h4>${article.title}</h4>
                    <p>${article.excerpt || article.content.substring(0, 100) + '...'}</p>
                    <div class="article-meta">
                        <span>${article.category}</span>
                        <span>${new Date(article.date).toLocaleDateString('zh-CN')}</span>
                    </div>
                </div>
                <div class="article-actions">
                    <button class="action-btn secondary edit-article-btn" data-article-id="${article.id}">
                        <i class="bx bx-edit"></i>编辑
                    </button>
                    <button class="action-btn delete-article-btn" style="background: #dc2626; color: white;" data-article-id="${article.id}">
                        <i class="bx bx-trash"></i>删除
                    </button>
                </div>
            </div>
        `).join('');
        
        // 验证按钮是否正确生成
        const editBtns = container.querySelectorAll('.edit-article-btn');
        console.log('生成的文章管理按钮数量:', editBtns.length);
    }

    // ===== 数据保存 =====
    
    savePlatforms() {
        localStorage.setItem('sorin-platforms', JSON.stringify(this.platforms));
    }
    
    saveArticles() {
        localStorage.setItem('sorin-articles', JSON.stringify(this.articles));
    }

    // ===== 文章编辑器功能 =====
    
    showArticleEditor(articleId = null) {
        this.currentEditingArticle = articleId;
        
        // 重置表单
        document.getElementById('article-title-input').value = '';
        document.getElementById('article-category-input').value = '';
        document.getElementById('article-excerpt-input').value = '';
        document.getElementById('article-content-input').value = '';
        this.removeSelectedImage();
        
        if (articleId) {
            // 编辑模式
            const article = this.articles.find(a => a.id === articleId);
            if (article) {
                document.getElementById('article-editor-title').textContent = '✏️ 编辑文章';
                document.getElementById('article-title-input').value = article.title;
                document.getElementById('article-category-input').value = article.category;
                document.getElementById('article-excerpt-input').value = article.excerpt || '';
                document.getElementById('article-content-input').value = article.content;
                
                if (article.image) {
                    this.displaySelectedImage(article.image);
                }
            }
        } else {
            // 新建模式
            document.getElementById('article-editor-title').textContent = '📝 新建文章';
        }
        
        document.getElementById('article-editor-modal').classList.remove('hidden');
    }
    
    closeArticleEditor() {
        document.getElementById('article-editor-modal').classList.add('hidden');
        this.currentEditingArticle = null;
    }
    

    
    displaySelectedImage(imageSrc) {
        const preview = document.getElementById('image-preview');
        preview.innerHTML = `<img src="${imageSrc}" alt="预览图片">`;
        document.getElementById('remove-image-btn').classList.remove('hidden');
    }
    
    removeSelectedImage() {
        this.selectedImagePath = null;
        const preview = document.getElementById('image-preview');
        if (preview) {
            preview.innerHTML = `
                <div class="image-placeholder">
                    <i class='bx bx-image-add'></i>
                    <span>点击选择图片</span>
                </div>
            `;
        }
        const removeBtn = document.getElementById('remove-image-btn');
        if (removeBtn) {
            removeBtn.classList.add('hidden');
        }
        // 注意：这里没有 article-image-input 元素，因为我们使用的是自定义图片选择器
    }
    
    toggleContentPreview() {
        const textarea = document.querySelector('.content-textarea');
        const preview = document.getElementById('content-preview');
        const toggleBtn = document.getElementById('toggle-preview');
        
        if (preview.classList.contains('hidden')) {
            // 显示预览
            const content = textarea.value;
            const htmlContent = typeof marked !== 'undefined' ? 
                marked.parse(content) : 
                content.replace(/\n/g, '<br>');
            preview.innerHTML = htmlContent;
            preview.classList.remove('hidden');
            textarea.style.display = 'none';
            toggleBtn.innerHTML = '<i class="bx bx-edit"></i>';
            toggleBtn.classList.add('active');
        } else {
            // 显示编辑
            preview.classList.add('hidden');
            textarea.style.display = 'block';
            toggleBtn.innerHTML = '<i class="bx bx-show"></i>';
            toggleBtn.classList.remove('active');
        }
    }
    
    handleToolbarAction(action) {
        const textarea = document.getElementById('article-content-input');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let replacement = '';
        
        switch (action) {
            case 'bold':
                replacement = `**${selectedText || '粗体文本'}**`;
                break;
            case 'italic':
                replacement = `*${selectedText || '斜体文本'}*`;
                break;
            case 'heading':
                replacement = `## ${selectedText || '标题'}`;
                break;
            case 'link':
                replacement = `[${selectedText || '链接文本'}](https://example.com)`;
                break;
            case 'code':
                replacement = `\`${selectedText || '代码'}\``;
                break;
            case 'quote':
                replacement = `> ${selectedText || '引用文本'}`;
                break;
            case 'list':
                replacement = `- ${selectedText || '列表项'}`;
                break;
        }
        
        textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }
    
    saveArticleDraft() {
        this.saveCurrentArticle(false);
    }
    
    publishArticle() {
        this.saveCurrentArticle(true);
    }
    
    saveCurrentArticle(publish = true) {
        const title = document.getElementById('article-title-input').value.trim();
        const category = document.getElementById('article-category-input').value.trim();
        const excerpt = document.getElementById('article-excerpt-input').value.trim();
        const content = document.getElementById('article-content-input').value.trim();
        
        if (!title) {
            alert('请输入文章标题');
            return;
        }
        
        if (!content) {
            alert('请输入文章内容');
            return;
        }
        
        // 获取图片
        const imagePreview = document.querySelector('#image-preview img');
        const image = imagePreview ? imagePreview.src : '';
        
        const articleData = {
            title,
            category: category || '未分类',
            excerpt: excerpt || content.substring(0, 100) + '...',
            content,
            image,
            date: new Date().toISOString(),
            status: publish ? 'published' : 'draft'
        };
        
        if (this.currentEditingArticle) {
            // 更新现有文章
            const index = this.articles.findIndex(a => a.id === this.currentEditingArticle);
            if (index !== -1) {
                this.articles[index] = { ...this.articles[index], ...articleData };
            }
        } else {
            // 创建新文章
            articleData.id = Date.now().toString();
            this.articles.push(articleData);
        }
        
        this.saveArticles();
        this.closeArticleEditor();
        this.renderArticleManagement();
        
        const action = this.currentEditingArticle ? '更新' : '创建';
        const status = publish ? '发布' : '保存为草稿';
        alert(`文章${action}成功并已${status}！`);
    }

    // ===== 自然粒子效果 =====
    
    initializeNatureParticles() {
        this.natureParticles = [];
        this.natureTypes = [
            { icon: 'bx-leaf', class: 'leaf', probability: 0.3 },
            { icon: 'bx-florist', class: 'flower', probability: 0.25 },
            { icon: 'bx-bug', class: 'butterfly', probability: 0.2 },
            { icon: 'bx-star', class: 'sparkle', probability: 0.25 }
        ];
        
        this.createNatureParticles();
        this.initMouseTrailParticles();
        this.initClickParticles();
        this.initSkyParticles();
        
        // 定期创建新粒子
        setInterval(() => {
            this.createFloatingParticle();
        }, 3000);
    }
    
    createNatureParticles() {
        const container = document.getElementById('nature-particles');
        if (!container) return;
        
        // 创建固定位置的装饰粒子
        for (let i = 0; i < 15; i++) {
            const particle = this.createNatureParticle();
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            container.appendChild(particle);
        }
    }
    
    createFloatingParticle() {
        const container = document.getElementById('nature-particles');
        if (!container) return;
        
        const particle = this.createNatureParticle();
        particle.classList.add('floating');
        particle.style.left = '-100px';
        particle.style.top = Math.random() * window.innerHeight + 'px';
        
        container.appendChild(particle);
        
        // 20秒后移除粒子
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 20000);
    }
    
    createNatureParticle() {
        const particle = document.createElement('div');
        particle.className = 'nature-particle';
        
        // 随机选择粒子类型
        const rand = Math.random();
        let cumulativeProbability = 0;
        
        for (const type of this.natureTypes) {
            cumulativeProbability += type.probability;
            if (rand <= cumulativeProbability) {
                particle.classList.add(type.class);
                particle.innerHTML = `<i class="bx ${type.icon}"></i>`;
                break;
            }
        }
        
        // 随机大小
        const size = 12 + Math.random() * 20;
        particle.style.fontSize = size + 'px';
        
        // 随机动画延迟
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        return particle;
    }
    
    // 鼠标拖尾粒子
    initMouseTrailParticles() {
        let lastTime = 0;
        const throttleTime = 50; // 节流时间
        
        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastTime < throttleTime) return;
            lastTime = now;
            
            // 只在主界面创建拖尾粒子
            if (this.currentState === 'main') {
                this.createMouseTrailParticle(e.clientX, e.clientY);
            }
        });
    }
    
    createMouseTrailParticle(x, y) {
        const container = document.getElementById('nature-particles');
        if (!container) return;
        
        const particle = document.createElement('div');
        particle.className = 'nature-particle mouse-trail';
        
        // 随机选择小型自然元素
        const miniTypes = ['🌿', '🌸', '✨', '🦋'];
        const randomType = miniTypes[Math.floor(Math.random() * miniTypes.length)];
        particle.textContent = randomType;
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.fontSize = '8px';
        particle.style.opacity = '0.7';
        particle.style.pointerEvents = 'none';
        particle.style.animation = 'mouseTrailFade 1s ease-out forwards';
        
        container.appendChild(particle);
        
        // 1秒后移除
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 1000);
    }
    
    // 鼠标点击粒子
    initClickParticles() {
        document.addEventListener('click', (e) => {
            // 只在主界面创建点击粒子
            if (this.currentState === 'main') {
                this.createClickParticle(e.clientX, e.clientY);
            }
        });
    }
    
    createClickParticle(x, y) {
        const container = document.getElementById('nature-particles');
        if (!container) return;
        
        // 创建多个粒子爆发效果
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'nature-particle click-burst';
            
            const burstTypes = ['🌸', '✨', '🌿', '💫'];
            const randomType = burstTypes[Math.floor(Math.random() * burstTypes.length)];
            particle.textContent = randomType;
            
            const angle = (Math.PI * 2 * i) / 5;
            const distance = 30 + Math.random() * 20;
            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.fontSize = '10px';
            particle.style.opacity = '0.8';
            particle.style.pointerEvents = 'none';
            particle.style.setProperty('--target-x', targetX + 'px');
            particle.style.setProperty('--target-y', targetY + 'px');
            particle.style.animation = 'clickBurst 0.8s ease-out forwards';
            
            container.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 800);
        }
    }
    
    // 划空粒子效果
    initSkyParticles() {
        setInterval(() => {
            if (this.currentState === 'main' && Math.random() < 0.3) {
                this.createSkyParticle();
            }
        }, 4000);
    }
    
    createSkyParticle() {
        const container = document.getElementById('nature-particles');
        if (!container) return;
        
        const particle = document.createElement('div');
        particle.className = 'nature-particle sky-drift';
        
        const skyTypes = ['🌙', '⭐', '☁️', '🌟'];
        const randomType = skyTypes[Math.floor(Math.random() * skyTypes.length)];
        particle.textContent = randomType;
        
        // 随机从边缘开始
        const edge = Math.floor(Math.random() * 4);
        let startX, startY, endX, endY;
        
        switch (edge) {
            case 0: // 从上边
                startX = Math.random() * window.innerWidth;
                startY = -50;
                endX = Math.random() * window.innerWidth;
                endY = window.innerHeight + 50;
                break;
            case 1: // 从右边
                startX = window.innerWidth + 50;
                startY = Math.random() * window.innerHeight;
                endX = -50;
                endY = Math.random() * window.innerHeight;
                break;
            case 2: // 从下边
                startX = Math.random() * window.innerWidth;
                startY = window.innerHeight + 50;
                endX = Math.random() * window.innerWidth;
                endY = -50;
                break;
            case 3: // 从左边
                startX = -50;
                startY = Math.random() * window.innerHeight;
                endX = window.innerWidth + 50;
                endY = Math.random() * window.innerHeight;
                break;
        }
        
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        particle.style.fontSize = '16px';
        particle.style.opacity = '0.6';
        particle.style.pointerEvents = 'none';
        particle.style.setProperty('--end-x', endX + 'px');
        particle.style.setProperty('--end-y', endY + 'px');
        particle.style.animation = 'skyDrift 8s linear forwards';
        
        container.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 8000);
    }
    


    // ===== 平台创建功能 =====
    
    showAddPlatformDialog() {
        // 重置表单
        document.getElementById('new-platform-name').value = '';
        document.getElementById('new-platform-description').value = '';
        document.getElementById('new-platform-icon').value = 'bx-trophy';
        document.querySelector('input[name="platform-type"][value="template"]').checked = true;
        
        document.getElementById('add-platform-dialog').classList.remove('hidden');
    }
    
    closeAddPlatformDialog() {
        document.getElementById('add-platform-dialog').classList.add('hidden');
    }
    
    createNewPlatform() {
        const name = document.getElementById('new-platform-name').value.trim();
        const description = document.getElementById('new-platform-description').value.trim();
        const icon = document.getElementById('new-platform-icon').value;
        const type = document.querySelector('input[name="platform-type"]:checked').value;
        
        if (!name) {
            alert('请输入平台名称');
            return;
        }
        
        if (!description) {
            alert('请输入平台描述');
            return;
        }
        
        // 检查平台名称是否已存在
        const platformId = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (this.platforms[platformId]) {
            alert('平台名称已存在，请使用其他名称');
            return;
        }
        
        // 创建新平台
        const newPlatform = {
            name: name,
            description: description,
            icon: icon,
            path: `static/${platformId}/index.html`,
            problems: 0,
            completed: 0,
            isDefault: false,
            type: type,
            createdAt: new Date().toISOString()
        };
        
        this.platforms[platformId] = newPlatform;
        this.savePlatforms();
        
        if (type === 'template') {
            // 如果选择了模板，提示用户需要手动创建文件
            alert(`平台"${name}"创建成功！\n\n由于浏览器安全限制，请手动执行以下步骤：\n1. 在项目根目录创建 static/${platformId}/ 文件夹\n2. 复制 static/ctfshow/ 下的所有文件到新文件夹\n3. 根据需要修改内容`);
        } else {
            alert(`平台"${name}"创建成功！\n\n请在 static/${platformId}/ 目录下创建 index.html 文件`);
        }
        
        this.closeAddPlatformDialog();
        this.renderPlatformManagement();
        this.renderPlatforms();
    }
    
    // 添加类别管理方法
    editCategory(index) {
        const category = this.currentPlatformData.topics[index];
        const newName = prompt('编辑类别名称:', category.name);
        if (newName && newName.trim()) {
            this.currentPlatformData.topics[index].name = newName.trim();
            this.renderCategoriesList();
        }
    }
    
    deleteCategory(index) {
        if (confirm('确定要删除这个类别吗？')) {
            this.currentPlatformData.topics.splice(index, 1);
            this.renderCategoriesList();
            this.renderProblemForm();
        }
    }
    
    // 添加成就管理方法
    editAchievement(index) {
        const achievement = this.currentPlatformData.achievements[index];
        const newTitle = prompt('编辑成就标题:', achievement.title);
        if (newTitle && newTitle.trim()) {
            const newDescription = prompt('编辑成就描述:', achievement.description);
            if (newDescription && newDescription.trim()) {
                this.currentPlatformData.achievements[index].title = newTitle.trim();
                this.currentPlatformData.achievements[index].description = newDescription.trim();
                this.renderAchievementsList();
            }
        }
    }
    
    deleteAchievement(index) {
        if (confirm('确定要删除这个成就吗？')) {
            this.currentPlatformData.achievements.splice(index, 1);
            this.renderAchievementsList();
        }
    }
    
    // 添加新类别
    addNewCategory() {
        const name = prompt('输入新类别名称:');
        if (name && name.trim()) {
            const startRange = prompt('输入起始题号:');
            const endRange = prompt('输入结束题号:');
            if (startRange && endRange) {
                const start = parseInt(startRange);
                const end = parseInt(endRange);
                if (!isNaN(start) && !isNaN(end) && start <= end) {
                    this.currentPlatformData.topics.push({
                        name: name.trim(),
                        range: [start, end],
                        icon: 'bx-folder'
                    });
                    this.renderCategoriesList();
                    this.renderProblemForm();
                } else {
                    alert('请输入有效的题号范围');
                }
            }
        }
    }
    
    // 添加新成就
    addNewAchievement() {
        const title = prompt('输入成就标题:');
        if (title && title.trim()) {
            const description = prompt('输入成就描述:');
            if (description && description.trim()) {
                this.currentPlatformData.achievements.push({
                    id: `custom-${Date.now()}`,
                    title: title.trim(),
                    description: description.trim(),
                    icon: 'bx-trophy'
                });
                this.renderAchievementsList();
            }
        }
    }
    
    // 添加题目到类别
    addProblemsToCategory() {
        const categoryIndex = document.getElementById('problem-category-select').value;
        const startNumber = parseInt(document.getElementById('problem-start-number').value);
        const endNumber = parseInt(document.getElementById('problem-end-number').value);
        
        if (isNaN(startNumber) || isNaN(endNumber) || startNumber > endNumber) {
            alert('请输入有效的题号范围');
            return;
        }
        
        const category = this.currentPlatformData.topics[categoryIndex];
        if (category) {
            // 扩展现有范围或添加新范围
            if (Array.isArray(category.range[0])) {
                category.range.push([startNumber, endNumber]);
            } else {
                category.range = [category.range, [startNumber, endNumber]];
            }
            
            this.renderCategoriesList();
            
            // 清空输入框
            document.getElementById('problem-start-number').value = '';
            document.getElementById('problem-end-number').value = '';
            
            alert(`已添加题目 ${startNumber}-${endNumber} 到 ${category.name} 类别`);
        }
    }
    
    // ===== 平台编辑器功能 =====
    
    showPlatformEditor(platform) {
        document.getElementById('edit-platform-dialog').classList.remove('hidden');
        this.loadPlatformData(platform);
        this.renderPlatformEditor();
    }
    
    closePlatformEditor() {
        document.getElementById('edit-platform-dialog').classList.add('hidden');
        this.currentEditingPlatform = null;
    }
    
    switchTab(tabName) {
        // 切换标签按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // 切换内容区域
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
    }
    
    loadPlatformData(platform) {
        // 从平台获取数据
        const platformData = this.getPlatformDataFromStorage(platform);
        this.currentPlatformData = platformData;
    }
    
    getPlatformDataFromStorage(platform) {
        // 默认CTFShow数据结构
        const defaultTopics = [
            { name: '信息搜集', range: [1, 17], icon: 'bx-search' },
            { name: '爆破', range: [21, 28], icon: 'bx-key' },
            { name: '命令执行', range: [[29, 77], [118, 122], [124, 124]], icon: 'bx-terminal' },
            { name: '文件包含', range: [[78, 88], [116, 117]], icon: 'bx-file' },
            { name: 'PHP特性', range: [[89, 115], [123, 150]], icon: 'bx-code-alt' }
        ];
        
        const defaultAchievements = [
            { id: 'milestone-1', title: '初来乍到', description: '完成第一题', icon: 'bx-trophy' },
            { id: 'milestone-10', title: '小试牛刀', description: '完成10题', icon: 'bx-trophy' },
            { id: 'milestone-50', title: '初出茅庐', description: '完成50题', icon: 'bx-trophy' }
        ];
        
        // 从localStorage获取自定义数据
        const customTopics = JSON.parse(localStorage.getItem(`platform-${this.currentEditingPlatform}-topics`) || 'null');
        const customAchievements = JSON.parse(localStorage.getItem(`platform-${this.currentEditingPlatform}-achievements`) || 'null');
        
        return {
            topics: customTopics || defaultTopics,
            achievements: customAchievements || defaultAchievements
        };
    }
    
    renderPlatformEditor() {
        this.renderCategoriesList();
        this.renderAchievementsList();
        this.renderProblemForm();
    }
    
    renderCategoriesList() {
        const container = document.getElementById('categories-list');
        const topics = this.currentPlatformData.topics;
        
        container.innerHTML = topics.map((topic, index) => `
            <div class="category-item" data-index="${index}">
                <div class="category-info">
                    <div class="category-icon">
                        <i class="bx ${topic.icon}"></i>
                    </div>
                    <div class="category-details">
                        <div class="category-name">${topic.name}</div>
                        <div class="category-range">${this.formatRange(topic.range)}</div>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="action-btn secondary small edit-category-btn" data-index="${index}">
                        <i class="bx bx-edit"></i>编辑
                    </button>
                    <button class="action-btn small delete-category-btn" style="background: #dc2626; color: white;" data-index="${index}">
                        <i class="bx bx-trash"></i>删除
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    renderAchievementsList() {
        const container = document.getElementById('achievements-edit-list');
        const achievements = this.currentPlatformData.achievements;
        
        container.innerHTML = achievements.map((achievement, index) => `
            <div class="achievement-item" data-index="${index}">
                <div class="achievement-info">
                    <div class="achievement-icon">
                        <i class="bx ${achievement.icon}"></i>
                    </div>
                    <div class="achievement-details">
                        <div class="achievement-title">${achievement.title}</div>
                        <div class="achievement-description">${achievement.description}</div>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="action-btn secondary small edit-achievement-btn" data-index="${index}">
                        <i class="bx bx-edit"></i>编辑
                    </button>
                    <button class="action-btn small delete-achievement-btn" style="background: #dc2626; color: white;" data-index="${index}">
                        <i class="bx bx-trash"></i>删除
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    renderProblemForm() {
        const select = document.getElementById('problem-category-select');
        const topics = this.currentPlatformData.topics;
        
        select.innerHTML = topics.map((topic, index) => `
            <option value="${index}">${topic.name}</option>
        `).join('');
    }
    
    formatRange(range) {
        if (Array.isArray(range[0])) {
            return range.map(r => `${r[0]}-${r[1]}`).join(', ');
        } else {
            return `${range[0]}-${range[1]}`;
        }
    }
    
    savePlatformEdit() {
        const platformId = this.currentEditingPlatform;
        
        // 保存到localStorage
        localStorage.setItem(`platform-${platformId}-topics`, JSON.stringify(this.currentPlatformData.topics));
        localStorage.setItem(`platform-${platformId}-achievements`, JSON.stringify(this.currentPlatformData.achievements));
        
        alert('平台数据已保存！');
        this.closePlatformEditor();
    }

    // ===== 图片选择器功能 =====
    
    showImageSelector() {
        document.getElementById('image-selector-modal').classList.remove('hidden');
        this.renderImageGallery();
    }
    
    closeImageSelector() {
        document.getElementById('image-selector-modal').classList.add('hidden');
    }
    
    renderImageGallery() {
        const container = document.getElementById('image-gallery');
        
        // 模拟static/images目录中的图片
        const availableImages = [
            'welcome.jpg',
            'ctf-guide.jpg', 
            'default-article.jpg',
            'achievement-bg.jpg',
            'platform-bg.jpg'
        ];
        
        container.innerHTML = availableImages.map(image => `
            <div class="gallery-image" data-image="static/images/${image}" onclick="sorinBase.selectImage('static/images/${image}')">
                <img src="static/images/${image}" alt="${image}" onerror="this.parentElement.style.display='none'">
            </div>
        `).join('') + `
            <div class="gallery-image add-new" onclick="sorinBase.uploadNewImage()">
                <i class="bx bx-plus"></i>
                <span>添加新图片</span>
            </div>
        `;
    }
    
    selectImage(imagePath) {
        this.selectedImagePath = imagePath;
        
        // 更新选中状态
        document.querySelectorAll('.gallery-image').forEach(img => {
            img.classList.remove('selected');
        });
        document.querySelector(`[data-image="${imagePath}"]`).classList.add('selected');
        
        // 更新预览
        this.displaySelectedImage(imagePath);
        this.closeImageSelector();
    }
    
    uploadNewImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    // 在实际应用中，这里应该上传到static/images目录
                    this.selectImage(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }

    // ===== 工具方法 =====
    
    editPlatform(platformId) {
        const platform = this.platforms[platformId];
        if (!platform) return;
        
        // 检查是否为CTFShow模板平台
        if (platform.type !== 'template') {
            alert('只有使用CTFShow模板的平台才能进行编辑');
            return;
        }
        
        this.currentEditingPlatform = platformId;
        this.showPlatformEditor(platform);
    }
    
    deletePlatform(platformId) {
        if (confirm(`确定要删除平台 "${this.platforms[platformId].name}" 吗？`)) {
            delete this.platforms[platformId];
            this.savePlatforms();
            this.renderPlatformManagement();
        }
    }
    
    editArticle(articleId) {
        this.showArticleEditor(articleId);
    }
    
    deleteArticle(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        if (confirm(`确定要删除文章 "${article.title}" 吗？`)) {
            this.articles = this.articles.filter(a => a.id !== articleId);
            this.saveArticles();
            this.renderArticleManagement();
        }
    }
}

// 初始化系统
let sorinBase;
document.addEventListener('DOMContentLoaded', () => {
    sorinBase = new SORINBaseSystem();
});
