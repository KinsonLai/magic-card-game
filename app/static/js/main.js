/**
 * 魔法卡片對戰遊戲主要JavaScript文件
 */

// 頁面載入完成後執行
document.addEventListener('DOMContentLoaded', function() {
    // 全局變量
    let socket = null;
    
    // 初始化函數
    function init() {
        // 初始化工具提示
        initTooltips();
        
        // 初始化動畫效果
        initAnimations();
        
        // 初始化深色模式
        initDarkMode();
        
        // 如果在遊戲頁面，初始化Socket連接
        if (document.getElementById('game-area') || document.getElementById('waiting-area')) {
            // Socket已經在room.html中初始化了
        }
    }
    
    // 初始化工具提示
    function initTooltips() {
        // 檢查是否支持Bootstrap工具提示
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    }
    
    // 初始化動畫效果
    function initAnimations() {
        // 添加淡入效果到主要元素
        const fadeElements = document.querySelectorAll('.card, .jumbotron, .btn-lg');
        fadeElements.forEach(function(element) {
            element.classList.add('fade-in');
        });
    }
    
    // 初始化深色模式
    function initDarkMode() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        const darkModeIcon = document.getElementById('darkModeIcon');
        
        if (!darkModeToggle || !darkModeIcon) return;
        
        // 獲取當前主題並更新圖標
        const currentTheme = document.documentElement.getAttribute('data-bs-theme');
        updateDarkModeIcon(currentTheme);
        
        // 切換按鈕點擊事件
        darkModeToggle.addEventListener('click', function() {
            // 暫時禁用過渡效果
            document.documentElement.classList.add('transition');
            
            const currentTheme = document.documentElement.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-bs-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateDarkModeIcon(newTheme);
            
            // 1毫秒後恢復過渡效果
            setTimeout(function() {
                document.documentElement.classList.remove('transition');
            }, 1);
        });
    }
    
    // 更新深色模式圖標
    function updateDarkModeIcon(theme) {
        const darkModeIcon = document.getElementById('darkModeIcon');
        if (!darkModeIcon) return;
        
        if (theme === 'dark') {
            darkModeIcon.classList.remove('bi-moon-fill');
            darkModeIcon.classList.add('bi-sun-fill');
        } else {
            darkModeIcon.classList.remove('bi-sun-fill');
            darkModeIcon.classList.add('bi-moon-fill');
        }
    }
    
    // 格式化數字（添加千位分隔符）
    function formatNumber(num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }
    
    // 公開方法
    window.GameUtils = {
        formatNumber: formatNumber
    };
    
    // 執行初始化
    init();
}); 