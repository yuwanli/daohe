/**
 * Created by wanli.yu
 */
'use strict'
import './index.less'

import { ajax, debounce, getUrlParam } from 'commons/js/tools_daohe.js'
import popup from '@beibei/popup'
import Promise from 'es6-promise'
import Load from 'components/load-data/index.js'
import { set } from 'biscuit.js'
import Xtemplate from 'xtemplate/lib/runtime'
import itemTpl from './item.xtpl'

Promise.polyfill()
let loading = popup.loading({
  mask: false
})
set('daohe_token', getUrlParam('token') || '')
const itemRenderer = new Xtemplate(itemTpl)
class Page {
  constructor() {
    this.$body = $('body')
    this.$win = $(window)
    this.$doc = $(document)

    this.$top = $('.index_top')
    this.$create = $('#create')
    this.$search = $('#search')
    this.$main = $('.index_main')
    this.$brand = $('#brand')

    this.page = 1
    this.has_more = true
    this.loading = false

    this.key = ''
    this.flag = true

    this.initPage()
    this.bindEvents()
  }

  initPage() {
    this.config()
      .then(res => {
        loading.remove()
        set('daohe_username', encodeURIComponent(res.name))
        set('daohe_role', encodeURIComponent(res.role))
        this.$main.attr('data-role', res.role)
        this.role = parseInt(res.role)
        if (this.role === 2) {
          let str = `<select><option value="">请选择</option>`
          this.getAdminList()
            .then(res => {
              res.list.forEach(val => {
                str += `<option value="${val.id}">${val.name}</option>`
              })
              str += '</select>'
              this.SelectStr = str
            })
            .catch(err => {
              popup.note(err.message || err.msg || JSON.stringify(err))
            })
        }
        if (getUrlParam('aid')) {
          $('.index_top').html(
            `<div class="text">'${decodeURIComponent(
              getUrlParam('title')
            )}'的所有品牌<span>清空</span></div>`
          )
        }
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
          this.htmlChild(res.list)
        })
      })
      .catch(err => {
        loading.remove()
        popup.note(err.message || err.msg || JSON.stringify(err))
      })
  }

  getAdminList() {
    return ajax({
      methods: 'GET',
      url: 'app/admin/list'
    })
  }

  htmlChild(data) {
    data.forEach(val => {
      let stat = parseInt(val.status)
      if (this.role === 2) {
        if (stat === 2 || stat === 1) {
          val.is_btn = true
          val.btn_status = 'appoint'
          val.html = this.SelectStr
        }
      } else if (this.role === 3) {
        if (stat === 1) {
          val.is_btn = true
          val.btn_status = 'receive'
          val.html = '给自己'
        }
      } else {
        val.is_btn = false
      }
    })
    this.$main.html(itemRenderer.render(data))
  }
  appendChild(data) {
    this.$main.append(itemRenderer.render(data))
  }

  appoint(obj) {
    return ajax({
      methods: 'POST',
      url: 'app/admin/appoint',
      form: obj
    })
  }

  receive(id) {
    return ajax({
      methods: 'POST',
      url: 'app/admin/receive',
      form: {
        id: id
      }
    })
  }

  config() {
    return ajax({
      methods: 'GET',
      url: 'app/brand/config'
    })
  }

  getData(title) {
    return ajax({
      methods: 'GET',
      url: 'app/brand/list',
      query: {
        page: this.page,
        title: title || '',
        aid: getUrlParam('aid') || ''
      }
    })
  }

  scrollListener() {
    let _this = this
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
          this.getData(_this.key)
            .then(res => {
              this.total_page = res.pagination.total_page
              if (res.pagination.current_page >= this.total_page) {
                Load.loadData(false)
                Load.noData(true)
                this.has_more = false
              }
              this.page++
              this.appendChild(res.list)
              this.loading = false
            })
            .catch(err => {
              popup.note(err.msg || err.message || JSON.stringify(err))
            })
        }
      }, 100)
    )
  }

  initSaleData(id) {
    this.page = 1
    this.has_more = true
    this.loading = false
    Load.loadData(false)
    Load.noData(false)
    this.getData('', id).then(res => {
      this.total_page = res.pagination.total_page
      if (res.pagination.current_page < this.total_page) {
        Load.loadData(true)
      } else {
        Load.loadData(false)
        Load.noData(true)
        this.has_more = false
      }
      this.page++
      this.htmlChild(res.list)
    })
  }

  initSearchData(id) {
    if (this.key === this.$brand.val()) return
    this.flag = false
    this.page = 1
    this.has_more = true
    this.loading = false
    this.key = this.$brand.val()
    Load.loadData(false)
    Load.noData(false)
    this.getData(this.key, id).then(res => {
      this.total_page = res.pagination.total_page
      if (res.pagination.current_page < this.total_page) {
        Load.loadData(true)
      } else {
        Load.loadData(false)
        Load.noData(true)
        this.has_more = false
      }
      this.page++
      this.htmlChild(res.list)
    })
  }

  bindEvents() {
    let _this = this
    this.scrollListener()
    this.$create.on('click', function() {
      window.location.href = './form_brand.html'
    })
    this.$search.on('click', function() {
      _this.flag && _this.initSearchData()
    })
    this.$top.on('click', '.text span', function() {
      window.history.go(-1)
    })
    this.$main.on('click', '.detail', function() {
      let id = $(this).attr('data-id')
      let status = parseInt($(this).attr('data-status'))
      if (_this.role === 3 && status === 1) {
        return
      }
      window.location.href = './brand.html?id=' + id
    })
    this.$main.on('click', '.name', function() {
      if (getUrlParam('aid')) {
        return
      }
      let id = $(this).attr('data-id')
      let title = ''
      if (id === '0') {
        title = '公海中'
      } else {
        title = $(this).html()
      }
      window.location.href =
        './index.html?token=' +
        getUrlParam('token') +
        '&aid=' +
        id +
        '&title=' +
        title
    })

    this.$main.on('change', 'select', function() {
      let index = $(this)[0].selectedIndex
      let id = $($(this).find('option')[index]).attr('value')
      let text = $(this).find('option')[index].text
      let bid = $(this)
        .parents('.cloum_three')
        .attr('data-id')
      _this
        .appoint({
          bid: bid,
          aid: id
        })
        .then(() => {
          popup.alert(`指派${text}成功`, {}, function() {
            window.location.reload()
          })
        })
        .catch(err => {
          popup.note(err.message || err.msg || JSON.stringify(err))
        })
    })
    this.$main.on('click', '.btn[data-status=receive]', function() {
      let id = $(this)
        .parents('.cloum_three')
        .attr('data-id')
      _this
        .receive(id)
        .then(() => {
          popup.alert(`指派成功`, {}, function() {
            window.location.reload()
          })
        })
        .catch(err => {
          popup.note(err.message || err.msg || JSON.stringify(err))
        })
    })
  }
}

new Page()
