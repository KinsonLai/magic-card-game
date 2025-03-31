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