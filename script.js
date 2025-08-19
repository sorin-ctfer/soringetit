// CTF刷题管理系统 - 主要JavaScript文件

class CTFManager {
    constructor() {
        this.currentMode = 'topic'; // 'topic' or 'sequence'
        this.showOnlyUnsolved = false;
        this.isDarkMode = false;
        this.currentProblem = null;
        this.isAuthenticated = false;
        this.monacoEditor = null;
        this.currentPlatform = 'ctfshow';
        
        // 题目数据结构
        this.topics = [
            { name: '信息搜集', range: [1, 17], icon: 'bx-search' },
            { name: '爆破', range: [21, 28], icon: 'bx-key' },
            { name: '命令执行', range: [[29, 77], [118, 122], [124, 124]], icon: 'bx-terminal' },
            { name: '文件包含', range: [[78, 88], [116, 117]], icon: 'bx-file' },
            { name: 'PHP特性', range: [[89, 115], [123, 150]], icon: 'bx-code-alt' },
            { name: '文件上传', range: [151, 170], icon: 'bx-upload' },
            { name: 'SQL注入', range: [171, 253], icon: 'bx-data' },
            { name: '反序列化', range: [254, 278], icon: 'bx-package' },
            { name: 'Java', range: [279, 300], icon: 'bx-coffee' },
            { name: '代码审计', range: [301, 310], icon: 'bx-search-alt' },
            { name: 'PHP CVE', range: [311, 315], icon: 'bx-bug' },
            { name: 'XSS', range: [316, 333], icon: 'bx-shield-x' },
            { name: 'Node.js', range: [334, 344], icon: 'bx-server' },
            { name: 'JWT', range: [345, 350], icon: 'bx-key' },
            { name: 'SSRF', range: [351, 360], icon: 'bx-link' },
            { name: 'SSTI', range: [361, 372], icon: 'bx-code' },
            { name: 'XXE', range: [373, 378], icon: 'bx-file-blank' },
            { name: '区块链', range: [379, 379], icon: 'bx-coin' },
            { name: '黑盒测试', range: [380, 395], icon: 'bx-package' },
            { name: '其他', range: [396, 460], icon: 'bx-dots-horizontal' },
            { name: '嵌入式', range: [461, 465], icon: 'bx-chip' },
            { name: '框架复现', range: [466, 476], icon: 'bx-buildings' },
            { name: 'CMS', range: [[477, 485], [600, 603]], icon: 'bx-home' },
            { name: '中期测评', range: [486, 516], icon: 'bx-test-tube' },
            { name: 'SQLi Lab', range: [517, 568], icon: 'bx-flask' },
            { name: 'ThinkPHP专题', range: [[569, 579], [604, 626]], icon: 'bx-code-block' },
            { name: '组件漏洞', range: [580, 599], icon: 'bx-puzzle' },
            { name: 'Laravel专题', range: [627, 635], icon: 'bx-code-curly' },
            { name: 'Yii专题', range: [636, 639], icon: 'bx-code-alt' },
            { name: '终极考核', range: [640, 669], icon: 'bx-trophy' },
            { name: '权限维持', range: [670, 679], icon: 'bx-lock' },
            { name: '大赛原题', range: [680, 800], icon: 'bx-medal' },
            { name: '常用姿势', range: [801, 831], icon: 'bx-trending-up' },
            { name: '税务比武', range: [832, 845], icon: 'bx-calculator' },
            { name: 'Java反序列化', range: [846, 858], icon: 'bx-export' },
            { name: '内网渗透', range: [859, 859], icon: 'bx-network-chart' }
        ];

        // 初始化数据
        this.initializeData();
        
        // 检查身份验证
        this.checkAuthentication();
        
        this.bindEvents();
        this.renderProblems();
        this.updateStats();
        this.updateSidebarPlatformInfo();
        this.initializeParticles();
        this.startTimeUpdater();
        this.checkTimeEncouragement();
        this.applyCurrentTheme();
        this.initPerformanceMonitor();
        this.initializeMonacoEditor();
    }

    initializeData() {
        // 从localStorage加载数据或初始化
        this.completedProblems = JSON.parse(localStorage.getItem('ctf-completed') || '[]');
        this.wrongProblems = JSON.parse(localStorage.getItem('ctf-wrong') || '[]');
        this.achievements = JSON.parse(localStorage.getItem('ctf-achievements') || '[]');
        this.isDarkMode = JSON.parse(localStorage.getItem('ctf-darkmode') || 'false');
        this.currentTheme = localStorage.getItem('ctf-theme') || 'default';
        this.searchQuery = '';
        
        // 初始化平台数据
        this.platforms = JSON.parse(localStorage.getItem('ctf-platforms') || JSON.stringify({
            'ctfshow': {
                name: 'CTFShow',
                categories: this.getDefaultCategories(),
                problems: this.getDefaultProblems(),
                achievements: [],
                completedProblems: [],
                wrongProblems: []
            }
        }));
        
        // 初始化解题报告数据
        this.reports = JSON.parse(localStorage.getItem('ctf-reports') || '{}');
        
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        }
        
