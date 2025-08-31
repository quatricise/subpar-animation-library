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

  constructor() {
    //@todo just temporary fill-in
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
  
  animate(): Animate {
    return this
  }

  classAdd(): Animate {
    return this
  }

  classRemove(): Animate {
    return this
  }

  then(fn: AnimationBranch): Animate {
    //code
    return this
  }

  thenAsync(fn: Function): Animate {
    // this method does not wait until resolving a promise, it just calls the function and moves on.
    // @todo which is just the same as .then(), fuck me i guess?
    // perhaps .then() does require a .thenComplete() to continue.
    return this
  }

  thenFail(): Animate {
    return this
  }

  thenSuccess(): Animate {
    return this
  }

  thenComplete(): Animate {
    return this
  }
  
  waitMS(): Animate {
    return this
  }

  waitFor(): Animate {
    return this
  }
}

Animate.batchDefine("button", [".button"], {}, 0)

/* 
Animate.batchRun("button")
.animate()
.router(condition, trueBranch, falseBranch)
.animate() //here - VERY IMPORTANT - this call follows regardless of which branch was selected in the router.

Animate.batchRun("button")
.animate()
.map(condition, branches<value, branch>, failBranch)
//here we can basically 'switch(condition)' on the condition, based on which value it is we choose a branch, getting an error if such branch does not exist.
//this would ideally, of course, be compile-time checked, but that's probably not possible since the condition could come from user interaction,
//so 'failBranch' is called when it's

Animate.batchRun("button")
.animate()
.if(condition)
.then()
.else()
.if(condition)
.then()
.else()

Animate.batchRun("button")
.animate()
.then()
.await() //just wait for onComplete(d) to run on the promise supplied by the .then() method. I suppose a Promise will need to be supplied by the .then method


*/

/* 
=========================
          GOALS
=========================
*/

// so how do I make an animation system that plugs into business logic and state logic, so that it's both decoupled and easy to understand but also super powerful
// the JS thingy I made recently is not really up to that task, it does animate, and if I rewrote it in TS it would be better, the actions are the main thing that need improvement

// > PUSHING STATE DATA IN
// this might be simpler than thought, you simply just apply styles to elements and that's how you change the website

// > INJECTION OF CUSTOM CODE
// I need to attach sequential methods to doing anything, which I already have in .then() so that's nice,
// but could I make it .then().then() ? as to chain multiple things to each other and then perhaps optionally wait for all of them or skip waiting for all of them
// the custom code and potential routing could be very very useful, as long as it's extremely general, so you can inject your own code

// > RELIABILITY AND ERRORS
// I like the idea of using a 'terminate' command, such as batchTerminate() and potentially some kind of guardrails that guarantee 
// you didn't forget about something or the animation didn't fail in any way. 
// additionally what if I want to fork and optionally wait for an async thingy that either fails or not fails, I can do branching by splitting the tree of following
// animations into two trees, which I almost had, but I had no option to wait for the nested trees to be awaited

// > COMPATIBILITY
// Animating is tricky since some browsers do not support some features or do not support them to be animatable.

// > WHAT (THE FUCK) IS THIS
// Is it a good idea to put async data and routing into an animation system? 
// Should I make a wrapper for GSAP instead? 
// I'm absolutely not sure what the use-case is here, so I have to stop building this.