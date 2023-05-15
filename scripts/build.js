const fs = require('fs') // nodejs内置模块 用于本地文件系统处理
const path = require('path') // nodejs内置模块 用于本地路径解析
const zlib = require('zlib') // nodejs内置模块 使用gzip算法进行文件压缩
const rollup = require('rollup')
const terser = require('terser') // 用于js代码压缩及美化

// 同步方式判断dist是否存在，不存在则创建
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

let builds = require('./config').getAllBuilds()

/* process.argv包含了启动Node.js进程时的命令行参数 执行build:ssr打印:
[
  'D:\\software\\nodejs\\node.exe',
  'D:\\code\\vueSource\\vue2.7.14\\scripts\\build.js',
  'runtime-cjs,server-renderer'
]
process.argv[0]返回node.exe绝对路径
process.argv[1]返回为当前执行的js文件路径
剩余的元素为其他命令行参数 */
// 通过命令行参数对构建配置做过滤
if (process.argv[2]) {
  const filters = process.argv[2].split(',')
  builds = builds.filter(b => {
    return filters.some(
      f => b.output.file.indexOf(f) > -1 || b._name.indexOf(f) > -1
    )
  })
}

build(builds)

function build(builds) {
  let built = 0
  const total = builds.length
  const next = () => {
    buildEntry(builds[built])
      .then(() => {
        built++
        if (built < total) {
          next()
        }
      })
      .catch(logError)
  }

  next()
}

// 真正开始通过rollup对其进行编译 ，等同于使用命令行编译rollup -c xxx
function buildEntry(config) {
  const output = config.output
  const { file, banner } = output
  const isProd = /(min|prod)\.js$/.test(file)
  // rollup.rollup(config) 传入配置详情 创建一个bundle
  // bundle.generate(output)  在内存中生成输出特定的代码
  console.log('1111 config', config)
  return rollup
    .rollup(config)
    .then(bundle => bundle.generate(output))
    .then(async ({ output: [{ code }] }) => {
      // 生产环境的包需要压缩和美化代码
      if (isProd) {
        const { code: minifiedCode } = await terser.minify(code, {
          toplevel: true,
          compress: {
            pure_funcs: ['makeMap']
          },
          format: {
            ascii_only: true
          }
        })
        const minified = (banner ? banner + '\n' : '') + minifiedCode
        return write(file, minified, true)
      } else {
        return write(file, code)
      }
    })
}

function write(dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report(extra) {
      console.log(
        blue(path.relative(process.cwd(), dest)) +
          ' ' +
          getSize(code) +
          (extra || '')
      )
      resolve()
    }

    if (!fs.existsSync(path.dirname(dest))) {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
    }
    // 写文件操作
    fs.writeFile(dest, code, err => {
      if (err) return reject(err)
      if (zip) {
        // 文件压缩
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}

function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError(e) {
  console.log(e)
}

function blue(str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
