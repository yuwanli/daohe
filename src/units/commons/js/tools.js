import Promise from 'es6-promise'

Promise.polyfill()

export const throttle = (fn, delay, mustRunDelay) => {
    var timer = null
    var starttime = +new Date()

    return function () {
        var context = this,
            args = arguments,
            curTime = +new Date()
        clearTimeout(timer)
        if (!starttime) {
            starttime = curTime
        }
        if (curTime - starttime >= mustRunDelay) {
            fn.apply(context, args)
            starttime = curTime
        } else {
            timer = setTimeout(function () {
                fn.apply(context, args)
            }, delay)
        }
    }
}
// 去抖函数
export const debounce = (fn, delay) => {
    var timer = null
    return function () {
        var context = this,
            args = arguments
        clearTimeout(timer)
        timer = setTimeout(function () {
            fn.apply(context, args)
        }, delay)
    }
}
// 获取url参数
export const getUrlParam = name => {
    const search = window.location.search
    const matched = search.slice(1).match(new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i'))
    return search.length ? (matched && matched[2]) : null
}

export const ajax = ({
    method = 'GET',
    query = {},
    form = {},
    base = '',
    url
}) => {
    return new Promise((resolve, reject) => {
        let urlStr = base + url
        if (query){
            for (let key in query){
                urlStr += (key + '=' + query[key] + '&')
            }
        }
        $.ajax({
            url: urlStr,
            type: method,
            data: form,
            dataType: 'json',
            success(res) {
                if (res.success){
                    resolve(res)
                } else {
                    reject(res)
                }
            },
            error() {
                reject({message: '发送请求失败~'})
            }
        })
    })
}
export const isSupportSticky = (function () {
    let prefixTestList = ['', '-webkit-'];
    let stickyText = '';
    let len = prefixTestList.length;
    for (let i = 0; i < len; i++) {
        stickyText += 'position:' + prefixTestList[i] + 'sticky;';
    }
    // 创建一个dom来检查
    let div = document.createElement('div');
    let body = document.body;
    div.style.cssText = 'display:none;' + stickyText;
    body.appendChild(div);
    let isSupport = /sticky/i.test(window.getComputedStyle(div).position);
    body.removeChild(div);
    div = null;
    return isSupport;
})();

export default {
    getUrlParam,
    debounce,
    throttle,
    isSupportSticky,
    ajax
}