/**
 * Created by wanli.yu
 */
'use strict'
import './index.less'
import { ajax, debounce, getUrlParam } from 'commons/js/tools_daohe.js'
import { isSupportSticky } from 'commons/js/tools.js'
import popup from '@beibei/popup'
import Promise from 'es6-promise'
import Xtemplate from 'xtemplate/lib/runtime'
import Load from 'components/load-data/index.js'
import itemTpl from './item.xtpl'
import { set } from 'biscuit.js'

Promise.polyfill()
let loading = popup.loading({
  mask: false
})
const itemRenderer = new Xtemplate(itemTpl)
class PAGE {
  constructor() {
    this.$top = $('.top')
    this.$staticTop = $('#top')
    this.$body = $('body')
    this.$win = $(window)
    this.$doc = $(document)

    this.$list_info = $('.list_info')
    this.$back = $('.back')
    this.$search = $('#search')
    this.$door = $('#door')

    this.page = 1
    this.has_more = true
    this.loading = false
    this.listData = []

    this.key = ''
    this.flag = true

    this.sticky()
    this.bindEvents()
    this.initPage()
    $('#top')
      .find('.name')
      .html(decodeURIComponent(getUrlParam('title')))
  }

  getData(key) {
    return ajax({
      methods: 'GET',
      url: 'app/store/list',
      query: {
        page: this.page,
        key: key
      }
    })
  }

  initPage() {
    this.getData(this.key)
      .then(res => {
        this.listData = res.list
        loading.remove()
        if (res.list.length === 0) {
          $('.list_content').addClass('no-data')
          this.$list_info.html(itemRenderer.render(res.list))
          return
        }
        this.total_page = res.pagination.total_page
        if (res.pagination.current_page < this.total_page) {
          Load.loadData(true)
        } else {
          Load.loadData(false)
          Load.noData(true)
          this.has_more = false
        }
        this.page++
        this.$list_info.html(itemRenderer.render(res.list))
      })
      .catch(err => {
        popup.note(err.message || err.msg || JSON.stringify(err))
      })
  }

  bindEvents() {
    let _this = this
    this.scrollListener()
    this.$back.on('click', function() {
      window.history.back()
    })
    this.$search.on('click', function() {
      _this.flag && _this.initSearchData()
    })
    this.$list_info.on('click', '.item', function() {
      let index = $(this).index()
      set('daohe_door_info', JSON.stringify(_this.listData[index]))
      window.location.href = './door.html?title=' + getUrlParam('title')
    })
  }

  initSearchData() {
    if (this.key === this.$door.val()) return
    this.flag = false
    this.page = 1
    this.has_more = true
    this.loading = false
    this.key = this.$door.val()
    Load.loadData(false)
    this.getData(this.key).then(res => {
      this.total_page = res.pagination.total_page
      if (res.pagination.current_page < this.total_page) {
        Load.loadData(true)
      } else {
        Load.loadData(false)
        Load.noData(true)
        this.has_more = false
      }
      this.page++
      this.$list_info.html(itemRenderer.render(res.list))
    })
  }

  scrollListener() {
    let _this = this
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
    })
    this.$win.on(
      'scroll',
      debounce(() => {
        if (!_this.has_more) {
          return
        }
        if (
          !this.loading &&
          this.$win.scrollTop() + this.$win.height() > this.$doc.height() - 200
        ) {
          this.loading = true
          this.getData(this.key)
            .then(res => {
              this.listData = this.listData.concat(res.list)
              this.total_page = res.pagination.total_page
              if (res.pagination.current_page >= this.total_page) {
                Load.loadData(false)
                Load.noData(true)
                this.has_more = false
              }
              this.page++
              this.$list_info.append(itemRenderer.render(res.list))
              this.loading = false
            })
            .catch(err => {
              popup.note(err.msg || err.message || JSON.stringify(err))
            })
        }
      }, 100)
    )
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
