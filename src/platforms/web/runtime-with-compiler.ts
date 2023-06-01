import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import {
  shouldDecodeNewlines,
  shouldDecodeNewlinesForHref
} from './util/compat'
import type { Component } from 'types/component'
import type { GlobalAPI } from 'types/global-api'

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

// 将原mount方法存起来，重新定义$mount方法
// 新$mount方法就是为了根据el、template选项生成render函数
// runtime-only版本会传入render函数，所以不需要这一段
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el) // dom元素

  // el不可以是body或html标签，因为el元素会被覆盖
  if (el === document.body || el === document.documentElement) {
    __DEV__ &&
      warn(
        `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
      )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (__DEV__ && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        // template.nodeType返回元素节点类型
        // 表示template传入的是一个dom元素
        // template.innerHTML + 对象本身 = template.outerHTML
        template = template.innerHTML
      } else {
        if (__DEV__) {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      // @ts-expect-error
      // 如果没有传进template参数，就用el参数对应的dom元素序列化后作为模板
      template = getOuterHTML(el) // 获取该dom元素序列化后的字符串
    }
    // 以下跟编译相关
    if (template) {
      /* istanbul ignore if */
      if (__DEV__ && config.performance && mark) {
        mark('compile')
      }

      const { render, staticRenderFns } = compileToFunctions(
        template,
        {
          outputSourceRange: __DEV__,
          shouldDecodeNewlines,
          shouldDecodeNewlinesForHref,
          delimiters: options.delimiters,
          comments: options.comments
        },
        this
      )
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (__DEV__ && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML(el: Element): string {
  if (el.outerHTML) {
    // 返回元素及其子元素序列化后字符串
    return el.outerHTML
  } else {
    // 注意：不能用outerHTML访问svg元素 因为它不属于html
    // 此时可以创建一个div元素包住并返回
    const container = document.createElement('div')
    // el.cloneNode拷贝元素并返回副本，传入true表示克隆后代
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue as GlobalAPI
