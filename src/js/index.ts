import "./animate.js"
import { Capture, CaptureSegment, CaptureEvent, CaptureHook, CaptureHookMap } from "./capture.js"
import { $h } from "./query.js"

let timeLast = 0

function tick(timeCurrent: number) {
  timeCurrent *= 0.001;
  const timeDelta = timeCurrent - timeLast;
  timeLast = timeCurrent;

  Capture.frameUpdate()

  window.requestAnimationFrame(tick)
}

window.addEventListener("load", () => {
  tick(0)
})

Capture.init()
const capture  = new Capture("sections")
const section1 = $h("section.section--1")
const section2 = $h("section.section--2")
const section3 = $h("section.section--3")


/* 
=========================
      EXAMPLE HOOKS
=========================
*/

const hook1: CaptureHook = (query: string, capture: Capture, segment: CaptureSegment) => {
  const element = $h(query)
  if(capture.segments[capture.activeSegmentIndex] !== segment) {
    element.style = ""
    return
  }
  element.style.width = (segment.scroll) + "px"
  element.style.backgroundColor = `hsl(${(segment.scroll/3) % 360}, 50%, 50%)`
}
const hooks1: CaptureHookMap = new Map()
hooks1.set("section.section--1", hook1)

const hook2: CaptureHook = (query: string, capture: Capture, segment: CaptureSegment) => {
  const element = $h(query)
  if(capture.segments[capture.activeSegmentIndex] !== segment) {
    element.style = ""
    return
  }
  element.style.width = (segment.scroll) + "px"
  element.style.backgroundColor = `hsl(${(segment.scroll/4) % 360}, 50%, 50%)`
}
const hooks2: CaptureHookMap = new Map()
hooks2.set("section.section--2", hook2)

const hook3: CaptureHook = (query: string, capture: Capture, segment: CaptureSegment) => {
  const element = $h(query)

  if(capture.segments[capture.activeSegmentIndex] !== segment) {
    //@todo @feature this thing could actually be an option, some kind of global cos you might want this often 
    // (also this could besome a set of macros, or even better, allow users to create their own definitions for cleanup functions that run after the hook body)
    element.style = ""
    section2.style.borderTopColor = ""
    section2.style.borderTopStyle = ""
    section2.style.borderTopWidth = ""
    return
  }

  section2.style.borderTopColor = `hsl(${(segment.scroll/8) % 360}, 50%, 50%)`
  section2.style.borderTopStyle = "dashed"
  section2.style.borderTopWidth = (100 / (segment.height / segment.scroll)) + "px"
  
  element.style.width = (segment.scroll) + "px"
  element.style.height = (200 + segment.scroll/10) + "px"
  element.style.backgroundColor = `hsl(${(segment.scroll/8) % 360}, 50%, 50%)`
}
const hooks3: CaptureHookMap = new Map()
hooks3.set("section.section--3", hook3)

capture.addSegment({height: section1.getBoundingClientRect().width, hooks: hooks1, scroll: 0})
capture.addSegment({height: section2.getBoundingClientRect().width, hooks: hooks2, scroll: 0})
capture.addSegment({height: section3.getBoundingClientRect().width, hooks: hooks3, scroll: 0})

/*
=======================
        IDEAS
=======================
*/

// captures can be nested so that the whole page is one big capture and inside it there are mini ones
// that are only affected when scroll events are registered inside the containing element
//
// Scroll events are blocked and a scroll counter is updated based on capturing the events of the pointer(mobile) or mousewheel
// 
// Smoothing is something that should be implemented on the level of the hooks, I think, because forcing global smoothing or doing
// it internally will introduce potential usability problems
//
// The beauty of hook functions is that they allow ANY kind of code, even code unrelated to HTML elements to happen inside them.
//
// Scroll snapping: Function that solves for value the segment (or capture) scroll has to go so that 
// a particular edge of a particular element touches a particular other edge

// question: Should all hooks always be called all the time? 
// Seems prudent and less prone to bugs, but perhaps two downsides: Performance and resolving edge-states

// 1) @performance
// will look into later

// 2) Edge-states
// the before-active and after-active states need to be constantly reevaluated. I could allow including a on-enter and on-leave function, and also a on-enter-forward and on-enter-backward
// these two could allow different animations to trigger, perhaps, which could be tied to adjacent animations in other segments.