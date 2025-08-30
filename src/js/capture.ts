import { clamp, sum } from "./utils.js"

export type CaptureSegment = {
  height: number
  scroll: number
  hooks: CaptureHookMap
}

export type CaptureSegmentFlags = {
  active: boolean
}

export interface CaptureHook {
  (query: string, capture: Capture, segment: CaptureSegment): void
}

export interface CaptureEvent {
  x: number
  y: number
}

export type CaptureHookMap = Map<string, CaptureHook>

export class Capture {

  /* 
  ================
      STATIC
  ================
  */

  static instances:     Map<string, Capture> = new Map()
  static events:        CaptureEvent[] = []
  static isInitialized: boolean = false
  static touchStart:    {x: number, y: number} = {x: 0, y: 0}

  static updateAll() {    
    while(this.events.length > 0) {
      const e = this.events.shift()

      if(!e) break
      
      this.instances.forEach(capture => {
        const globalMult = 1
        const increment = e.y * globalMult

        capture.scroll = clamp(capture.scroll + increment, 0, sum(...capture.segments.map(s => s.height)))
        console.log("-------------Instance update---------------")
        console.log("Capture.scroll: ", capture.scroll)

        let activeSegmentIndex = 0
        let accumulator = 0
        
        while(
          capture.scroll >= 0 
          && capture.scroll > accumulator + capture.segments[0].height
          && activeSegmentIndex < capture.segments.length - 1 
          && activeSegmentIndex >= 0
        ) {
          console.log("accumulator update")
          accumulator += capture.segments[activeSegmentIndex].height
          activeSegmentIndex++
        }

        capture.activeSegmentIndex = activeSegmentIndex

        capture.segments.forEach((segment, index) => {

          if(activeSegmentIndex < index) {
            segment.scroll = 0
          } else

          if(activeSegmentIndex > index) {
            segment.scroll = segment.height
          } else 

          if(activeSegmentIndex === index) {
            segment.scroll = capture.scroll - accumulator
            segment.scroll = clamp(segment.scroll, 0, segment.height)
            console.log(activeSegmentIndex, segment.scroll)
          } else
            
          {
            throw new Error("This should not happen.")
          }

          segment.hooks.forEach((hook, query) => {
            hook(query, capture, segment)
          })
        })
      })
    }
  }

  static init() {
    if(this.isInitialized) return
    
    document.addEventListener("wheel", (e) => {
      e.preventDefault()
      if(this.events.length === 0) { //@todo @hack i 'think' this helps with performance, I only allow the first event per frame currently. This is only on desktop.
        this.events.push({x: e.deltaX, y: e.deltaY}) 
      }
    }, {passive: false})

    // @todo unscrupulous mobile code
    // successful tests on: 
    // • Xiaomi Redmi Note 8, Brave browser
    document.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        this.touchStart.y = e.touches[0].clientY;
        this.touchStart.x = e.touches[0].clientX;

        if (window.scrollY === 0) {
          e.preventDefault(); // should block pull-down refresh ??
        }
      }
    }, {passive: false});

    document.addEventListener("touchmove", (e) => {
      if (e.touches.length === 1) {
        const event = {x: this.touchStart.x - e.touches[0].clientX, y: this.touchStart.y - e.touches[0].clientY}
        this.events.push(event)
        if (window.scrollY === 0 && event.y > 0) {
          e.preventDefault(); // should block pull-down refresh
        }
        this.touchStart = {x: e.touches[0].clientX, y: e.touches[0].clientY}
      }
    }, {passive: false});

    this.isInitialized = true
  }

  /* 
  ================
      INSTANCE
  ================
  */

  name:               string
  scroll:             number
  segments:           CaptureSegment[]
  activeSegmentIndex: number
  flags:              CaptureSegmentFlags

  constructor(name: string) {
    if(!Capture.isInitialized) throw new Error("Capture class not initialized yet. Please call Capture.init()")
    if(Capture.instances.has(name)) throw new Error("Name already exists. Choose a new name for your capture.")

    Capture.instances.set(name, this)

    this.name = name
    this.scroll = 0
    this.segments = []
    this.activeSegmentIndex = 0
    this.flags = {active: false}
  }

  segmentAdd(segment: CaptureSegment) {
    this.segments.push(segment)
  }
}