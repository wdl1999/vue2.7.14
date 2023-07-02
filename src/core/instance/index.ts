import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'
import type { GlobalAPI } from 'types/global-api'

// 可以看出 vue其实就是一个用function实现的类（ES5）
// 不用es6 class的方式是因为后期难拓展
function Vue(options) {
  // 如果这样使用：new Vue，this instanceof Vue为true
  // 否则this指向window
  if (__DEV__ && !(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

// 在vue原型上定义了很多方法
// 定义了_init方法，用于初始化vue实例
//@ts-expect-error Vue has function type
initMixin(Vue)
//@ts-expect-error Vue has function type
stateMixin(Vue)
//@ts-expect-error Vue has function type
eventsMixin(Vue)
//@ts-expect-error Vue has function type
lifecycleMixin(Vue)
// 定义了_render方法，用于生成虚拟dom,_init方法中会调用
//@ts-expect-error Vue has function type
renderMixin(Vue)

export default Vue as unknown as GlobalAPI
