import { clamp, sum } from "./utils.js"
import { Vector2 } from "./vector2.js"

export type CaptureSegment = {
  height: number
  scroll: number
  hooks:  CaptureHookMap
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

  static instances:             Map<string, Capture> = new Map()
  static events:                CaptureEvent[] = []
  static touchStart:            {x: number, y: number} = {x: 0, y: 0}
  static scrollWidget:          HTMLElement
  static scrollWidgetPosition:  Vector2
  static scrollWidgetSize:      number = 24 //@todo store this somewhere so the Sass value is also derived from there. I guess I could just style the widget in this class tho.
  static mouse:                 {positionClient: Vector2, positionPage: Vector2}

  /* flags */
  static isInitialized:         boolean = false
  static isScrollwidgetVisible: boolean = false

  static frameUpdate() {
    
    // @todo technically there is no use for the X coordinate of the moveVector, it just seems like it could become useful in the future, so Idk yet. Like a 2D scrolling, a trackpad sort of thing.
    // there could genuinely be some cool uses for it in the future

    const moveVector: Vector2 = {x: sum(...this.events.map(e => e.x)) ?? 0, y: sum(...this.events.map(e => e.y)) ?? 0}

    if(this.isScrollwidgetVisible) {
      const speed = 0.04 // 0.0 -> 1.0
      const minDistance = 12 //in px from the widget's center
      const diffY = (this.mouse.positionClient.y - this.scrollWidgetPosition.y)

      if(Math.abs(diffY) > minDistance) {
        // moveVector.y += diffY * speed //basic linear
        moveVector.y += (diffY + (Math.abs(diffY) * diffY/150)) * speed //a little power-of-two
      }
    }

    if(moveVector.y !== 0) {
      this.instances.forEach(capture => {

        const isAtBoundsAndWouldNotChange = 
        (moveVector.y >= 0 && capture.scroll === capture.getTotalSegmentLength())
        || (moveVector.y <= 0 && capture.scroll === 0)

        if(isAtBoundsAndWouldNotChange) return //return if the move vector would not produce meaningful change

        const globalMult = 1
        const increment = moveVector.y * globalMult

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
            console.log("activeSegmentIndex", activeSegmentIndex)
            console.log("segment.scroll", segment.scroll)
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
    
    
    this.events = [] 
    //I do the emptying here, but it might change, so far I am only accumulating scroll events and those resolve to a Vector2
  }

  static init() {
    if(this.isInitialized) return

    this.mouse = {positionClient: {x: 0, y: 0}, positionPage: {x: 0, y: 0}}
    
    document.addEventListener("wheel", (e) => {
      e.preventDefault()
      this.events.push({x: e.deltaX, y: e.deltaY})
    }, {passive: false})

    document.addEventListener("mousedown", (e) => {
      if(e.button === 1) { //if MMB
        this.scrollWidgetShow(e)
      }
      else {
        this.scrollWidgetHide()
      }
    })

    document.addEventListener("mouseup", (e) => {
      
    })

    document.addEventListener("mousemove", (e) => {
      this.mouse.positionClient.x = e.clientX
      this.mouse.positionClient.y = e.clientY
      this.mouse.positionPage.x = e.pageX
      this.mouse.positionPage.y = e.pageY
    })

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

    this.scrollWidget = document.createElement("div")
    this.scrollWidget.classList.add("widget", "widget--scroll")
    this.scrollWidget.style.left = "calc(50vw - 10px)"
    this.scrollWidget.style.top = "calc(50vh - 10px)"
    this.scrollWidget.style.display = "none"
    document.body.append(this.scrollWidget)

    this.isInitialized = true
  }

  static scrollWidgetShow(e: MouseEvent) { //super hacky, just want something so I don't forget about this
    this.scrollWidget.style.display = "block"
    this.scrollWidgetPosition = {x: e.clientX, y: e.clientY}
    this.scrollWidget.style.left = this.scrollWidgetPosition.x - (this.scrollWidgetSize/2) + "px"
    this.scrollWidget.style.top =  this.scrollWidgetPosition.y - (this.scrollWidgetSize/2) + "px"
    this.isScrollwidgetVisible = true
  }

  static scrollWidgetHide() {
    this.scrollWidget.style.display = "none"
    this.isScrollwidgetVisible = false
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

  addSegment(segment: CaptureSegment) {
    this.segments.push(segment)
  }

  getTotalSegmentLength(): number {
    return sum(...this.segments.map(s => s.height))
  }
}