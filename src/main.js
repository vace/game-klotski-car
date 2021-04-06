sdk.ui.alert({
  title: '任务目标',
  content: '让红色小车沿着白色出口出去'
})

const ui = {
  level: document.getElementById('v-level'),
  step: document.getElementById('v-step'),
  time: document.getElementById('v-time'),
  setLevel (level) {
    this.level.textContent = 'L' + level
    return this
  },
  setStep (step) {
    this.step.textContent = step + '步'
    return this
  },
  setTime (time) {
    this.time.textContent = (time / 1000).toFixed(2) + 's'
    return this
  },
  watchTime (now) {
    this.stopTime()
    const update = () => {
      ui.$watchId = requestAnimationFrame(update)
      ui.setTime(Date.now() - now)
    }
    ui.$watchId = requestAnimationFrame(update)
  },
  stopTime () {
    cancelAnimationFrame(ui.$watchId)
  }
}

const klotski = new KlotskiMain({
  onStart: (scene) => {
    ui.setLevel(scene.level + 1).setStep(0).watchTime(Date.now())
  },
  onMove: (step) => {
    ui.setStep(step)
  },
  onPassed: detail => {
    ui.setTime(detail.usetime).stopTime()
    sdk.ui.alert({
      title: '恭喜过关',
      content: `过关用时：${detail.usetime / 1000}s，过关步骤：${detail.step}步`,
      okText: '下一关',
      ok: e => e.withClose(loadNextScene)
    })
  }
})

const loadNextScene = (() => {
  const sceneList = [
    // x,y,len,dir
    new KlotskiScene([
      [3, 2, 2, 'x', true],
      [4, 0, 2, 'x'],
      [3, 1, 2, 'x'],
      [0, 2, 3, 'x'],
      [1, 3, 2, 'x'],
      [3, 4, 3, 'x'],
      [2, 5, 2, 'x'],
      [4, 5, 2, 'x'],
      [5, 1, 3, 'y'],
      [1, 4, 2, 'y'],
    ]),
    new KlotskiScene([
      [1, 2, 2, 'x', true],
      [1, 0, 2, 'x'],
      [2, 1, 2, 'x'],
      [4, 3, 2, 'x'],
      [0, 1, 2, 'y'],
      [4, 0, 3, 'y'],
      [2, 3, 3, 'y'],
    ]),
    new KlotskiScene([
      [3, 0, 2, 'y', true],
      [1, 2, 2, 'x'],
      [0, 3, 3, 'y'],
      [2, 3, 2, 'y'],
      [2, 5, 2, 'x'],
      [3, 3, 2, 'x'],
      [3, 4, 3, 'x'],
      [4, 1, 2, 'y'],
    ]),
    new KlotskiScene([
      [0, 2, 2, 'x', true],
      [1, 1, 2, 'x'],
      [3, 1, 2, 'y'],
      [4, 0, 3, 'y'],
      [5, 2, 2, 'y'],
      [2, 3, 2, 'y'],
      [3, 3, 2, 'x'],
      [3, 5, 3, 'x'],
    ]),
    new KlotskiScene([
      [0, 0, 2, 'x'],
      [2, 0, 2, 'x'],
      [4, 0, 2, 'y'],
      [1, 1, 2, 'x'],
      [3, 1, 2, 'y'],
      [0, 2, 2, 'x', true],
      [3, 3, 2, 'x'],
      [5, 2, 3, 'y'],
      [3, 4, 2, 'x'],
      [1, 4, 2, 'y'],
      [2, 4, 2, 'y'],
      [3, 5, 3, 'x'],
    ]),
    new KlotskiScene([
      [0, 2, 2, 'x', true],
      [0, 1, 3, 'x'],
      [4, 1, 3, 'y'],
      [2, 3, 2, 'y'],
      [3, 3, 2, 'y'],
      [5, 2, 2, 'y'],
      [4, 4, 2, 'x'],
      [0, 5, 3, 'x'],
    ]),
    new KlotskiScene([
      [0, 2, 2, 'x', true],
      [2, 0, 2, 'x'],
      [4, 0, 3, 'y'],
      [5, 1, 2, 'y'],
      [2, 2, 2, 'y'],
      [3, 3, 2, 'x'],
      [3, 4, 3, 'x'],
      [3, 5, 2, 'x'],
      [0, 4, 2, 'y'],
    ]),
    new KlotskiScene([
      [0, 2, 2, 'x', true],
      [1, 0, 3, 'x'],
      [3, 1, 2, 'x'],
      [2, 2, 2, 'y'],
      [3, 2, 3, 'y'],
      [4, 2, 2, 'y'],
      [5, 1, 3, 'y'],
      [1, 4, 2, 'y'],
      [2, 5, 3, 'x'],
    ]),
    new KlotskiScene([
      [0, 2, 2, 'x', true],
      [0, 0, 2, 'x'],
      [2, 2, 2, 'y'],
      [4, 1, 3, 'y'],
      [0, 3, 2, 'x'],
      [1, 4, 2, 'y'],
      [2, 5, 3, 'x'],
    ])
  ]
  let level = 0
  return () => {
    klotski.loading(sceneList[level])
    level = (level + 1) % sceneList.length
  }
})()

loadNextScene()

// new Vue({
//   el: 'app'
// })