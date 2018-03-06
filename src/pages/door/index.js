/**
 * Created by wanli.yu
 */
'use strict'
import './index.less'
import Promise from 'es6-promise'
import popup from '@beibei/popup'
import Xtemplate from 'xtemplate/lib/runtime'
import infoTpl from './info.xtpl'
import { get } from 'biscuit.js'

const infoRenderer = new Xtemplate(infoTpl)

import { ajax, getUrlParam } from 'commons/js/tools_daohe.js'
import { isSupportSticky } from 'commons/js/tools.js'

let loading = popup.loading({
  mask: false
})
Promise.polyfill()
class PAGE {
  constructor() {
    this.$top = $('.top')
    this.$staticTop = $('#top')
    this.$body = $('body')
    this.$win = $(window)

    this.$info = $('.door_info')
    this.$doorList = $('#doorList')
    this.$confirm = $('.J_confirm')
    this.$doorBack = $('#doorBack')
    this.$editDoor = $('#editDoor')

    this.sticky()
    this.initPage()
    this.bindEvents()
  }

  validatePercent(n) {
    return new Promise((resolve, reject) => {
      let arrs = this.$partner.find('.cloum_two')
      let total = 0
      arrs.forEach(val => {
        total += parseInt($(val).attr('data-percent') || 0)
      })
      if (total + parseInt(n) <= 100) {
        resolve(total)
      } else {
        reject({ msg: '股东占比设置太大，请认真核对' })
      }
    })
  }

  bindEvents() {
    let _this = this
    this.scrollListener()
    this.$doorBack.on('click', function() {
      window.history.go(-1)
    })
    this.$editDoor.on('click', function() {
      window.location.href = './form_door.html?type=edit'
    })
  }

  initPage() {
    let res = JSON.parse(get('daohe_door_info'))
    this.title =
      decodeURIComponent(getUrlParam('title')) + res.city_label + '店'
    $('#top')
      .find('.name')
      .html(this.title)
    this.$info.html(infoRenderer.render(res))
    loading.remove()
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
        })
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
    })
  }

  sticky() {
    //防抖动
    if (isSupportSticky) {
      this.$top.addClass('sticky')
    } else {
      let top = this.$top.clone()
      let html = top.attr('id', 'topFixed').addClass('fixed')[0]
      this.$body.append(html)
      this.$top = $('.top')
    }
  }
}

new PAGE()
