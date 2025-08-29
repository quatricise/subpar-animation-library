import "./animate.js"
import { Capture, CaptureSegment, CaptureEvent, CaptureHook } from "./capture.js"
import { $h } from "./query"

let timeLast = 0

function tick(timeCurrent: number) {
  timeCurrent *= 0.001;
  const timeDelta = timeCurrent - timeLast;
  timeLast = timeCurrent;

  Capture.updateAll()

  window.requestAnimationFrame(tick)
}

window.addEventListener("load", () => {
  tick(0)
})

Capture.init()
const capture = new Capture("test")
const section1 = $h("section.section--1")
const section2 = $h("section.section--2")
const section3 = $h("section.section--2")



const hook1_query: string = "section.section--1"
const hook1: CaptureHook = (query: string, capture: Capture, segment: CaptureSegment) => {
  const element = $h(hook1_query)
  console.log("Capture activeSegmentIndex: ", capture.activeSegmentIndex)
  if(capture.segments[capture.activeSegmentIndex] !== segment) {
    element.style = ""
    return
  }
  element.style.width = (segment.scroll) + "px"
  element.style.backgroundColor = `hsl(${(segment.scroll/10) % 360}, 50%, 50%)`
}
const hooks1 = new Map()
hooks1.set(hook1_query, hook1)



const hook2_query: string = "section.section--2"
const hook2: CaptureHook = (query: string, capture: Capture, segment: CaptureSegment) => {
  const element = $h(hook2_query)
  console.log("Capture activeSegmentIndex: ", capture.activeSegmentIndex)
  if(capture.segments[capture.activeSegmentIndex] !== segment) {
    element.style = ""
    return
  }
  element.style.width = (segment.scroll) + "px"
  element.style.backgroundColor = `hsl(${(segment.scroll/4) % 360}, 50%, 50%)`
}
const hooks2 = new Map()
hooks2.set(hook2_query, hook2)



const hook3_query: string = "section.section--3"
const hook3: CaptureHook = (query: string, capture: Capture, segment: CaptureSegment) => {
  const element = $h(hook3_query)
  console.log("Capture activeSegmentIndex: ", capture.activeSegmentIndex)
  if(capture.segments[capture.activeSegmentIndex] !== segment) {
    element.style = ""
    return
  }
  element.style.width = (segment.scroll) + "px"
  element.style.backgroundColor = `hsl(${(segment.scroll/8) % 360}, 50%, 50%)`
}
const hooks3 = new Map()
hooks3.set(hook3_query, hook3)



capture.segmentAdd({height: section1.getBoundingClientRect().width, hooks: hooks1, scroll: 0})
capture.segmentAdd({height: section2.getBoundingClientRect().width, hooks: hooks2, scroll: 0})
capture.segmentAdd({height: section3.getBoundingClientRect().width, hooks: hooks3, scroll: 0})

/* 
=======================
        IDEAS
=======================
*/
// captures can be nested so that the whole page is one big capture and inside it there are mini ones
// that are only affected when scroll events are registered inside the containing element
//
// Scroll events are blocked and a scroll counter is updated based on capturing the events of the pointer(mobile) or mousewheel