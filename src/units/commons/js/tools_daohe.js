import Promise from 'es6-promise'
import { get } from 'biscuit.js'

Promise.polyfill()

export const throttle = (fn, delay, mustRunDelay) => {
  var timer = null
  var starttime = +new Date()

  return function() {
    var context = this,
      args = arguments,
      curTime = +new Date()
    clearTimeout(timer)
    if (!starttime) {
      starttime = curTime
    }
    if (curTime - starttime >= mustRunDelay) {
      fn.apply(context, args)
      starttime = curTime
    } else {
      timer = setTimeout(function() {
        fn.apply(context, args)
      }, delay)
    }
  }
}
// 去抖函数
export const debounce = (fn, delay) => {
  var timer = null
  return function() {
    var context = this,
      args = arguments
    clearTimeout(timer)
    timer = setTimeout(function() {
      fn.apply(context, args)
    }, delay)
  }
}
// 获取url参数
export const getUrlParam = name => {
  const search = window.location.search
  const matched = search
    .slice(1)
    .match(new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i'))
  return search.length ? matched && matched[2] : null
}

export const ajax = ({ methods = 'GET', query = {}, form = {}, url }) => {
  return new Promise((resolve, reject) => {
    let urlStr = '/' + url + '?'
    if (process && process.env.NODE_ENV === 'development') {
      urlStr = 'http://hzdh.sono.mobi/' + url + '?'
    }
    if (query) {
      for (let key in query) {
        urlStr += key + '=' + query[key] + '&'
      }
    }
    //token=fBiPWC2Wiiwwpv9cdiiONziP2giEiE  主管接口
    //token=uQhKMvTHEPWliibF3OfgniPAiEiE  主管接口
    urlStr += `token=${get('daohe_token') || 'uQhKMvTHEPWliibF3OfgniPAiEiE'}`
    $.ajax({
      url: urlStr,
      type: methods,
      data: form,
      dataType: 'json',
      success(res) {
        if (res.errorcode === 0) {
          resolve(res.data)
        } else if (res.errorcode === 100101) {
          window.location.href = '/login/app'
        } else {
          reject(res)
        }
      },
      error() {
        reject({
          msg: '发送请求失败~'
        })
      }
    })
  })
}
export const isSupportSticky = (function() {
  let prefixTestList = ['', '-webkit-']
  let stickyText = ''
  let len = prefixTestList.length
  for (let i = 0; i < len; i++) {
    stickyText += 'position:' + prefixTestList[i] + 'sticky;'
  }
  // 创建一个dom来检查
  let div = document.createElement('div')
  let body = document.body
  div.style.cssText = 'display:none;' + stickyText
  body.appendChild(div)
  let isSupport = /sticky/i.test(window.getComputedStyle(div).position)
  body.removeChild(div)
  div = null
  return isSupport
})()

export default {
  getUrlParam,
  debounce,
  throttle,
  isSupportSticky,
  ajax
}
