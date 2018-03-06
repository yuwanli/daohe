/**
 * Created by wanli.yu
 */
'use strict'
import './index.less'
import Xtemplate from 'xtemplate/lib/runtime'
import navTpl from './index.xtpl'
import menuTpl from './menu.xtpl'
import { debounce } from 'commons/js/tools.js'
import Promise from 'es6-promise'

Promise.polyfill()
const navRenderer = new Xtemplate(navTpl)
const menuRenderer = new Xtemplate(menuTpl)
class topNav {
    constructor() {
        let _this = this
        this.$body = $('body')
        this.$body.prepend(navRenderer.render({ pc: _this.judge() }))
        this.$body.append(menuRenderer.render())
        this.$nav = $('#JL_nav')
        this.$menu = $('#JL_menu')
        this.judegeMenu()
        this.bindEvents()
    }
    bindEvents() {
        let _this = this
        // this.$body.on('click', () => {
        //     this.$menu.hasClass('active') && this.$menu.removeClass('active')
        // })
        this.$menu.on('click', '.cover , .close', () => {
            this.$menu.hasClass('active') && this.$menu.removeClass('active')
        })
        this.$nav.on('click', '.open_menu', () => {
            _this.$menu.addClass('active')
        })
        this.$menu.on('click', 'li', function() {
            window.location.href = './list.html?index=' + $(this).index()
        })
        window.onresize = debounce(() => {
            if ((_this.judge() && _this.$nav.hasClass('.JL_nav_pc')) || (!_this.judge() && _this.$nav.hasClass('.JL_nav_h5'))) {
                //是 pc
                return
            } else {
                _this.$nav.remove()
                _this.$body.prepend(navRenderer.render({ pc: _this.judge() }))
                _this.$nav = $('#JL_nav')
                _this.judegeMenu()
            }
        }, 300)
    }
    judegeMenu() {
        if (this.judge()) {
            let left = $('.open_menu')[0].getBoundingClientRect().left - document.documentElement.getBoundingClientRect().width / 2
            this.$menu.css('margin-left', `${left}px`)
        } else {
            this.$menu.css('margin-left', 0)
        }
    }
    judge() {
        return document.documentElement.getBoundingClientRect().width >= 1000
    }
}

export default function() {
    return new topNav()
}
