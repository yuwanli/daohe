/**
 * Created by wanli.yu
 */
'use strict'
import './index.less'

import { ajax } from 'commons/js/tools_daohe.js'
import { isSupportSticky } from 'commons/js/tools.js'
import { getUrlParam } from 'commons/js/tools_daohe'
import popup from '@beibei/popup'
const getData = () => {
  return ajax({
    methods: 'GET',
    url: 'app/sort/list'
  })
}
class PAGE {
  constructor() {
    this.$top = $('.top')
    this.$staticTop = $('#top')
    this.$body = $('body')
    this.$win = $(window)
    this.$sure = $('.sure')
    this.$back = $('.back')
    this.$form = $('#form')

    this.formData = {
      sortid: '所属品类',
      cdate: '成立时间',
      company: '公司名称',
      title: '品牌名称',
      director: '负责人',
      director_mobile: '负责人电话',
      source: '信息来源',
      remark: '备注',
      recommend: 'recommend'
    }

    $('.form_nav').html(
      getUrlParam('type') === 'edit'
        ? '首页 > 品牌详情 > 品牌修改'
        : '首页 > 品牌详情'
    )

    this.sticky()
    this.bindEvents()

    this.initPage()
  }

  newBrand(data) {
    return ajax({
      methods: 'POST',
      url: 'app/brand/save',
      form: data
    })
  }

  validate(callback) {
    let data = this.$form.serializeArray()
    for (let i = 1; i < data.length; i++) {
      if (!data[i].value) {
        //值为空
        popup.note(`${this.formData[data[i].name] || data[i].name}不能为空`)
        return
      } else if (data[i].name === 'director_mobile') {
        let num = data[i].value
        if (num !== undefined && num.length !== 11) {
          popup.note('请输入11位手机号')
          return
        }
      }
    }
    callback()
  }

  bindEvents() {
    let _this = this
    this.scrollListener()
    this.$sure.on('click', function() {
      _this.validate(function() {
        _this
          .newBrand(_this.$form.serializeArray())
          .then(() => {
            let msg = getUrlParam('type') === 'edit' ? '修改成功' : '创建成功'
            popup.alert(msg, {}, function() {
              window.history.go(-1)
            })
          })
          .catch(err => {
            popup.note(err.message || err.msg || JSON.stringify(err))
          })
      })
    })
    this.$back.on('click', function() {
      window.history.back()
    })
  }

  initPage() {
    let _this = this
    getData()
      .then(res => {
        var str = '<option value="">请选择</option>'
        for (let i = 0, len = res.list.length; i < len; i++) {
          str += `<option value="${res.list[i].id}">${
            res.list[i].title
          }</option>`
        }
        $('#sortList').html(str)
      })
      .catch(err => {
        popup.note(err.message || err.msg || JSON.stringify(err))
      })
    if (getUrlParam('id')) {
      //edit
      _this.$form.find('input[name=id]').val(getUrlParam('id'))
      ajax({
        methods: 'GET',
        url: 'app/brand/console',
        query: {
          id: getUrlParam('id')
        }
      }).then(res => {
        setTimeout(function() {
          _this.$form.find('select[name=sortid]')[0].value = res.sortid
        }, 20)
        _this.$form.find('input[name=cdate]').val(res.cdate)
        _this.$form.find('input[name=company]').val(res.company)
        _this.$form.find('input[name=title]').val(res.title)
        _this.$form.find('input[name=director]').val(res.director)
        _this.$form.find('input[name=director_mobile]').val(res.director_mobile)
        _this.$form.find('input[name=source]').val(res.source)
        _this.$form.find('input[name=remark]').val(res.remark)
        _this.$form.find('input[name=recommend]').val(res.recommend)
        _this.$form
          .find(`input[name=cooperation][value='${res.cooperation}']`)
          .attr('checked', 'checked')
        _this.$form
          .find(`input[name=register][value='${res.register}']`)
          .attr('checked', 'checked')
      })
    }
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
