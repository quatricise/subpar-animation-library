export type AnimationBatch = {
  batchname:    string
  initialStyle: Partial<CSSStyleDeclaration>
  queries:      Set<string>
  elements:     HTMLElement[] //this is just the result of the 'queries' which are all run on Animate.batchRun() or Animate.batchDefine()
}

export enum AnimationBatchState {
  Initial,
  Paused,
  Running,
  Finished,
}

export type AnimationAction = 
| {
  type: "Animate", 
  query: string, 
  keyframes:  Keyframe[], 
  options: KeyframeAnimationOptions, 
  delayMS: number,
}
| {
  type: "Set", 
  query: string,
  style: Partial<CSSStyleDeclaration>, 
  attributes: Record<string, string>,
}
| {
  type: "ClassAdd", 
  query: string, 
  classes: string[],
}
| {
  type: "ClassRemove", 
  query: string, 
  classes: string[],
}
| {
  type: "WaitMS",
  durationMS: number,
}
| {
  type: "WaitFor", 
  query: string,
}
| {
  type: "Then", 
  function: Function,
}
| {
  type: "ResetInitialStyle",
  query: string,
};


export enum AnimationErrorHandlingMethod {
  Alert,
  Log,
  Error,
}

// this just means an animation branch is just a function that returns a promise so we can continue upon resolving, idk
// it 'implicitly' also runs a bunch of animations but it literally is just some async code, which is better because it can be anything
export interface AnimationBranch {
  (): Promise<unknown>;
}



export class Animate {

  /* 
  ================
      STATIC
  ================
  */

  static batches: Map<string, AnimationBatch>
  static batchCurrent: AnimationBatch

  static batchDefine(
      batchname: string,
      queries: string[], //here this can be typed, @todo check that chatgpt log
      initialStyle: Partial<CSSStyleDeclaration>,
      errorHandlingMethod: AnimationErrorHandlingMethod,
  ): void {
    
  }

  static batchRun(): Animate {
    return new Animate()
  }

  static queryCheck(query: string): void {
    // tests whether a supplied CSS query is found in the queries defined with batchDefine(), this is necessary error-checking because I cannot force people to
    // make enums out of their strings or something crazy like that to get complete type safety, because having to type everything as an enum would be so annoying I am willing to
    // introduce this overhead
    // we don't have string pointers so I cannot do much here
  }

  /* 
  ================
      INSTANCE
  ================
  */

  batchname: string
  batch: AnimationBatch
  state: AnimationBatchState
  actions: AnimationAction[]
  actionCurrent: number

  constructor() { //@todo just temporary fill-in with empty or useless stuff
    this.batchname = ""
    this.batch = {batchname: "", elements: [], initialStyle: {}, queries: new Set()}
    this.state = AnimationBatchState.Initial
    this.actions = []
    this.actionCurrent = 0
  }

  actionDoNext(): void {
    this.actionCurrent++
    const action = this.actions[this.actionCurrent]

    switch(action.type) {
      case "Animate": {
        
        break
      }
      case "Set": {
        
        break
      }
      case "ClassAdd": {
        
        break
      }
      case "ClassRemove": {
        
        break
      }
      case "WaitMS": {
        
        break
      }
      case "WaitFor": {
        
        break
      }
      case "Then": {
        
        break
      }
      case "ResetInitialStyle": {
        
        break
      }
      default: {
        const _exhaustiveCheck: never = action;
        throw new Error(`Unhandled action: ${_exhaustiveCheck}`);
      }
    }
  }
  
  animate() {
  }

  classAdd() {
  }

  classRemove() {
  }

  then(fn: AnimationBranch) {
  }

  thenAsync(fn: Function) {
    // this method does not wait until resolving a promise, it just calls the function and moves on.
    // @todo which is just the same as .then(), fuck me i guess?
    // perhaps .then() does require a .thenComplete() to continue.
  }

  thenFail() {
  }

  thenSuccess() {
  }

  thenComplete() {
  }
  
  waitMS() {
  }

  waitFor() { //wait for a specific anim to finish
  }

  waitTrigger() {

  }
}

// ! a much better syntax that does not use the stupid dot(.) syntax, because now any custom logic can run betwen
// the function animateButton is just a way to modularize a larger system of animations
function animateButton {
  const a = Animate

  // begins a new definition of an animation "button", all subsequent operations pertain to this animation stored under the name "button"
  a.batchDefineBegin("button", [".button"], {}, 0)

  a.blabla1()
  a.blabla2()

  if(condition) {
    a.blablaTrue()
  } else {
    a.blablaFalse()
  }

  for(let i = 0; i < 5; ++i) {
    a.blabla("button", [{}], {duration: 100 * i})
  }

  // ends the definition for the animation sequence or logic that is "button"
  Animate.batchDefineEnd("button")
}

//activates the animation "button"
Animate.batchRun("button")


/*
=========================
          GOALS
=========================
*/

// this is part of a larger effort to create a sensible JS framework, combining Animate and Capture and HTML and NCSS classes into a system with a centralized state
// somewhat like a game, also where animations and everything is done per-frame
// Capture.ts already runs per frame, except there is a slight issue that delta-time is a complicated thing.
// also doing animations without the native tweens and element.animate could be too painful. Except not, I've done it before on Star Lib.
// plug this into Capture.
// animations should be capable of scrubbing, this means divorcing with element.animate API completely and just run this via a custom ticker