/*!
 * @overview
 * @copyright (c) 2018-present, MaQu, Inc.
 * @authors Vace<i@ahmq.net>
 * @license Released under the MIT License.
 */

const { Application, Container, Texture, Sprite, Rectangle, Graphics } = PIXI

// 单格宽高
const SIZE = 128
// 行
const SIZE_ROW = 6
// 列
const SIZE_COL = 6
// 方向x
const DIRECTION_X = 'x'
// 方向y
const DIRECTION_Y = 'y'

/**
 * 小车
 */

class KlotskiCar {
  get isLockX () {
    return this.direction === DIRECTION_X
  }
  get isLockY () {
    return this.direction === DIRECTION_Y
  }

  constructor (config) {
    const [x, y, length, direction, isHeader] = config
    this.x = x
    this.y = y
    this.isHeader = !!isHeader
    this.direction = direction
    this.length = length
    const car = isHeader ? 0 : Math.ceil(Math.random() * 4)
    const png = `sprites/${direction}-${length}-t${car}.png`
    this.target = new Sprite(Texture.from(png))
    // private
    this.step = 0
    this.offset = { x: 0, y: 0 }
    this.addEvents()
  }
  // 是否与指定点具有交点
  orbital (_x, _y) {
    const { isLockX, x, y } = this
    for (var i = 0; i < this.length; i++)
      if (isLockX ? (_x == x + i && _y == y) : (_x == x && _y == y + i))
        return true
    return false
  }

  addEvents () {
    this.isTouched = false
    this.range     = {}
    this.target.interactive = this.target.buttonMode = true
    this.target.on('pointerdown', this._onPointerDown.bind(this))
          .on('pointermove', this._onPointerMove.bind(this))
          .on('pointerup', this._onPointerEnd.bind(this))
          .on('pointerupoutside', this._onPointerEnd.bind(this))
  }

  _onPointerDown({ data: { global } }) {
    const { parent, target, offset } = this
    if (parent.isPassLevel) return // 已过关
    this.isTouched = true
    target.alpha = 0.8
    target.scale.set(0.5)
    offset.x = target.x - global.x
    offset.y = target.y - global.y
    this.range = this._computeRange()
  }

  _onPointerMove ({ data: { global } }) {
    const { target, isTouched, isLockX, offset, range } = this
    if (!isTouched) return
    if (isLockX) {
      target.x = Math.max(Math.min(global.x + offset.x, range.max * SIZE), range.min * SIZE)
    } else {
      target.y = Math.max(Math.min(global.y + offset.y, range.max * SIZE), range.min * SIZE)
    }
  }

  _onPointerEnd () {
    const { target, x, y, parent } = this
    if (parent.isPassLevel) return // 已过关
    target.alpha = 1
    this.isTouched = false
    this.x = Math.round(target.x / SIZE)
    this.y = Math.round(target.y / SIZE)
    if (x != this.x || y != this.y) {
      parent.step += 1
    }
    this.render()
    parent.checkPassed()
  }

  mount (parent) {
    this.parent = parent
    this.parent.game.addChild(this.target)
    this.render()
    return this
  }

  render () {
    const { x, y, target } = this
    target.x = SIZE * x
    target.y = SIZE * y
    target.scale.set(0.48) //* 素材缩放比
  }

  driving () {
    const { target, isLockX } = this
    const move = (isLockX ? SIZE_COL : SIZE_ROW) * SIZE
    const prop = isLockX ? 'x' : 'y'
    const render = () => {
      if (target[prop] < move) {
        target[prop] += 5
        requestAnimationFrame(render)
      }
    }
    requestAnimationFrame(render)
  }

  // 从中心点四向搜索
  _computeRange () {
    const { isLockX, x, y, parent, length } = this
    let min = isLockX ? x : y, max = min 
    if (isLockX) {
      while (min > 0) {
        if (parent.orbital(min - 1, y)) break
        min = min - 1
      }
      while (max < SIZE_ROW - length) {
        if (parent.orbital(max + length, y)) break
        max = max + 1
      }
    } else {
      while (min > 0) {
        if (parent.orbital(x, min - 1)) break
        min = min - 1
      }
      while (max < SIZE_COL - length) {
        if (parent.orbital(x, max + length)) break
        max = max + 1
      }
    }
    return { min, max }
  }
}

