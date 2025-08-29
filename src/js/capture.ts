import { clamp, sum } from "./utils.js"

export type CaptureEvent = MouseEvent | PointerEvent

export type CaptureSegment = {
  height: number
  scroll: number
  hooks: Map<string, CaptureHook>
}

export type CaptureSegmentFlags = {
  active: boolean
}

export interface CaptureHook {
  (query: string, capture: Capture, segment: CaptureSegment): void
}

export class Capture {

  /* 
  ================
      STATIC
  ================
  */

  static instances: Map<string, Capture> = new Map()
  static events: CaptureEvent[] = []
  static isInitialized: boolean = false

  static updateAll() {
    while(this.events.length > 0) {
      const e = this.events.shift() as WheelEvent //@todo casting hack
      
      //this just registers new data because the queued-up events could have changed the scroll of each segment
      this.instances.forEach(capture => {
        capture.scroll = clamp(capture.scroll + e.deltaY, 0, sum(...capture.segments.map(s => s.height)))
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

      this.events.push(e)
    }, {passive: false})

    //@todo missing handling of finger touches

    this.isInitialized = true
  }

  /* 
  ================
      INSTANCE
  ================
  */

  name: string
  scroll: number
  segments: CaptureSegment[]
  activeSegmentIndex: number
  flags: CaptureSegmentFlags

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