/**
 * Created by wanli.yu
 */
'use strict'
import './index.less'

import { ajax } from 'commons/js/tools_daohe.js'
import { isSupportSticky, getUrlParam } from 'commons/js/tools.js'
import popup from '@beibei/popup'
import Promise from 'es6-promise'
import Xtemplate from 'xtemplate/lib/runtime'
import itemTpl from './item.xtpl'
import { get, set } from 'biscuit.js'

Promise.polyfill()
const itemRenderer = new Xtemplate(itemTpl)
class PAGE {
  constructor() {
    this.$top = $('.top')
    this.$staticTop = $('#top')
    this.$body = $('body')
    this.$win = $(window)
    this.$sure = $('.sure')
    this.$form = $('#form')

    this.$province = $('#province')
    this.$city = $('#city')
    this.$area = $('#area')
    this.$sure = $('.sure')

    this.formData = {
      name: '分店名称',
      pcc: '人均',
      start: '星级',
      taste: '口味',
      env: '环境',
      server: '服务',
      comment: '评论数',
      table: '餐位数',
      province: '省份',
      city: '城市',
      area: '区',
      addr: '详细地址',
      revenue: '月营收'
    }

    $('.form_nav').html(
      getUrlParam('type') === 'edit'
        ? '首页 > 门店列表 > 门店修改'
        : '首页 > 品牌详情 > 创建门店'
    )

    this.sticky()
    this.initProvince()
    this.bindEvents()
  }

  initPage() {
    let res = JSON.parse(get('daohe_door_info'))
    let _this = this
    _this.$form.find('input[name=name]').val(res.name)
    _this.$form.find('input[name=pcc]').val(res.pcc)
    _this.$form.find('input[name=start]').val(res.start)
    _this.$form.find('input[name=taste]').val(res.taste)
    _this.$form.find('input[name=env]').val(res.env)
    _this.$form.find('input[name=server]').val(res.server)
    _this.$form.find('input[name=comment]').val(res.comment)
    _this.$form.find('input[name=table]').val(res.table)
    _this.$form.find('input[name=addr]').val(res.addr)
    _this.$form.find('input[name=revenue]').val(res.revenue)
    _this.$form.find('input[name=revenue]').val(res.revenue)

    _this.$form
      .find(`input[name=mast][value='${res.mast}']`)
      .attr('checked', 'checked')
  }

  newDoor(data) {
    return ajax({
      methods: 'POST',
      url: 'app/store/save',
      form: data
    })
  }

  getCityData(id) {
    return ajax({
      methods: 'POST',
      url: 'wii/region/get_children',
      form: {
        id: id
      }
    })
  }

  initProvince() {
    let _this = this
    let str = '<option value="">请选择省份</option>'

    this.getCityData(1)
      .then(res => {
        str += itemRenderer.render(res)
        this.$province.html(str)
        if (getUrlParam('type') === 'edit') {
          //编辑状态
          let doorData = JSON.parse(get('daohe_door_info'))
          _this.$form.find('input[name=id]').val(doorData.id)
          this.initPage()
          _this.$form
            .find('input[name=province_label]')
            .val(doorData.province_label)
          _this.$form
            .find('select[name=province]')
            .find(`option[value='${doorData.province}']`)
            .attr('selected', true)
          _this.getCityData(doorData.province).then(res1 => {
            let str1 = '<option value="">请选择城市</option>'
            str1 += itemRenderer.render(res1)
            _this.$city.html(str1)
            _this.$form.find('input[name=city_label]').val(doorData.city_label)
            _this.$form
              .find('select[name=city]')
              .find(`option[value='${doorData.city}']`)
              .attr('selected', true)
            _this.getCityData(doorData.city).then(res2 => {
              let str2 = '<option value="">请选择区</option>'
              str2 += itemRenderer.render(res2)
              _this.$area.html(str2)
              _this.$form
                .find('input[name=area_label]')
                .val(doorData.area_label)
              _this.$form
                .find('select[name=area]')
                .find(`option[value='${doorData.area}']`)
                .attr('selected', true)
            })
          })
        }
      })
      .catch(err => {
        popup.note(err.message || err.msg || JSON.stringify(err))
      })
  }

  validate(callback) {
    let data = this.$form.serializeArray()
    for (let i = 1; i < data.length; i++) {
      if (!data[i].value) {
        popup.alert(`${this.formData[data[i].name]}不能为空`)
        return
      }
    }
    callback()
  }

  setData() {
    if (getUrlParam('type') === 'edit') {
      let data = this.$form.serializeArray()
      let cookieData = JSON.parse(get('daohe_door_info'))
      if (cookieData) {
        for (let i = 0, len = data.length; i < len; i++) {
          cookieData[data[i]['name']] = data[i]['value']
        }
        set('daohe_door_info', JSON.stringify(cookieData))
      }
      window.location.href = document.referrer
    } else {
      window.history.go(-1)
    }
  }

  bindEvents() {
    let _this = this
    this.scrollListener()
    $('#province').on('change', function() {
      let index = $('#province')[0].selectedIndex
      let text = $(this).find('option')[index].text
      $('#province_label').val(text)

      let id = $($('#province').find('option')[index]).attr('value')
      let str = '<option value="">请选择城市</option>'
      _this
        .getCityData(id)
        .then(res => {
          str += itemRenderer.render(res)
          _this.$city.html(str)
        })
        .catch(err => {
          popup.note(err.message || err.msg || JSON.stringify(err))
        })
    })
    $('#city').on('change', function() {
      let index = $('#city')[0].selectedIndex
      let text = $(this).find('option')[index].text
      $('#city_label').val(text)
      let id = $($('#city').find('option')[index]).attr('value')
      let str = '<option value="">请选择区</option>'
      _this
        .getCityData(id)
        .then(res => {
          str += itemRenderer.render(res)
          _this.$area.html(str)
        })
        .catch(err => {
          popup.note(err.message || err.msg || JSON.stringify(err))
        })
    })
    $('#area').on('change', function() {
      let index = $('#area')[0].selectedIndex
      let text = $(this).find('option')[index].text
      $('#area_label').val(text)
    })
    this.$sure.on('click', function() {
      _this.validate(function() {
        _this.newDoor(_this.$form.serializeArray()).then(() => {
          _this.setData()
        })
      })
    })
  }

  scrollListener() {
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
