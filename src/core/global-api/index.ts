import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index' // vue的内置组件
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'
import type { GlobalAPI } from 'types/global-api'

export function initGlobalAPI(Vue: GlobalAPI) {
  // config
  const configDef: Record<string, any> = {}
  configDef.get = () => config
  if (__DEV__) {
    // 定义的全局config属性不允许更改
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  // 定义全局属性-config对象（详情官网可查阅）
  // 可以在挂载应用前更改这些属性
  Object.defineProperty(Vue, 'config', configDef)

  // 此全局方法官方不建议用，因为不稳定
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }

  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }

  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // 定义_base指向vue
  Vue.options._base = Vue

  // 将内置组件拓展到components下
  extend(Vue.options.components, builtInComponents)

  initUse(Vue) // 定义全局方法vue.use()
  initMixin(Vue) // 定义全局方法vue.mixin()
  initExtend(Vue) // 定义全局方法vue.extend()
  initAssetRegisters(Vue) // 定义其他的全局方法
}