        // 初始化过滤按钮状态
        setTimeout(() => {
            this.updateFilterButton();
        }, 100);
    }

    saveData() {
        localStorage.setItem('ctf-completed', JSON.stringify(this.completedProblems));
        localStorage.setItem('ctf-wrong', JSON.stringify(this.wrongProblems));
        localStorage.setItem('ctf-achievements', JSON.stringify(this.achievements));
        localStorage.setItem('ctf-darkmode', JSON.stringify(this.isDarkMode));
        localStorage.setItem('ctf-theme', this.currentTheme);
        localStorage.setItem('ctf-platforms', JSON.stringify(this.platforms));
        localStorage.setItem('ctf-reports', JSON.stringify(this.reports));
    }

    // 将范围转换为题目数组
    rangeToProblems(range) {
        const problems = [];
        if (Array.isArray(range[0])) {
            // 多个范围
            range.forEach(r => {
                for (let i = r[0]; i <= r[1]; i++) {
                    problems.push(i);
                }
            });
        } else {
            // 单个范围
            for (let i = range[0]; i <= range[1]; i++) {
                problems.push(i);
            }
        }
        return problems;
    }

    // 获取题目所属专题
    getProblemTopic(problemNumber) {
        for (const topic of this.topics) {
            const problems = this.rangeToProblems(topic.range);
            if (problems.includes(problemNumber)) {
                return topic.name;
            }
        }
        return '未知专题';
    }

    bindEvents() {
        // 模式切换
        document.getElementById('mode-toggle').addEventListener('click', () => {
            this.toggleMode();
        });

        // 过滤切换
        document.getElementById('filter-toggle').addEventListener('click', () => {
            this.toggleFilter();
        });

        // 主题切换
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // 模态框关闭
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        // 已刷题目
        document.getElementById('solved-problems-btn').addEventListener('click', () => {
            this.showSolvedProblems();
        });

        document.getElementById('close-solved-modal').addEventListener('click', () => {
            this.closeSolvedModal();
        });

        // 错题集
        document.getElementById('wrong-problems-btn').addEventListener('click', () => {
            this.showWrongProblems();
        });

        document.getElementById('close-wrong-modal').addEventListener('click', () => {
            this.closeWrongModal();
        });

        // 搜索功能
        const searchInput = document.getElementById('search-input');
        const clearSearch = document.getElementById('clear-search');
        
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderProblems();
            clearSearch.style.display = this.searchQuery ? 'flex' : 'none';
        });
        
        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            this.searchQuery = '';
            this.renderProblems();
            clearSearch.style.display = 'none';
        });

        // 主题选择器
        document.getElementById('theme-picker').addEventListener('click', () => {
            this.showThemeSelector();
        });

        document.getElementById('close-theme-selector').addEventListener('click', () => {
            this.closeThemeSelector();
        });

        // 重置功能
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.requireAuth(() => this.showResetModal());
        });

        document.getElementById('close-reset-modal').addEventListener('click', () => {
            this.closeResetModal();
        });

        document.getElementById('confirm-reset').addEventListener('click', () => {
            this.confirmReset();
        });

        // 身份验证
        document.getElementById('confirm-auth').addEventListener('click', () => {
            this.authenticateUser();
        });

        document.getElementById('auth-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.authenticateUser();
            }
        });

        // 平台管理
        document.getElementById('platform-manager').addEventListener('click', () => {
            this.showPlatformManager();
        });

        document.getElementById('close-platform-modal').addEventListener('click', () => {
            this.closePlatformModal();
        });

        document.getElementById('add-platform').addEventListener('click', () => {
            this.showAddPlatformModal();
        });

        // 平台快速切换
        document.getElementById('platform-switch-btn').addEventListener('click', () => {
            this.togglePlatformQuickSwitch();
        });

        document.getElementById('quick-add-platform').addEventListener('click', () => {
            this.showAddPlatformModal();
        });

        // 解题报告
        document.getElementById('close-report-modal').addEventListener('click', () => {
            this.closeReportModal();
        });

        document.getElementById('close-code-modal').addEventListener('click', () => {
            this.closeCodeModal();
        });

        document.getElementById('insert-code').addEventListener('click', () => {
            this.showCodeEditor();
        });

        document.getElementById('insert-code-block').addEventListener('click', () => {
            this.insertCodeBlock();
        });

        document.getElementById('cancel-code').addEventListener('click', () => {
            this.closeCodeModal();
        });

        document.getElementById('preview-report').addEventListener('click', () => {
            this.previewReport();
        });

        document.getElementById('save-report').addEventListener('click', () => {
            this.saveReport();
        });

        // 编辑器工具栏
        document.getElementById('font-small').addEventListener('click', () => {
            this.setFontSize('small');
        });

        document.getElementById('font-medium').addEventListener('click', () => {
            this.setFontSize('medium');
        });

        document.getElementById('font-large').addEventListener('click', () => {
            this.setFontSize('large');
        });

        document.getElementById('insert-bold').addEventListener('click', () => {
            this.insertMarkdown('**', '**');
        });

        document.getElementById('insert-italic').addEventListener('click', () => {
            this.insertMarkdown('*', '*');
        });

        document.getElementById('insert-heading').addEventListener('click', () => {
            this.insertMarkdown('## ', '');
        });

        // 代码语言切换
        document.getElementById('code-language').addEventListener('change', (e) => {
            if (this.monacoEditor) {
                monaco.editor.setModelLanguage(this.monacoEditor.getModel(), e.target.value);
            }
        });

        // 主题选择
        document.addEventListener('click', (e) => {
            if (e.target.closest('.theme-option')) {
                const themeOption = e.target.closest('.theme-option');
                const theme = themeOption.dataset.theme;
                this.changeTheme(theme);
            }
        });

        // 完成题目
        document.getElementById('complete-problem').addEventListener('click', () => {
            this.requireAuth(() => this.completeProblem());
        });

        // 加入错题集
        document.getElementById('add-to-wrong').addEventListener('click', () => {
            this.requireAuth(() => this.addToWrong());
        });

        // 点击背景关闭模态框
        document.querySelectorAll('.modal-backdrop, .theme-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.closeAllModals();
                }
            });
        });

        // 全局点击特效
        document.addEventListener('click', (e) => {
            this.createClickEffect(e.pageX, e.pageY);
        });

        // 鼠标拖尾特效
        this.initMouseTrail();
        
        // 几何背景鼠标跟随
        this.initGeometricMouseFollow();

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    toggleMode() {
        this.currentMode = this.currentMode === 'topic' ? 'sequence' : 'topic';
        const modeBtn = document.getElementById('mode-toggle');
        const modeIndicator = document.getElementById('current-mode');
        
        if (this.currentMode === 'topic') {
            modeBtn.innerHTML = '<i class="bx bx-shuffle"></i><span>按专题</span>';
            modeIndicator.textContent = '按专题刷题';
            document.getElementById('topic-mode').classList.remove('hidden');
            document.getElementById('sequence-mode').classList.add('hidden');
        } else {
            modeBtn.innerHTML = '<i class="bx bx-list-ol"></i><span>按序号</span>';
            modeIndicator.textContent = '按序号刷题';
            document.getElementById('topic-mode').classList.add('hidden');
            document.getElementById('sequence-mode').classList.remove('hidden');
        }
        
        this.renderProblems();
    }

    toggleFilter() {
        this.showOnlyUnsolved = !this.showOnlyUnsolved;
        this.updateFilterButton();
        this.renderProblems();
        this.updateStats();
    }

    updateFilterButton() {
        const filterBtn = document.getElementById('filter-toggle');
        if (!filterBtn) return;
        
        if (this.showOnlyUnsolved) {
            filterBtn.innerHTML = '<i class="bx bx-filter-alt"></i><span>仅未刷</span>';
            filterBtn.classList.add('active');
        } else {
            filterBtn.innerHTML = '<i class="bx bx-filter"></i><span>全部</span>';
            filterBtn.classList.remove('active');
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode');
        
        const themeBtn = document.getElementById('theme-toggle');
        themeBtn.innerHTML = this.isDarkMode ? '<i class="bx bx-sun"></i>' : '<i class="bx bx-moon"></i>';
        
        this.saveData();
    }

    renderProblems() {
        if (this.currentMode === 'topic') {
            this.renderTopicMode();
        } else {
            this.renderSequenceMode();
        }
        this.updateStats(); // 确保每次渲染后更新统计
    }

    renderTopicMode() {
        const container = document.getElementById('topic-mode');
        container.innerHTML = '';

        this.topics.forEach(topic => {
            const problems = this.rangeToProblems(topic.range);
            const completedInTopic = problems.filter(p => this.completedProblems.includes(p)).length;
            const totalInTopic = problems.length;
            const isCompleted = completedInTopic === totalInTopic;

            // 搜索过滤
            if (this.searchQuery && !topic.name.toLowerCase().includes(this.searchQuery)) {
                return;
            }

            if (this.showOnlyUnsolved && isCompleted) return;

            const topicCard = document.createElement('div');
            topicCard.className = `topic-card glass-effect ${isCompleted ? 'completed' : ''}`;
            
            topicCard.innerHTML = `
                <div class="topic-header">
                    <div class="topic-icon">
                        <i class="bx ${topic.icon}"></i>
                    </div>
                    <div class="topic-info">
                        <h3>${topic.name}</h3>
                        <span class="topic-progress">${completedInTopic}/${totalInTopic}</span>
                    </div>
                    ${isCompleted ? '<div class="completed-badge"><i class="bx bx-check"></i></div>' : ''}
                </div>
                <div class="topic-progress-bar">
                    <div class="progress-fill" style="width: ${(completedInTopic/totalInTopic)*100}%"></div>
                </div>
                <div class="topic-problems">
                    ${problems.slice(0, 5).map(p => `
                        <span class="problem-tag ${this.completedProblems.includes(p) ? 'completed' : ''}">${p}</span>
                    `).join('')}
                    ${problems.length > 5 ? `<span class="more-problems">+${problems.length - 5}</span>` : ''}
                </div>
            `;

            topicCard.addEventListener('click', () => {
                this.showTopicProblems(topic);
            });

            container.appendChild(topicCard);
        });
    }

    renderSequenceMode() {
        const container = document.getElementById('sequence-mode');
        container.innerHTML = '';

        for (let i = 1; i <= 859; i++) {
            const isCompleted = this.completedProblems.includes(i);
            const isWrong = this.wrongProblems.includes(i);
            const topic = this.getProblemTopic(i);
            
            // 搜索过滤
            if (this.searchQuery) {
                const searchStr = this.searchQuery;
                const matchNumber = i.toString().includes(searchStr);
                const matchTopic = topic.toLowerCase().includes(searchStr);
                const matchWebNumber = `web${i}`.toLowerCase().includes(searchStr);
                
                if (!matchNumber && !matchTopic && !matchWebNumber) {
                    continue;
                }
            }
            
            if (this.showOnlyUnsolved && isCompleted) continue;

            const problemCard = document.createElement('div');
            problemCard.className = `problem-card glass-effect ${isCompleted ? 'completed' : ''} ${isWrong ? 'wrong' : ''}`;
            
            problemCard.innerHTML = `
                <div class="problem-number">web${i}</div>
                <div class="problem-topic">${topic}</div>
                <div class="problem-status">
                    ${isCompleted ? '<i class="bx bx-check-circle"></i>' : '<i class="bx bx-circle"></i>'}
                    ${isWrong ? '<i class="bx bx-error-circle wrong-icon"></i>' : ''}
                </div>
            `;

            problemCard.addEventListener('click', () => {
                this.showProblemModal(i);
            });

            container.appendChild(problemCard);
        }
        
        // 搜索结果提示
        if (this.searchQuery && container.children.length === 0) {
            container.innerHTML = '<div class="empty-state">🔍 没有找到匹配的题目</div>';
        }
    }

    showTopicProblems(topic) {
        const problems = this.rangeToProblems(topic.range);
        const container = document.getElementById('sequence-mode');
        container.innerHTML = '';

        problems.forEach(problemNum => {
            const isCompleted = this.completedProblems.includes(problemNum);
            const isWrong = this.wrongProblems.includes(problemNum);
            
            if (this.showOnlyUnsolved && isCompleted) return;

            const problemCard = document.createElement('div');
            problemCard.className = `problem-card glass-effect ${isCompleted ? 'completed' : ''} ${isWrong ? 'wrong' : ''}`;
            
            problemCard.innerHTML = `
                <div class="problem-number">web${problemNum}</div>
                <div class="problem-topic">${topic.name}</div>
                <div class="problem-status">
                    ${isCompleted ? '<i class="bx bx-check-circle"></i>' : '<i class="bx bx-circle"></i>'}
                    ${isWrong ? '<i class="bx bx-error-circle wrong-icon"></i>' : ''}
                </div>
            `;

            problemCard.addEventListener('click', () => {
                this.showProblemModal(problemNum);
            });

            container.appendChild(problemCard);
        });

        // 切换到sequence模式显示
        document.getElementById('topic-mode').classList.add('hidden');
        document.getElementById('sequence-mode').classList.remove('hidden');
        document.getElementById('current-mode').textContent = `${topic.name} 专题`;
    }

    showProblemModal(problemNumber) {
        this.currentProblem = problemNumber;
        const topic = this.getProblemTopic(problemNumber);
        
        document.getElementById('modal-title').textContent = `web${problemNumber}`;
        document.getElementById('modal-category').textContent = topic;
        document.getElementById('modal-number').textContent = `#${problemNumber}`;
        
        const isCompleted = this.completedProblems.includes(problemNumber);
        const completeBtn = document.getElementById('complete-problem');
        
        if (isCompleted) {
            completeBtn.innerHTML = '<i class="bx bx-check"></i>已完成';
            completeBtn.classList.add('completed');
        } else {
            completeBtn.innerHTML = '<i class="bx bx-check"></i>标记完成';
            completeBtn.classList.remove('completed');
        }
        
        document.getElementById('problem-modal').classList.remove('hidden');
    }

    completeProblem() {
        if (!this.currentProblem) return;
        
        const problemNumber = this.currentProblem;
        const isAlreadyCompleted = this.completedProblems.includes(problemNumber);
        
        if (!isAlreadyCompleted) {
            this.completedProblems.push(problemNumber);
            this.saveData();
            this.updateStats();
            this.checkAchievements();
            this.showEncouragement('太棒了！又完成一题！🎉');
            this.createCelebrationEffect();
            
            // 更新按钮状态
            const completeBtn = document.getElementById('complete-problem');
            completeBtn.innerHTML = '<i class="bx bx-check"></i>已完成';
            completeBtn.classList.add('completed');
            
            // 立即重新渲染界面
            setTimeout(() => {
                this.renderProblems();
            }, 100);
            
            // 关闭当前模态框
            this.closeModal();
            
            // 询问是否添加解题报告
            setTimeout(() => {
                this.askForReport(problemNumber);
            }, 500);
        } else {
            this.closeModal();
        }
    }

    askForReport(problemNumber) {
        const existingReport = this.reports[`web${problemNumber}`];
        const message = existingReport ? 
            '这道题已有解题报告，是否要编辑？' : 
            '恭喜完成题目！是否要添加解题报告？';
        
        if (confirm(message)) {
            this.showReportModal(`web${problemNumber}`);
        }
    }

    addToWrong() {
        if (!this.currentProblem) return;
        
        const problemNumber = this.currentProblem;
        if (!this.wrongProblems.includes(problemNumber)) {
            this.wrongProblems.push(problemNumber);
            this.saveData();
            this.showEncouragement('已加入错题集，记得回来复习哦！📚');
        }
        
        this.closeModal();
        this.renderProblems();
    }

    showSolvedProblems() {
        const container = document.getElementById('solved-problems-list');
        container.innerHTML = '';

        if (this.completedProblems.length === 0) {
            container.innerHTML = '<div class="empty-state">还没有完成任何题目，加油！</div>';
        } else {
            this.completedProblems.forEach(problemNum => {
                const topic = this.getProblemTopic(problemNum);
                const problemCard = document.createElement('div');
                problemCard.className = 'solved-problem-card glass-effect';
                
                problemCard.innerHTML = `
                    <div class="solved-problem-info">
                        <span class="solved-problem-number">web${problemNum}</span>
                        <span class="solved-problem-topic">${topic}</span>
                    </div>
                    <button class="unsolved-btn" onclick="ctfManager.uncompleteProblem(${problemNum})">
                        <i class="bx bx-undo"></i>
                    </button>
                `;
                
                container.appendChild(problemCard);
            });
        }

        document.getElementById('solved-modal').classList.remove('hidden');
    }

    showWrongProblems() {
        const container = document.getElementById('wrong-problems-list');
        container.innerHTML = '';

        if (this.wrongProblems.length === 0) {
            container.innerHTML = '<div class="empty-state">错题集是空的，真棒！🎉</div>';
        } else {
            this.wrongProblems.forEach(problemNum => {
                const topic = this.getProblemTopic(problemNum);
                const problemCard = document.createElement('div');
                problemCard.className = 'solved-problem-card glass-effect';
                
                problemCard.innerHTML = `
                    <div class="solved-problem-info">
                        <span class="solved-problem-number">web${problemNum}</span>
                        <span class="solved-problem-topic">${topic}</span>
                    </div>
                    <button class="remove-wrong-btn" onclick="ctfManager.removeFromWrong(${problemNum})">
                        <i class="bx bx-check"></i>
                    </button>
                `;
                
                container.appendChild(problemCard);
            });
        }

        document.getElementById('wrong-modal').classList.remove('hidden');
    }

    uncompleteProblem(problemNumber) {
        const index = this.completedProblems.indexOf(problemNumber);
        if (index > -1) {
            this.completedProblems.splice(index, 1);
            this.saveData();
            this.updateStats();
            this.showSolvedProblems(); // 刷新已刷题目列表
            this.renderProblems(); // 刷新主界面
            this.showEncouragement('题目已重置为未完成状态');
        }
    }

    removeFromWrong(problemNumber) {
        const index = this.wrongProblems.indexOf(problemNumber);
        if (index > -1) {
            this.wrongProblems.splice(index, 1);
            this.saveData();
            this.showWrongProblems(); // 刷新错题集列表
            this.renderProblems(); // 刷新主界面
            this.showEncouragement('已从错题集移除！');
            
            // 检查是否清空错题集
            if (this.wrongProblems.length === 0) {
                setTimeout(() => {
                    this.showEncouragement('🎉 错题集已清空！你太厉害了！');
                }, 1000);
            }
        }
    }

    closeModal() {
        document.getElementById('problem-modal').classList.add('hidden');
        this.currentProblem = null;
    }

    closeSolvedModal() {
        document.getElementById('solved-modal').classList.add('hidden');
    }

    closeWrongModal() {
        document.getElementById('wrong-modal').classList.add('hidden');
    }

    closeAllModals() {
        document.querySelectorAll('.modal, .theme-selector').forEach(modal => {
            modal.classList.add('hidden');
        });
        this.currentProblem = null;
    }

    // 主题选择器
    showThemeSelector() {
        document.getElementById('theme-selector').classList.remove('hidden');
        // 更新当前主题的选中状态
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.toggle('active', option.dataset.theme === this.currentTheme);
        });
    }

    closeThemeSelector() {
        document.getElementById('theme-selector').classList.add('hidden');
    }

    changeTheme(theme) {
        // 移除所有主题类
        document.body.classList.remove(
            'theme-elegant-gray', 'theme-premium-black', 'theme-pure-white',
            'theme-elegant-blue', 'theme-nature-green', 'theme-neon-pink', 'theme-mystery-purple'
        );

        // 应用新主题
        if (theme !== 'default') {
            document.body.classList.add(`theme-${theme}`);
        }

        this.currentTheme = theme;
        this.saveData();
        this.closeThemeSelector();

        // 更新粒子效果颜色
        this.updateParticleColors();
        
        this.showEncouragement(`🎨 主题已切换为${this.getThemeName(theme)}！`);
    }

    getThemeName(theme) {
        const themeNames = {
            'default': '默认渐变',
            'elegant-gray': '典雅灰',
            'premium-black': '高级黑',
            'pure-white': '纯净白',
            'elegant-blue': '淡雅蓝',
            'nature-green': '自然绿',
            'neon-pink': '霓虹粉',
            'mystery-purple': '神秘紫'
        };
        return themeNames[theme] || '未知主题';
    }

    // 重置功能
    showResetModal() {
        document.getElementById('reset-modal').classList.remove('hidden');
        document.getElementById('reset-password').value = '';
    }

    closeResetModal() {
        document.getElementById('reset-modal').classList.add('hidden');
    }

    confirmReset() {
        const password = document.getElementById('reset-password').value;
        const correctPassword = 'soringetit'; // 秘密密码
        
        if (password === correctPassword) {
            // 重置所有数据
            this.completedProblems = [];
            this.wrongProblems = [];
            this.achievements = [];
            localStorage.removeItem('ctf-completed');
            localStorage.removeItem('ctf-wrong');
            localStorage.removeItem('ctf-achievements');
            
            this.closeResetModal();
            this.updateStats();
            this.renderProblems();
            this.showEncouragement('🔄 数据已重置完成！', 'achievement');
            this.createCelebrationEffect();
        } else {
            // 密码错误
            const input = document.getElementById('reset-password');
            input.style.borderColor = 'var(--error-color)';
            input.placeholder = '密码错误，请重试';
            input.value = '';
            
            setTimeout(() => {
                input.style.borderColor = '';
                input.placeholder = '请输入重置密码';
            }, 2000);
        }
    }

    // 点击特效
    createClickEffect(x, y) {
        const effect = document.createElement('div');
        effect.className = 'click-effect';
        effect.style.left = x + 'px';
        effect.style.top = y + 'px';
        
        // 使用当前主题颜色
        const colors = this.getThemeColors();
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        effect.style.color = randomColor;
        effect.style.background = `radial-gradient(circle, ${randomColor}66, transparent)`;
        
        document.getElementById('click-effects').appendChild(effect);
        
        // 动画结束后移除
        setTimeout(() => {
            if (effect.parentNode) {
                effect.remove();
            }
        }, 800);
    }

    // 鼠标拖尾特效
    initMouseTrail() {
        let lastX = 0, lastY = 0;
        this.trailFrequency = 50; // 默认节流时间
        
        // 使用节流来控制拖尾生成频率
        let trailTimer = null;
        
        document.addEventListener('mousemove', (e) => {
            const currentX = e.pageX;
            const currentY = e.pageY;
            
            // 只有当鼠标移动足够距离时才创建拖尾
            const distance = Math.sqrt((currentX - lastX) ** 2 + (currentY - lastY) ** 2);
            if (distance < 12) return;
            
            lastX = currentX;
            lastY = currentY;
            
            // 动态节流控制
            if (trailTimer) return;
            trailTimer = setTimeout(() => {
                trailTimer = null;
            }, this.trailFrequency);
            
            // 创建拖尾点
            this.createTrailDot(currentX, currentY);
        });
    }

    createTrailDot(x, y) {
        const trail = document.createElement('div');
        trail.className = 'trail-dot';
        trail.style.left = x + 'px';
        trail.style.top = y + 'px';
        
        // 使用当前主题的主色调
        const colors = this.getThemeColors();
        trail.style.background = `radial-gradient(circle, ${colors[0]}88, transparent)`;
        
        document.getElementById('mouse-trail').appendChild(trail);
        
        // 自动清理
        setTimeout(() => {
            if (trail.parentNode) {
                trail.remove();
            }
        }, 800);
    }

    // 几何背景鼠标跟随
    initGeometricMouseFollow() {
        let mouseX = 0, mouseY = 0;
        let animationId = null;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });
        
        // 使用requestAnimationFrame优化性能
        const updateShapes = () => {
            const shapes = document.querySelectorAll('.geometric-shape');
            
            shapes.forEach((shape, index) => {
                const factor = (index + 1) * 10; // 不同形状有不同的跟随强度
                const translateX = mouseX * factor;
                const translateY = mouseY * factor;
                const rotation = mouseX * (index + 1) * 5;
                
                shape.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg)`;
            });
            
            animationId = requestAnimationFrame(updateShapes);
        };
        
        updateShapes();
        
        // 页面卸载时清理
        window.addEventListener('beforeunload', () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        });
    }

    updateStats() {
        document.getElementById('completed-count').textContent = this.completedProblems.length;
        const progress = (this.completedProblems.length / 859) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        
        this.updateAchievements();
    }

    checkAchievements() {
        const newAchievements = [];
        
        // 检查专题完成情况
        this.topics.forEach(topic => {
            const problems = this.rangeToProblems(topic.range);
            const completedInTopic = problems.filter(p => this.completedProblems.includes(p)).length;
            
            if (completedInTopic === problems.length) {
                const achievementId = `topic-${topic.name}`;
                if (!this.achievements.includes(achievementId)) {
                    newAchievements.push({
                        id: achievementId,
                        title: `${topic.name}大师！`,
                        description: `完成所有${topic.name}题目`,
                        icon: topic.icon
                    });
                    this.achievements.push(achievementId);
                }
            }
        });

        // 检查里程碑
        const milestones = [
            { count: 1, title: '初来乍到', description: '完成第一题！开始你的CTF之旅' },
            { count: 10, title: '小试牛刀', description: '完成10题，基础扎实' },
            { count: 25, title: '渐入佳境', description: '完成25题，越来越熟练' },
            { count: 50, title: '初出茅庐', description: '完成50题，已有小成' },
            { count: 100, title: '小有成就', description: '完成100题，实力认证' },
            { count: 150, title: '进步神速', description: '完成150题，天赋异禀' },
            { count: 200, title: '实力不俗', description: '完成200题，技术过硬' },
            { count: 300, title: '高手在列', description: '完成300题，已成高手' },
            { count: 400, title: '登峰造极', description: '完成400题，技艺精湛' },
            { count: 500, title: '大神降临', description: '完成500题，神级水准' },
            { count: 600, title: '无人能敌', description: '完成600题，独孤求败' },
            { count: 700, title: '传说中的存在', description: '完成700题，传奇人物' },
            { count: 800, title: '接近完美', description: '完成800题，几近完美' },
            { count: 859, title: '终极大师！', description: '完成全部题目！你就是CTF之神！' }
        ];

        milestones.forEach(milestone => {
            const achievementId = `milestone-${milestone.count}`;
            if (this.completedProblems.length >= milestone.count && !this.achievements.includes(achievementId)) {
                newAchievements.push({
                    id: achievementId,
                    title: milestone.title,
                    description: milestone.description,
                    icon: 'bx-trophy'
                });
                this.achievements.push(achievementId);
            }
        });

        // 特殊成就
        this.checkSpecialAchievements(newAchievements);

        // 显示新获得的成就
        newAchievements.forEach((achievement, index) => {
            setTimeout(() => {
                this.showAchievementUnlock(achievement);
            }, index * 1000);
        });

        if (newAchievements.length > 0) {
            this.saveData();
        }
    }

    checkSpecialAchievements(newAchievements) {
        // 连续刷题成就（模拟）
        const streakAchievements = [
            { id: 'streak-3', title: '三连击！', description: '连续完成3题', icon: 'bx-zap' },
            { id: 'streak-5', title: '五连杀！', description: '连续完成5题', icon: 'bx-lightning' },
            { id: 'streak-10', title: '十连胜！', description: '连续完成10题', icon: 'bx-crown' }
        ];

        // 错题清空成就
        if (this.wrongProblems.length === 0 && this.completedProblems.length > 10) {
            const achievementId = 'no-wrong-problems';
            if (!this.achievements.includes(achievementId)) {
                newAchievements.push({
                    id: achievementId,
                    title: '完美主义者',
                    description: '错题集为空，真是厉害！',
                    icon: 'bx-heart'
                });
                this.achievements.push(achievementId);
            }
        }

        // 夜猫子成就
        const hour = new Date().getHours();
        if ((hour >= 23 || hour <= 5) && this.completedProblems.length > 0) {
            const achievementId = 'night-owl';
            if (!this.achievements.includes(achievementId)) {
                newAchievements.push({
                    id: achievementId,
                    title: '夜猫子',
                    description: '深夜还在刷题，真是勤奋！',
                    icon: 'bx-moon'
                });
                this.achievements.push(achievementId);
            }
        }

        // 早鸟成就
        if (hour >= 5 && hour <= 7 && this.completedProblems.length > 0) {
            const achievementId = 'early-bird';
            if (!this.achievements.includes(achievementId)) {
                newAchievements.push({
                    id: achievementId,
                    title: '早起的鸟儿',
                    description: '早起刷题，精神可嘉！',
                    icon: 'bx-sun'
                });
                this.achievements.push(achievementId);
            }
        }

        // 收集家成就
        if (this.achievements.length >= 10) {
            const achievementId = 'collector';
            if (!this.achievements.includes(achievementId)) {
                newAchievements.push({
                    id: achievementId,
                    title: '收集家',
                    description: '获得10个成就，真是个收集家！',
                    icon: 'bx-collection'
                });
                this.achievements.push(achievementId);
            }
        }
    }

    updateAchievements() {
        const container = document.getElementById('achievements-list');
        container.innerHTML = '';

        if (this.achievements.length === 0) {
            container.innerHTML = '<div class="no-achievements">暂无称号，努力刷题获得吧！</div>';
            return;
        }

        // 重新生成成就显示
        this.achievements.forEach(achievementId => {
            const achievement = this.getAchievementInfo(achievementId);
            if (achievement) {
                const achievementEl = document.createElement('div');
                achievementEl.className = 'achievement-item';
                achievementEl.innerHTML = `
                    <div class="achievement-icon">
                        <i class="bx ${achievement.icon}"></i>
                    </div>
                    <div class="achievement-info">
                        <span class="achievement-title">${achievement.title}</span>
                        <span class="achievement-desc">${achievement.description}</span>
                    </div>
                `;
                container.appendChild(achievementEl);
            }
        });
    }

    getAchievementInfo(achievementId) {
        if (achievementId.startsWith('topic-')) {
            const topicName = achievementId.replace('topic-', '');
            const topic = this.topics.find(t => t.name === topicName);
            if (topic) {
                return {
                    title: `${topicName}大师！`,
                    description: `完成所有${topicName}题目`,
                    icon: topic.icon
                };
            }
        } else if (achievementId.startsWith('milestone-')) {
            const count = achievementId.replace('milestone-', '');
            const milestones = {
                '50': { title: '初出茅庐', description: '完成50题' },
                '100': { title: '小有成就', description: '完成100题' },
                '200': { title: '实力不俗', description: '完成200题' },
                '300': { title: '高手在列', description: '完成300题' },
                '500': { title: '大神降临', description: '完成500题' },
                '700': { title: '传说中的存在', description: '完成700题' },
                '859': { title: '终极大师！', description: '完成全部题目！' }
            };
            if (milestones[count]) {
                return {
                    title: milestones[count].title,
                    description: milestones[count].description,
                    icon: 'bx-trophy'
                };
            }
        }
        return null;
    }

    showAchievementUnlock(achievement) {
        this.showEncouragement(`🏆 获得称号：${achievement.title}`, 'achievement');
        this.createCelebrationEffect(true);
        this.updateAchievements();
    }

    showEncouragement(message, type = 'normal') {
        const toast = document.getElementById('encouragement-toast');
        const messageEl = document.getElementById('toast-message');
        
        messageEl.textContent = message;
        toast.classList.remove('hidden');
        
        if (type === 'achievement') {
            toast.classList.add('achievement');
        }
        
        setTimeout(() => {
            toast.classList.add('hidden');
            toast.classList.remove('achievement');
        }, 3000);
    }

    createCelebrationEffect(isAchievement = false) {
        if (isAchievement) {
            // 更华丽的庆祝效果
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            
            setTimeout(() => {
                confetti({
                    particleCount: 50,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 }
                });
            }, 200);
            
            setTimeout(() => {
                confetti({
                    particleCount: 50,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 }
                });
            }, 400);
        } else {
            // 普通庆祝效果
            confetti({
                particleCount: 30,
                spread: 60,
                origin: { y: 0.7 }
            });
        }
    }

    startTimeUpdater() {
        this.updateTime();
        setInterval(() => {
            this.updateTime();
        }, 1000);
    }

    updateTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-CN', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('current-time').textContent = timeStr;
    }

    checkTimeEncouragement() {
        const now = new Date();
        const hour = now.getHours();
        
        const encouragements = {
            early: [
                '早起的鸟儿有虫吃！早上刷题效率最高！🌅',
                '一日之计在于晨，开始今天的刷题之旅吧！',
                '清晨的大脑最清醒，正是刷题的好时光！'
            ],
            morning: [
                '上午好！精神饱满地开始刷题吧！☀️',
                '美好的上午，适合挑战困难题目！',
                '上午时光，大脑活跃，正是学习的黄金时间！'
            ],
            noon: [
                '中午了，刷完这题去吃饭吧！🍽️',
                '午间小憩前再刷一题！',
                '中午时分，保持学习的热情！'
            ],
            afternoon: [
                '下午好！继续保持刷题的节奏！🌤️',
                '下午时光，最适合巩固知识！',
                '午后阳光正好，刷题心情也很好！'
            ],
            evening: [
                '傍晚了，今天刷了几题呢？🌆',
                '黄昏时分，总结今天的学习成果！',
                '夕阳西下，知识却在不断积累！'
            ],
            night: [
                '夜晚来临，夜猫子开始活跃了！🌙',
                '夜深人静，正是专心刷题的时候！',
                '夜晚的宁静最适合深度思考！'
            ],
            lateNight: [
                '深夜还在刷题？真是卷王中王！💪',
                '熬夜刷题，但记得保护好身体哦！',
                '夜深了，不要太晚睡觉哦！'
            ]
        };

        let timeCategory;
        let messages;

        if (hour >= 5 && hour < 8) {
            timeCategory = 'early';
            messages = encouragements.early;
        } else if (hour >= 8 && hour < 12) {
            timeCategory = 'morning';
            messages = encouragements.morning;
        } else if (hour >= 12 && hour < 14) {
            timeCategory = 'noon';
            messages = encouragements.noon;
        } else if (hour >= 14 && hour < 18) {
            timeCategory = 'afternoon';
            messages = encouragements.afternoon;
        } else if (hour >= 18 && hour < 21) {
            timeCategory = 'evening';
            messages = encouragements.evening;
        } else if (hour >= 21 && hour < 24) {
            timeCategory = 'night';
            messages = encouragements.night;
        } else {
            timeCategory = 'lateNight';
            messages = encouragements.lateNight;
        }

        // 随机选择一条消息，延迟显示避免与页面加载冲突
        setTimeout(() => {
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            this.showEncouragement(randomMessage);
        }, 2000);

        // 每小时检查一次时间变化
        setTimeout(() => {
            this.checkTimeEncouragement();
        }, 3600000);
    }

    initializeParticles() {
        this.particleConfig = {
            particles: {
                number: { value: 60, density: { enable: true, value_area: 800 } },
                color: { value: this.getThemeColors() },
                shape: { type: 'circle' },
                opacity: { value: 0.4, random: true, animation: { enable: true, speed: 1.5, opacity_min: 0.1 } },
                size: { value: 4, random: true, animation: { enable: true, speed: 3, size_min: 0.5 } },
                line_linked: { enable: false },
                move: {
                    enable: true,
                    speed: 1.5,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'repulse' },
                    onclick: { enable: true, mode: 'push' }
                },
                modes: {
                    repulse: { distance: 120, duration: 0.4 },
                    push: { particles_nb: 6 }
                }
            },
            retina_detect: true
        };
        
        particlesJS('particles-js', this.particleConfig);
    }

    getThemeColors() {
        const themeColorMap = {
            'default': ['#667eea', '#764ba2', '#f093fb'],
            'elegant-gray': ['#6b7280', '#9ca3af', '#d1d5db'],
            'premium-black': ['#374151', '#6b7280', '#9ca3af'],
            'pure-white': ['#e5e7eb', '#f3f4f6', '#ffffff'],
            'elegant-blue': ['#3b82f6', '#60a5fa', '#93c5fd'],
            'nature-green': ['#10b981', '#34d399', '#6ee7b7'],
            'neon-pink': ['#ec4899', '#f472b6', '#fb7185'],
            'mystery-purple': ['#8b5cf6', '#a78bfa', '#c4b5fd']
        };
        return themeColorMap[this.currentTheme] || themeColorMap['default'];
    }

    updateParticleColors() {
        if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
            const newColors = this.getThemeColors();
            window.pJSDom[0].pJS.particles.color.value = newColors;
            // 重新初始化粒子以应用新颜色
            setTimeout(() => {
                this.initializeParticles();
            }, 100);
        }
    }

    applyCurrentTheme() {
        if (this.currentTheme !== 'default') {
            document.body.classList.add(`theme-${this.currentTheme}`);
        }
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        }
    }

    // 性能监控
    initPerformanceMonitor() {
        this.performanceEnabled = true;
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        
        // 检测设备性能
        this.checkDevicePerformance();
        
        // 监控帧率
        this.monitorFrameRate();
    }

    checkDevicePerformance() {
        // 检测是否为移动设备
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // 检测内存
        const memory = navigator.deviceMemory || 4; // 默认4GB
        
        // 检测硬件并发
        const cores = navigator.hardwareConcurrency || 2;
        
        // 根据设备性能调整特效
        if (isMobile || memory < 4 || cores < 4) {
            this.reduceEffects();
        }
    }

    monitorFrameRate() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const checkFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                // 如果帧率低于30，减少特效
                if (fps < 30 && this.performanceEnabled) {
                    this.reduceEffects();
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            if (this.performanceEnabled) {
                requestAnimationFrame(checkFPS);
            }
        };
        
        requestAnimationFrame(checkFPS);
    }

    reduceEffects() {
        console.log('性能优化：减少特效');
        
        // 减少粒子数量
        if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
            window.pJSDom[0].pJS.particles.number.value = Math.max(30, window.pJSDom[0].pJS.particles.number.value * 0.7);
        }
        
        // 降低几何背景透明度
        const shapes = document.querySelectorAll('.geometric-shape');
        shapes.forEach(shape => {
            shape.style.opacity = '0.03';
        });
        
        // 减少拖尾频率
        this.trailFrequency = 80; // 增加节流时间
    }

    // ===== 身份验证相关方法 =====
    
    checkAuthentication() {
        const authToken = localStorage.getItem('ctf-auth-token');
        const authTime = localStorage.getItem('ctf-auth-time');
        
        // 检查是否有有效的认证令牌（24小时有效）
        if (authToken && authTime) {
            const currentTime = Date.now();
            const lastAuthTime = parseInt(authTime);
            const timeDiff = currentTime - lastAuthTime;
            const hoursInMs = 24 * 60 * 60 * 1000; // 24小时
            
            if (timeDiff < hoursInMs && this.verifyAuthToken(authToken)) {
                this.isAuthenticated = true;
                return;
            }
        }
        
        // 需要重新认证
        this.showAuthModal();
    }
    
    verifyAuthToken(token) {
        // 简单的验证，实际上应该使用更安全的方法
        const correctHash = this.simpleHash('soringetit' + 'ctf-secret-salt');
        return token === correctHash;
    }
    
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return hash.toString(36);
    }
    
    showAuthModal() {
        document.getElementById('auth-modal').classList.remove('hidden');
        document.getElementById('auth-password').focus();
    }
    
    authenticateUser() {
        const password = document.getElementById('auth-password').value;
        const correctPassword = 'soringetit';
        
        if (password === correctPassword) {
            this.isAuthenticated = true;
            const authToken = this.simpleHash(password + 'ctf-secret-salt');
            localStorage.setItem('ctf-auth-token', authToken);
            localStorage.setItem('ctf-auth-time', Date.now().toString());
            
            document.getElementById('auth-modal').classList.add('hidden');
            document.getElementById('auth-error').style.display = 'none';
            document.getElementById('auth-password').value = '';
            
            this.showEncouragement('🔓 验证成功，欢迎使用！');
        } else {
            document.getElementById('auth-error').style.display = 'flex';
            document.getElementById('auth-password').value = '';
            document.getElementById('auth-password').style.borderColor = 'var(--error-color)';
            
            setTimeout(() => {
                document.getElementById('auth-password').style.borderColor = '';
            }, 2000);
        }
    }

    requireAuth(callback) {
        if (this.isAuthenticated) {
            callback();
        } else {
            this.showAuthModal();
        }
    }

    // ===== 平台管理相关方法 =====
    
    getDefaultCategories() {
        return this.topics.map(topic => ({
            id: topic.name,
            name: topic.name,
            icon: topic.icon,
            achievement: `${topic.name}大师！`
        }));
    }
    
    getDefaultProblems() {
        const problems = {};
        this.topics.forEach(topic => {
            const problemNumbers = this.rangeToProblems(topic.range);
            problemNumbers.forEach(num => {
                problems[`web${num}`] = {
                    id: `web${num}`,
                    name: `web${num}`,
                    category: topic.name,
                    description: '',
                    completed: false,
                    isWrong: false
                };
            });
        });
        return problems;
    }
    
    showPlatformManager() {
        this.requireAuth(() => {
            document.getElementById('platform-modal').classList.remove('hidden');
            this.renderPlatformList();
        });
    }
    
    renderPlatformList() {
        const container = document.getElementById('platform-list');
        container.innerHTML = '';
        
        Object.entries(this.platforms).forEach(([platformId, platform]) => {
            const problemCount = Object.keys(platform.problems).length;
            const completedCount = platform.completedProblems ? platform.completedProblems.length : 0;
            
            const platformItem = document.createElement('div');
            platformItem.className = `platform-item ${platformId === this.currentPlatform ? 'active' : ''}`;
            platformItem.innerHTML = `
                <div class="platform-name">${platform.name}</div>
                <div class="platform-count">${completedCount}/${problemCount}</div>
            `;
            
            platformItem.addEventListener('click', () => {
                this.selectPlatform(platformId);
            });
            
            container.appendChild(platformItem);
        });
    }
    
    selectPlatform(platformId) {
        this.currentPlatform = platformId;
        this.renderPlatformList();
        this.renderPlatformContent();
        
        // 切换平台时更新主界面
        this.loadPlatformData();
        this.renderProblems();
        this.updateStats();
    }
    
    loadPlatformData() {
        const platform = this.platforms[this.currentPlatform];
        if (platform) {
            // 如果是ctfshow平台，使用原有的数据结构
            if (this.currentPlatform === 'ctfshow') {
                // 保持原有逻辑
                return;
            }
            
            // 对于其他平台，切换数据
            this.completedProblems = platform.completedProblems || [];
            this.wrongProblems = platform.wrongProblems || [];
            this.achievements = platform.achievements || [];
        }
    }
    
    renderPlatformContent() {
        const platform = this.platforms[this.currentPlatform];
        if (!platform) return;
        
        document.getElementById('current-platform-name').textContent = platform.name;
        document.getElementById('edit-platform').style.display = 'block';
        
        const contentArea = document.getElementById('platform-content-area');
        contentArea.innerHTML = '';
        
        // 渲染分类
        const categoriesHeader = document.createElement('div');
        categoriesHeader.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h5>题目分类</h5>
                <button class="action-btn small primary" onclick="ctfManager.showAddCategoryModal()">
                    <i class="bx bx-plus"></i>新增分类
                </button>
            </div>
        `;
        contentArea.appendChild(categoriesHeader);
        
        const categoryList = document.createElement('div');
        categoryList.className = 'category-list';
        
        platform.categories.forEach(category => {
            const categoryProblems = Object.values(platform.problems).filter(p => p.category === category.name);
            const completedCount = categoryProblems.filter(p => p.completed).length;
            
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.innerHTML = `
                <div class="category-header">
                    <div class="category-name">${category.name}</div>
                    <div class="category-progress">${completedCount}/${categoryProblems.length}</div>
                </div>
                <div class="category-actions">
                    <button class="action-btn small secondary" onclick="ctfManager.showAddProblemModal('${category.name}')">
                        <i class="bx bx-plus"></i>添加题目
                    </button>
                </div>
            `;
            
            categoryCard.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    this.showCategoryProblems(category.name);
                }
            });
            
            categoryList.appendChild(categoryCard);
        });
        
        contentArea.appendChild(categoryList);
    }

    // ===== 解题报告相关方法 =====
    
    initializeMonacoEditor() {
        if (typeof require !== 'undefined') {
            require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs' }});
            require(['vs/editor/editor.main'], () => {
                // Monaco编辑器已加载
            });
        }
    }
    
    showReportModal(problemId) {
        document.getElementById('report-modal').classList.remove('hidden');
        this.currentReportProblem = problemId;
        
        // 加载已有报告
        const existingReport = this.reports[problemId];
        if (existingReport) {
            document.getElementById('report-content').value = existingReport.content;
        } else {
            document.getElementById('report-content').value = '';
        }
    }
    
    showCodeEditor() {
        document.getElementById('code-modal').classList.remove('hidden');
        
        // 初始化Monaco编辑器
        if (typeof require !== 'undefined') {
            require(['vs/editor/editor.main'], () => {
                if (this.monacoEditor) {
                    this.monacoEditor.dispose();
                }
                
                this.monacoEditor = monaco.editor.create(document.getElementById('monaco-editor'), {
                    value: '// 在这里输入代码\n',
                    language: 'javascript',
                    theme: this.isDarkMode ? 'vs-dark' : 'vs-light',
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    automaticLayout: true
                });
            });
        }
    }
    
    insertCodeBlock() {
        if (this.monacoEditor) {
            const code = this.monacoEditor.getValue();
            const language = document.getElementById('code-language').value;
            const codeBlock = `\`\`\`${language}\n${code}\n\`\`\`\n\n`;
            
            const textarea = document.getElementById('report-content');
            const cursorPos = textarea.selectionStart;
            const textBefore = textarea.value.substring(0, cursorPos);
            const textAfter = textarea.value.substring(cursorPos);
            
            textarea.value = textBefore + codeBlock + textAfter;
            textarea.focus();
            textarea.setSelectionRange(cursorPos + codeBlock.length, cursorPos + codeBlock.length);
            
            this.closeCodeModal();
        }
    }
    
    previewReport() {
        const content = document.getElementById('report-content').value;
        const preview = document.getElementById('report-preview');
        
        if (typeof marked !== 'undefined') {
            preview.innerHTML = marked.parse(content);
        } else {
            // 简单的Markdown渲染
            preview.innerHTML = this.simpleMarkdownRender(content);
        }
        
        // 切换显示
        const editorContent = document.querySelector('.editor-content');
        if (preview.style.display === 'none') {
            preview.style.display = 'block';
            editorContent.style.display = 'none';
            document.getElementById('preview-report').innerHTML = '<i class="bx bx-edit"></i>编辑';
        } else {
            preview.style.display = 'none';
            editorContent.style.display = 'flex';
            document.getElementById('preview-report').innerHTML = '<i class="bx bx-show"></i>预览';
        }
    }
    
    simpleMarkdownRender(text) {
        return text
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }
    
    saveReport() {
        const content = document.getElementById('report-content').value;
        if (content.trim()) {
            this.reports[this.currentReportProblem] = {
                content: content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem('ctf-reports', JSON.stringify(this.reports));
            this.showEncouragement('📝 解题报告已保存！');
            this.closeReportModal();
        }
    }

    // ===== 模态框控制方法 =====
    
    closeReportModal() {
        document.getElementById('report-modal').classList.add('hidden');
        document.getElementById('report-preview').style.display = 'none';
        document.querySelector('.editor-content').style.display = 'flex';
    }
    
    closeCodeModal() {
        document.getElementById('code-modal').classList.add('hidden');
        if (this.monacoEditor) {
            this.monacoEditor.dispose();
            this.monacoEditor = null;
        }
    }
    
    closePlatformModal() {
        document.getElementById('platform-modal').classList.add('hidden');
    }

    // ===== 编辑器辅助方法 =====
    
    setFontSize(size) {
        const textarea = document.getElementById('report-content');
        const buttons = document.querySelectorAll('.toolbar-btn[id^="font-"]');
        
        buttons.forEach(btn => btn.classList.remove('active'));
        document.getElementById(`font-${size}`).classList.add('active');
        
        switch(size) {
            case 'small':
                textarea.style.fontSize = '12px';
                break;
            case 'medium':
                textarea.style.fontSize = '14px';
                break;
            case 'large':
                textarea.style.fontSize = '16px';
                break;
        }
    }
    
    insertMarkdown(before, after) {
        const textarea = document.getElementById('report-content');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        const replacement = before + selectedText + after;
        const textBefore = textarea.value.substring(0, start);
        const textAfter = textarea.value.substring(end);
        
        textarea.value = textBefore + replacement + textAfter;
        textarea.focus();
        
        if (selectedText) {
            textarea.setSelectionRange(start, start + replacement.length);
        } else {
            textarea.setSelectionRange(start + before.length, start + before.length);
        }
    }

    // ===== 类别和题目管理功能 =====
    
    showAddCategoryModal() {
        const categoryName = prompt('请输入新分类名称：');
        if (categoryName && categoryName.trim()) {
            this.addCategory(categoryName.trim());
        }
    }
    
    addCategory(categoryName) {
        const platform = this.platforms[this.currentPlatform];
        if (platform) {
            // 检查是否已存在
            const existingCategory = platform.categories.find(c => c.name === categoryName);
            if (existingCategory) {
                this.showEncouragement('该分类已存在！', 'error');
                return;
            }
            
            // 询问分类称号
            const achievement = prompt('请输入该分类的称号（完成所有题目后获得）：', `${categoryName}大师！`);
            
            platform.categories.push({
                id: categoryName,
                name: categoryName,
                icon: 'bx-folder',
                achievement: achievement || `${categoryName}大师！`
            });
            
            this.saveData();
            this.renderPlatformContent();
            this.showEncouragement(`分类 "${categoryName}" 已添加！`);
        }
    }
    
    showAddProblemModal(categoryName) {
        // 创建添加题目的对话框
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content glass-effect">
                <div class="modal-header">
                    <h3>添加题目</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <i class='bx bx-x'></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">题目名称</label>
                        <input type="text" class="form-input" id="problem-name" placeholder="例：web001" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">分类</label>
                        <input type="text" class="form-input" id="problem-category" value="${categoryName}" readonly />
                    </div>
                    <div class="form-group">
                        <label class="form-label">题目描述（可选）</label>
                        <textarea class="form-input form-textarea" id="problem-description" placeholder="请输入题目描述..."></textarea>
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                        <button class="action-btn secondary" onclick="this.closest('.modal').remove()">
                            <i class='bx bx-x'></i>取消
                        </button>
                        <button class="action-btn primary" onclick="ctfManager.addProblem()">
                            <i class='bx bx-plus'></i>添加题目
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.getElementById('problem-name').focus();
    }
    
    addProblem() {
        const name = document.getElementById('problem-name').value.trim();
        const category = document.getElementById('problem-category').value;
        const description = document.getElementById('problem-description').value.trim();
        
        if (!name) {
            this.showEncouragement('请输入题目名称！', 'error');
            return;
        }
        
        const platform = this.platforms[this.currentPlatform];
        if (platform) {
            // 检查是否已存在
            if (platform.problems[name]) {
                this.showEncouragement('该题目已存在！', 'error');
                return;
            }
            
            platform.problems[name] = {
                id: name,
                name: name,
                category: category,
                description: description,
                completed: false,
                isWrong: false
            };
            
            this.saveData();
            this.renderPlatformContent();
            this.showEncouragement(`题目 "${name}" 已添加到 "${category}" 分类！`);
            
            // 关闭模态框
            document.querySelector('.modal:last-child').remove();
        }
    }
    
    showCategoryProblems(categoryName) {
        const platform = this.platforms[this.currentPlatform];
        if (!platform) return;
        
        const categoryProblems = Object.values(platform.problems).filter(p => p.category === categoryName);
        
        // 创建题目列表模态框
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content glass-effect large-modal">
                <div class="modal-header">
                    <h3>${categoryName} - 题目列表</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <i class='bx bx-x'></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="problem-list">
                        ${categoryProblems.map(problem => `
                            <div class="problem-item ${problem.completed ? 'completed' : ''} ${problem.isWrong ? 'wrong' : ''}">
                                <div class="problem-info">
                                    <div class="problem-name">${problem.name}</div>
                                    ${problem.description ? `<div class="problem-description">${problem.description}</div>` : ''}
                                </div>
                                <div class="problem-actions">
                                    <button class="action-btn small secondary" onclick="ctfManager.editProblem('${problem.id}')" title="编辑题目">
                                        <i class='bx bx-edit'></i>
                                    </button>
                                    <button class="action-btn small ${problem.completed ? 'secondary' : 'primary'}" 
                                            onclick="ctfManager.toggleProblemStatus('${problem.id}')" title="${problem.completed ? '取消完成' : '标记完成'}">
                                        <i class='bx ${problem.completed ? 'bx-undo' : 'bx-check'}'></i>
                                    </button>
                                    ${this.reports[problem.id] ? `
                                        <button class="action-btn small" style="background: var(--accent-color); color: white;" 
                                                onclick="ctfManager.showReportModal('${problem.id}')" title="查看解题报告">
                                            <i class='bx bx-file-text'></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    ${categoryProblems.length === 0 ? '<div class="empty-state">该分类下暂无题目</div>' : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    toggleProblemStatus(problemId) {
        const platform = this.platforms[this.currentPlatform];
        if (platform && platform.problems[problemId]) {
            const problem = platform.problems[problemId];
            problem.completed = !problem.completed;
            
            // 更新平台的完成题目列表
            if (problem.completed) {
                if (!platform.completedProblems.includes(problemId)) {
                    platform.completedProblems.push(problemId);
                }
                this.showEncouragement(`题目 "${problemId}" 已标记为完成！`);
                
                // 询问是否添加解题报告
                setTimeout(() => {
                    if (confirm('是否要为这道题添加解题报告？')) {
                        this.showReportModal(problemId);
                    }
                }, 500);
            } else {
                const index = platform.completedProblems.indexOf(problemId);
                if (index > -1) {
                    platform.completedProblems.splice(index, 1);
                }
                this.showEncouragement(`题目 "${problemId}" 已取消完成状态！`);
            }
            
            this.saveData();
            this.renderPlatformContent();
            
            // 刷新题目列表显示
            const modal = document.querySelector('.modal:last-child');
            if (modal) {
                modal.remove();
                this.showCategoryProblems(problem.category);
            }
        }
    }

    // ===== 平台创建和管理 =====
    
    showAddPlatformModal() {
        const platformName = prompt('请输入新平台名称：');
        if (platformName && platformName.trim()) {
            this.addPlatform(platformName.trim());
        }
    }
    
    addPlatform(platformName) {
        const platformId = platformName.toLowerCase().replace(/\s+/g, '-');
        
        // 检查是否已存在
        if (this.platforms[platformId]) {
            this.showEncouragement('该平台已存在！');
            return;
        }
        
        this.platforms[platformId] = {
            name: platformName,
            categories: [],
            problems: {},
            achievements: [],
            completedProblems: [],
            wrongProblems: []
        };
        
        this.saveData();
        this.renderPlatformList();
        this.showEncouragement(`平台 "${platformName}" 已创建！`);
        
        // 自动选择新平台
        this.selectPlatform(platformId);
    }

    // ===== 平台快速切换功能 =====
    
    togglePlatformQuickSwitch() {
        const quickSwitch = document.getElementById('platform-quick-switch');
        if (quickSwitch.classList.contains('hidden')) {
            quickSwitch.classList.remove('hidden');
            this.renderPlatformQuickList();
        } else {
            quickSwitch.classList.add('hidden');
        }
    }
    
    renderPlatformQuickList() {
        const container = document.getElementById('platform-quick-list');
        container.innerHTML = '';
        
        Object.entries(this.platforms).forEach(([platformId, platform]) => {
            const problemCount = Object.keys(platform.problems).length;
            const completedCount = platform.completedProblems ? platform.completedProblems.length : 0;
            
            const platformItem = document.createElement('div');
            platformItem.className = `platform-quick-item ${platformId === this.currentPlatform ? 'active' : ''}`;
            platformItem.innerHTML = `
                <div class="platform-quick-info">
                    <div class="platform-quick-name">${platform.name}</div>
                    <div class="platform-quick-progress">${completedCount}/${problemCount}</div>
                </div>
                <div class="platform-quick-actions">
                    <button class="platform-edit-btn" onclick="ctfManager.editPlatform('${platformId}')" title="编辑平台">
                        <i class='bx bx-edit'></i>
                    </button>
                    ${platformId !== 'ctfshow' ? `
                        <button class="platform-delete-btn" onclick="ctfManager.deletePlatform('${platformId}')" title="删除平台">
                            <i class='bx bx-trash'></i>
                        </button>
                    ` : ''}
                </div>
            `;
            
            // 点击切换平台（但不包括按钮区域）
            platformItem.addEventListener('click', (e) => {
                if (!e.target.closest('.platform-quick-actions')) {
                    this.switchToPlatform(platformId);
                }
            });
            
            container.appendChild(platformItem);
        });
    }
    
    switchToPlatform(platformId) {
        if (platformId !== this.currentPlatform) {
            this.selectPlatform(platformId);
            this.updateSidebarPlatformInfo();
            this.showEncouragement(`已切换到 ${this.platforms[platformId].name} 平台！`);
        }
        // 关闭快速切换面板
        document.getElementById('platform-quick-switch').classList.add('hidden');
    }
    
    updateSidebarPlatformInfo() {
        const platform = this.platforms[this.currentPlatform];
        if (platform) {
            const problemCount = Object.keys(platform.problems).length;
            const completedCount = platform.completedProblems ? platform.completedProblems.length : 0;
            
            document.getElementById('sidebar-platform-name').textContent = platform.name;
            document.getElementById('sidebar-platform-progress').textContent = `${completedCount}/${problemCount}`;
        }
    }

    // ===== 编辑功能实现 =====
    
    editPlatform(platformId) {
        const platform = this.platforms[platformId];
        if (!platform) return;
        
        // 创建编辑平台的模态框
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content glass-effect edit-modal">
                <div class="modal-header">
                    <h3>编辑平台</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <i class='bx bx-x'></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="edit-form">
                        <div class="form-group">
                            <label class="form-label">平台名称</label>
                            <input type="text" class="form-input" id="edit-platform-name" value="${platform.name}" />
                        </div>
                        <div class="form-actions">
                            <button class="action-btn secondary" onclick="this.closest('.modal').remove()">
                                <i class='bx bx-x'></i>取消
                            </button>
                            <button class="action-btn primary" onclick="ctfManager.savePlatformEdit('${platformId}')">
                                <i class='bx bx-save'></i>保存
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.getElementById('edit-platform-name').focus();
    }
    
    savePlatformEdit(platformId) {
        const newName = document.getElementById('edit-platform-name').value.trim();
        
        if (!newName) {
            this.showEncouragement('平台名称不能为空！');
            return;
        }
        
        this.platforms[platformId].name = newName;
        this.saveData();
        this.updateSidebarPlatformInfo();
        this.renderPlatformQuickList();
        this.showEncouragement('平台信息已更新！');
        
        // 关闭模态框
        document.querySelector('.modal:last-child').remove();
    }
    
    deletePlatform(platformId) {
        if (platformId === 'ctfshow') {
            this.showEncouragement('不能删除CTFShow平台！');
            return;
        }
        
        const platform = this.platforms[platformId];
        if (confirm(`确定要删除平台 "${platform.name}" 吗？这将删除该平台的所有数据，此操作不可撤销！`)) {
            delete this.platforms[platformId];
            
            // 如果删除的是当前平台，切换到ctfshow
            if (this.currentPlatform === platformId) {
                this.switchToPlatform('ctfshow');
            }
            
            this.saveData();
            this.renderPlatformQuickList();
            this.showEncouragement(`平台 "${platform.name}" 已删除！`);
        }
    }
    
    editProblem(problemId) {
        const platform = this.platforms[this.currentPlatform];
        const problem = platform.problems[problemId];
        if (!problem) return;
        
        // 创建编辑题目的模态框
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content glass-effect edit-modal">
                <div class="modal-header">
                    <h3>编辑题目</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <i class='bx bx-x'></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="edit-form">
                        <div class="form-group">
                            <label class="form-label">题目名称</label>
                            <input type="text" class="form-input" id="edit-problem-name" value="${problem.name}" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">分类</label>
                            <select class="form-input" id="edit-problem-category">
                                ${platform.categories.map(cat => 
                                    `<option value="${cat.name}" ${cat.name === problem.category ? 'selected' : ''}>${cat.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">题目描述</label>
                            <textarea class="form-input form-textarea" id="edit-problem-description">${problem.description || ''}</textarea>
                        </div>
                        <div class="form-actions">
                            <button class="action-btn secondary" onclick="this.closest('.modal').remove()">
                                <i class='bx bx-x'></i>取消
                            </button>
                            <button class="action-btn primary" onclick="ctfManager.saveProblemEdit('${problemId}')">
                                <i class='bx bx-save'></i>保存
                            </button>
                            <button class="action-btn" style="background: var(--error-color); color: white;" onclick="ctfManager.deleteProblem('${problemId}')">
                                <i class='bx bx-trash'></i>删除
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.getElementById('edit-problem-name').focus();
    }
    
    saveProblemEdit(problemId) {
        const platform = this.platforms[this.currentPlatform];
        const problem = platform.problems[problemId];
        
        const newName = document.getElementById('edit-problem-name').value.trim();
        const newCategory = document.getElementById('edit-problem-category').value;
        const newDescription = document.getElementById('edit-problem-description').value.trim();
        
        if (!newName) {
            this.showEncouragement('题目名称不能为空！');
            return;
        }
        
        // 如果名称改变了，需要更新键值
        if (newName !== problemId) {
            // 检查新名称是否已存在
            if (platform.problems[newName]) {
                this.showEncouragement('该题目名称已存在！');
                return;
            }
            
            // 删除旧键，添加新键
            delete platform.problems[problemId];
            platform.problems[newName] = problem;
            problem.id = newName;
            problem.name = newName;
            
            // 更新完成列表中的引用
            const completedIndex = platform.completedProblems.indexOf(problemId);
            if (completedIndex > -1) {
                platform.completedProblems[completedIndex] = newName;
            }
            
            // 更新错题列表中的引用
            const wrongIndex = platform.wrongProblems.indexOf(problemId);
            if (wrongIndex > -1) {
                platform.wrongProblems[wrongIndex] = newName;
            }
        } else {
            problem.name = newName;
        }
        
        problem.category = newCategory;
        problem.description = newDescription;
        
        this.saveData();
        this.renderPlatformContent();
        this.showEncouragement('题目信息已更新！');
        
        // 关闭模态框
        document.querySelector('.modal:last-child').remove();
    }
    
    deleteProblem(problemId) {
        const platform = this.platforms[this.currentPlatform];
        const problem = platform.problems[problemId];
        
        if (confirm(`确定要删除题目 "${problem.name}" 吗？`)) {
            delete platform.problems[problemId];
            
            // 从完成列表中移除
            const completedIndex = platform.completedProblems.indexOf(problemId);
            if (completedIndex > -1) {
                platform.completedProblems.splice(completedIndex, 1);
            }
            
            // 从错题列表中移除
            const wrongIndex = platform.wrongProblems.indexOf(problemId);
            if (wrongIndex > -1) {
                platform.wrongProblems.splice(wrongIndex, 1);
            }
            
            this.saveData();
            this.renderPlatformContent();
            this.showEncouragement(`题目 "${problem.name}" 已删除！`);
            
            // 关闭所有模态框
            document.querySelectorAll('.modal').forEach(modal => modal.remove());
        }
    }


}

// 初始化应用
let ctfManager;
document.addEventListener('DOMContentLoaded', () => {
    ctfManager = new CTFManager();
});
