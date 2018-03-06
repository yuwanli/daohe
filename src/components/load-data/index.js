import './index.less'
// 加载更多数据的loading
export const loadData = (flag = true, selector = 'body') => {
    let htmlTpl = `
    <section id="J_load-tips" class="load-tips ${!flag ? 'hidden' : ''}">
        <div class="load-spinner"></div>
    </section>`
    if (flag) {
        $(selector).append(htmlTpl)
    } else {
        $('#J_load-tips').remove()
    }
}
// 没有更多数据的时候
export const noData = (flag = false, selector = 'body') => {
    let htmlTpl = `<div id="J_no-data" class="no-data ${!flag ? 'hidden' : ''}"><span>数据加载完毕~</span></div>`
    if (flag) {
        $(selector).append(htmlTpl)
    } else {
        $('#J_no-data').remove()
    }
}

export default {
    loadData,
    noData
}
