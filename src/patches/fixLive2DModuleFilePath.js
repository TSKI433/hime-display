/**
 * Live2D 文件路径修复补丁
 * 拦截 fetch, XHR, Image 所有请求
 */

(function installLive2DPathFix() {
    if (window.__LIVE2D_PATH_FIX_INSTALLED__) {
        return;
    }
    
    const DEBUG = false;
    
    // 辅助函数：修复路径
    function fixFilePath(url) {
        if (typeof url === 'string' && url.startsWith('file://')) {
            if (/^file:\/\/[a-z]\//.test(url)) {
                const fixedUrl = url.replace(
                    /^file:\/\/([a-z])\//,
                    (_, drive) => `file://${drive.toUpperCase()}:/`
                );
                if (DEBUG) console.log('🔧 [修复]', url, '->', fixedUrl);
                return fixedUrl;
            }
        }
        return url;
    }
    
    // 1. 拦截 fetch
    const originalFetch = window.fetch;
    window.fetch = function(resource, options) {
        return originalFetch.call(this, fixFilePath(resource), options);
    };
    
    // 2. 拦截 XHR
    const XHR = window.XMLHttpRequest;
    const originalOpen = XHR.prototype.open;
    XHR.prototype.open = function(method, url, ...args) {
        return originalOpen.call(this, method, fixFilePath(url), ...args);
    };
    
    // 3. 拦截 Image - 修复版本
const OriginalImage = window.Image;
function PatchedImage(width, height) {
    const img = new OriginalImage(width, height);
    
    // 保存原始的 src 描述符
    const originalSrcDescriptor = Object.getOwnPropertyDescriptor(OriginalImage.prototype, 'src');
    
    // 重写 src 属性
    Object.defineProperty(img, 'src', {
        get() {
            return originalSrcDescriptor.get.call(this);
        },
        set(value) {
            const fixedValue = fixFilePath(value);
            // 使用原始的 setter
            originalSrcDescriptor.set.call(this, fixedValue);
            if (DEBUG && value !== fixedValue) {
                console.log('🖼️ [Image] 修复:', value, '->', fixedValue);
            }
        },
        configurable: true
    });
    
    return img;
}

// 继承原型链
PatchedImage.prototype = OriginalImage.prototype;
window.Image = PatchedImage;
    
    window.__LIVE2D_PATH_FIX_INSTALLED__ = true;
    
    if (DEBUG) {
        console.log('✅ [Live2D路径补丁] 已安装（支持 fetch + XHR + Image）');
    }
})();