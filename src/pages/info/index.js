/**
 * Created by wanli.yu
 */
'use strict';
import './index.less'

import {isSupportSticky} from 'commons/js/tools.js'

class PAGE {
    constructor () {
        this.$top = $('.top')
        this.$staticTop = $('#top')
        this.$body = $('body')
        this.$win = $(window)

        this.sticky()
        this.bindEvents()
    }

    bindEvents() {
        this.scrollListener()
    }

    scrollListener() {
        // let Timer = null;
        // let _this = this
        this.$win.on('scroll', () => {
            if (!isSupportSticky) {
                this.$win.on('scroll', () => {
                    if (this.$staticTop[0].getBoundingClientRect().top < 0) {
                        $('.top.fixed').addClass('show')
                    } else {
                        $('.top.fixed').removeClass('show')
                    }
                });
            }
            // if (!_this.more) {
            //     return
            // }
            // if (Timer) {
            //     clearTimeout(Timer);
            // }
            // Timer = setTimeout(() => {
            //     if (!this.loading && this.$win.scrollTop() + this.$win.height() > this.$doc.height() - 200) {
            //         this.loading = true
            //         this.getData()
            //             .then((d) => {
            //                 this.more = d.has_more
            //                 this.page++
            //                 this.render(d)
            //                 this.loading = false
            //             })
            //             .catch((err) => {
            //                 this.someThingWrong(err.err_msg || err.message)
            //             })
            //     }
            // }, 300)
        });
    }

    sticky() {//防抖动
        if (isSupportSticky) {
            this.$top.addClass('sticky')
        } else {
            let top = this.$top.clone();
            let html = top.attr('id', 'topFixed').addClass('fixed')[0];
            this.$body.append(html);
            this.$top = $('.top');
        }
    }
}

new PAGE()