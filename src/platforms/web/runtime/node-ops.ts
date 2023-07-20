import VNode from 'core/vdom/vnode'
import { namespaceMap } from 'web/util/index'

export function createElement(tagName: string, vnode: VNode): Element {
  const elm = document.createElement(tagName)
  if (tagName !== 'select') {
    return elm
  }
  // false or null will remove the attribute but undefined will not
  // html原生组件<select>
  if (
    vnode.data &&
    vnode.data.attrs &&
    vnode.data.attrs.multiple !== undefined
  ) {
    elm.setAttribute('multiple', 'multiple')
  }
  return elm
}

// 创建命名空间元素节点, 并插入HTML文档中
export function createElementNS(namespace: string, tagName: string): Element {
  return document.createElementNS(namespaceMap[namespace], tagName)
}

// 创建文本节点, 并插入HTML文档中
export function createTextNode(text: string): Text {
  return document.createTextNode(text)
}

// 创建注释节点, 并插入HTML文档中
export function createComment(text: string): Comment {
  return document.createComment(text)
}

// 将新节点插入到参考节点referenceNode之前
export function insertBefore(
  parentNode: Node,
  newNode: Node,
  referenceNode: Node
) {
  parentNode.insertBefore(newNode, referenceNode)
}

export function removeChild(node: Node, child: Node) {
  node.removeChild(child)
}

export function appendChild(node: Node, child: Node) {
  node.appendChild(child)
}

export function parentNode(node: Node) {
  return node.parentNode
}

export function nextSibling(node: Node) {
  return node.nextSibling
}

export function tagName(node: Element): string {
  return node.tagName
}

export function setTextContent(node: Node, text: string) {
  node.textContent = text
}

export function setStyleScope(node: Element, scopeId: string) {
  node.setAttribute(scopeId, '')
}
