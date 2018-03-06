/**
 * Created by wanli.yu
 */
'use strict'
import './index.less'
import Promise from 'es6-promise'
import popup from '@beibei/popup'
import Xtemplate from 'xtemplate/lib/runtime'
import infoTpl from './info.xtpl'
import partnerTpl from './partner.xtpl'
import processTpl from './process.xtpl'
import { get } from 'biscuit.js'

const infoRenderer = new Xtemplate(infoTpl)
const partnerRenderer = new Xtemplate(partnerTpl)
const processRenderer = new Xtemplate(processTpl)

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

    this.$brand = $('#brand')
    this.$info = $('.brand_info')
    this.$doorList = $('#doorList')
    this.$partner = $('.brand_partner')
    this.$processCon = $('.brand_process')
    this.$confirm = $('.J_confirm')
    this.$confirmSure = $('.J_confirm .sure')
    this.$detail = $('.J_detail')
    this.$detailSure = $('.J_detail .sure')
    this.$partnerSure = $('.J_partner .sure')
    this.$process = $('#process')
    this.$newProcess = $('#newProcess')
    this.$newPartner = $('#newPartner')
    this.$partnerCon = $('.J_partner')
    this.$editBrand = $('#editBrand')
    this.$handleOne = $('#handleOne')
    this.$handleTwo = $('#handleTwo')

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
    this.$handleOne.on('click', function() {
      // apply 申请结案   sure 确认结案
      let loading1 = popup.loading({
        mask: false
      })
      let status = $(this).attr('data-status')
      if (status === 'apply') {
        _this
          .checkBrand()
          .then(() => {
            loading1.remove()
            popup.alert(`申请成功`, {}, function() {
              window.location.reload()
            })
          })
          .catch(err => {
            loading1.remove()
            popup.note(err.message || err.msg || JSON.stringify(err))
          })
      } else if (status === 'sure') {
        _this
          .sureBrand()
          .then(() => {
            loading1.remove()
            popup.alert(`确认成功`, {}, function() {
              window.location.reload()
            })
          })
          .catch(err => {
            loading1.remove()
            popup.note(err.message || err.msg || JSON.stringify(err))
          })
      }
    })
    this.$handleTwo.on('click', function() {
      //back  退回公海  more 退回重审
      let loading2 = popup.loading({
        mask: false
      })
      let status = $(this).attr('data-status')
      if (status === 'back') {
        _this
          .cancelBrand()
          .then(() => {
            loading2.remove()
            popup.alert(`退回公海成功`, {}, function() {
              window.location.reload()
            })
          })
          .catch(err => {
            loading2.remove()
            popup.note(err.message || err.msg || JSON.stringify(err))
          })
      } else if (status === 'more') {
        _this
          .returnBrand()
          .then(() => {
            loading2.remove()
            popup.alert(`退回重审成功`, {}, function() {
              window.location.reload()
            })
          })
          .catch(err => {
            loading2.remove()
            popup.note(err.message || err.msg || JSON.stringify(err))
          })
      }
    })
    this.$partner.on('click', '.btn', function() {
      _this.$partnerCon.addClass('show')
      let id = $(this).attr('data-id')
      let name = $(this)
        .parents('.item')
        .find('.cloum_one')
        .text()
      let percent = $(this)
        .parents('.item')
        .find('.cloum_two')
        .attr('data-percent')
      _this.$partnerCon.find('input[name=name]').val(name)
      _this.$partnerCon.find('input[name=percent]').val(percent)
      _this.$partnerSure.attr('data-id', id)
    })
    this.$partnerSure.on('click', function() {
      let name = _this.$partnerCon.find('input[name=name]').val()
      let percent = _this.$partnerCon.find('input[name=percent]').val()
      let id = _this.$partnerSure.attr('data-id') || ''
      if (!name) {
        popup.alert('股东姓名不能为空')
        return
      } else if (!percent) {
        popup.alert('股东占比不能为空')
        return
      } else {
        _this
          .validatePercent(percent)
          .then(() => {
            _this
              .newPartner({
                name: name,
                percent: percent,
                id: id
              })
              .then(res => {
                if (id) {
                  //edit
                  $('#' + id)
                    .find('.cloum_two')
                    .html(percent + '%')
                    .attr('data-percent', percent)
                } else {
                  //new
                  _this.$partner
                    .append(
                      `
                                    <div class="item flex" id="${res.id}">
                                        <div class="cloum_one">${res.name}</div>
                                        <div class="cloum_two" data-percent="${
                                          res.percent
                                        }">${res.percent}%</div>
                                        <div class="cloum_three btn" data-id="{{id}}">
                                            编辑
                                        </div>
                                    </div>
                                    `
                    )
                    .find('.no-data')
                    .remove()
                }

                _this.$partnerCon.removeClass('show')
                _this.$partnerCon.find('input').val('')
              })
          })
          .catch(err => {
            popup.note(err.message || err.msg || JSON.stringify(err))
          })
      }
    })
    this.$confirmSure.on('click', function() {
      _this.$process.val() &&
        _this
          .followSave(_this.$process.val())
          .then(res => {
            _this.$processCon
              .append(
                `
                            <div class="item flex">
                                <div class="cloum_one">${res.create_time}</div>
                                <div class="cloum_two">${decodeURIComponent(
                                  get('daohe_username')
                                )}</div>
                                <div class="cloum_three">${res.content}</div>
                            </div>
                            `
              )
              .find('.no-data')
              .remove()
            _this.$confirm.removeClass('show')
          })
          .catch(err => {
            popup.note(err.message || err.msg || JSON.stringify(err))
          })
    })
    this.$doorList.on('click', function() {
      window.location.href = './list.html?title=' + _this.title
    })
    this.$editBrand.on('click', function() {
      window.location.href =
        './form_brand.html?id=' + getUrlParam('id') + '&type=edit'
    })

    this.$newProcess.on('click', function() {
      _this.$confirm.addClass('show')
    })
    this.$newPartner.on('click', function() {
      _this.$partnerSure.attr('data-id', '')
      _this.$partnerCon.addClass('show')
    })
    this.$partnerCon.on('click', '.cover, .close', function() {
      _this.$partnerCon.removeClass('show')
      _this.$partnerCon.find('input').val('')
    })
    this.$detail.on('click', '.cover, .close', function() {
      _this.$detail.removeClass('show')
    })
    this.$confirm.on('click', '.cover, .close, .cancel', function() {
      _this.$confirm.removeClass('show')
    })
    this.$brand.on('click', '[open-detail]', function() {
      let text = $(this).attr('data-detail')
      _this.$detail.find('.content .text').html(text)
      _this.$detail.addClass('show')
    })
  }

  returnBrand() {
    return ajax({
      methods: 'GET',
      url: 'app/brand/return'
    })
  }

  cancelBrand() {
    return ajax({
      methods: 'GET',
      url: 'app/brand/cancel'
    })
  }

  checkBrand() {
    return ajax({
      methods: 'GET',
      url: 'app/brand/check'
    })
  }

  sureBrand() {
    return ajax({
      methods: 'GET',
      url: 'app/brand/close'
    })
  }

  followSave(data) {
    return ajax({
      methods: 'POST',
      url: 'app/follow/save',
      form: {
        content: data
      }
    })
  }

  newPartner(obj) {
    return ajax({
      methods: 'POST',
      url: 'app/gudong/save',
      form: obj
    })
  }

  getData() {
    let info = ajax({
      methods: 'GET',
      url: 'app/gudong/list'
    })
    let record = ajax({
      methods: 'GET',
      url: 'app/follow/list'
    })
    return Promise.all([info, record])
  }

  initPage() {
    ajax({
      methods: 'GET',
      url: 'app/brand/console',
      query: {
        id: getUrlParam('id')
      }
    }).then(res => {
      this.title = res.title
      $('#top')
        .find('.name')
        .html(res.title)
      // $('#newPartner').css('display', res.aid === 0 ? 'block' : 'none')
      this.$info.html(infoRenderer.render(res))
      let isEdit =
        (get('daohe_role') === '2' && res.status === '1') ||
        (get('daohe_role') === '3' && res.status === '2')

      this.getData().then(res => {
        res[0].list.forEach(val => {
          val.is_edit = isEdit
        })
        this.$partner.append(partnerRenderer.render(res[0].list))
        this.$processCon.append(processRenderer.render(res[1].list))
        loading.remove()
      })
      this.role = parseInt(get('daohe_role'))
      this.status = parseInt(res.status)
      this.initBtn(isEdit)
    })
  }

  initBtn(isEdit) {
    //3 2 申请结案  退回公海
    //2 3 确认结案  退回重审
    // apply 申请结案   sure 确认结案
    // back  退回公海  more 退回重审
    if (isEdit) {
      $('#newPartner').css('display', 'block')
      $('#editBrand').css('display', 'block')
    } else {
      $('#newPartner').css('display', 'none')
      $('#editBrand').css('display', 'none')
    }
    if (this.role === 3 && this.status === 1) {
      this.$doorList.remove()
    }
    if (this.role === 3 && this.status === 2) {
      this.$handleOne.html('申请结案').attr('data-status', 'apply')
      this.$handleTwo.html('退回公海').attr('data-status', 'back')
    } else if (this.role === 2 && this.status === 3) {
      this.$handleOne.html('确认结案').attr('data-status', 'sure')
      this.$handleTwo.html('退回重审').attr('data-status', 'more')
      this.$newProcess.remove()
    } else {
      this.$handleOne.remove()
      this.$handleTwo.remove()
      this.$newProcess.remove()
    }
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
