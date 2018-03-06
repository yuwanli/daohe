/**
 * Created by wanli.yu
 */
'use strict'
import './index.less'
import Promise from 'es6-promise'

Promise.polyfill()
class Footer {
    constructor() {
        this.$switch = $('.footer .switch')
        this.bindEvents()
    }
    bindEvents() {
        this.$switch.on('click', 'span', function() {
            console.log($(this).index())
        })
    }
}
export default function() {
    return new Footer()
}

// new Footer();