KlotskiCar.DIRECTION_X = DIRECTION_X
KlotskiCar.DIRECTION_Y = DIRECTION_Y

/**
 * 关卡
 */

class KlotskiScene {
  get header () {
    return this.cars.find(car => car.isHeader)
  }
  get isPassLevel () {
    const { header, cars } = this
    if (header.isLockX) {
      for (let x = header.x + length; x < SIZE_COL; x++)
        if (cars.some(car => (car != header) && car.orbital(x, header.y)))
          return false
    } else {
      for (let y = header.y + length; y < SIZE_ROW; y++)
      if (cars.some(car => (car != header) && car.orbital(header.x, y)))
        return false
    }
    return true
  }

  get step () {
    return this._step
  }
  set step (val) {
    this.parent._onMove(val)
    this._step = val
  }

  constructor (config) {
    this.config = config
    this.cars = []
    // private
    this.time = 0
    this.level = KlotskiScene.level++
    this._step = 0
  }

  mount (parent) {
    this.parent = parent
    this.game = parent.game
    this.game.removeChildren()
    this.cars = this.config.map(t => new KlotskiCar(t).mount(this))
    this.time = Date.now()
    this.step = 0
    return this
  }

  orbital (x, y) {
    return this.cars.some(car => car.orbital(x, y)) // proxy 碰撞检测
  }

  checkPassed () {
    if (this.isPassLevel) {
      this.header.driving()
      this.parent._onPassed({
        usetime: Date.now() - this.time,
        step: this.step
      })
    }
  }
}

KlotskiScene.level = 0

class KlotskiMain {
  /**
   * [constructor 创建游戏场景]
   * @param  {Object} options 游戏全局配置
   * @param  {function} options.onStart 开始事件，event: scene
   * @param  {function} options.onMove 移动事件，event: step
   * @param  {function} options.onPassed 通关事件：event: { step, usetime }
   */
  constructor (options = {}) {
    this.app = new Application({
      width: SIZE * SIZE_COL,
      height: SIZE * SIZE_ROW,
      backgroundAlpha: 0
    })
    this.scene = null
    this.options = options

    // layers
    this.app.stage.addChild(
      this.base = new Container(), // 背景层
      this.game = new Container(), // 游戏渲染层
      this.ui   = new Container(), // 游戏UI
      this.mask = new Container(), // 交互/遮罩层
    )
    document.getElementById('view').appendChild(this.app.view)

    // draw bottom
    const graphics = new Graphics()
    graphics.lineStyle(1, 0xFFFFFF, 1)
    graphics.beginFill(0xFFFFFF)
    for (var i = 1; i < SIZE_ROW; i++)
      graphics.drawRect(0, i * SIZE, SIZE * SIZE_COL, 4)
    for (var i = 1; i < SIZE_COL; i++)
      graphics.drawRect(i * SIZE, 0, 4, SIZE * SIZE_ROW)
    graphics.endFill()
    this.base.addChild(graphics)
    this.base.addChild(this.door = new Graphics())
  }

  loading (scene) {
    this.scene = scene.mount(this)
    this._drawDoor()
    this._onStart()
    return this
  }

  // 绘制出口
  _drawDoor () {
    const header = this.scene.header
    const graphics = this.door
    graphics.clear()
    graphics.beginFill(0xFFFFFF, 0.5)
    if (header.isLockX) {
      graphics.drawRect(0, header.y * SIZE, SIZE_COL * SIZE, SIZE)
    } else {
      graphics.drawRect(header.x * SIZE, 0, SIZE, SIZE_ROW * SIZE)
    }
    graphics.endFill()
  }

  _onStart () {
    const { options, scene } = this
    if (typeof options.onStart === 'function') {
      options.onStart(scene)
    } 
  }

  _onPassed (detail) {
    const { options } = this
    if (typeof options.onPassed === 'function') {
      options.onPassed(detail)
    }
  }
  _onMove (step) {
    const { options } = this
    if (typeof options.onMove === 'function') {
      options.onMove(step)
    }
  }
}

KlotskiMain.SIZE_ROW = SIZE_ROW
KlotskiMain.SIZE_COL = SIZE_COL
