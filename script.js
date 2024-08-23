// 제어 클래스
class Main {
  constructor() {
    this.currentScreen = null;
    window.addEventListener("resize", this.resize.bind(this));
    this.loadScreen(new IntroPage(this));
  }
  resize() {
    if (this.currentScreen) {
      this.currentScreen.resize();
    }
  }
  loadScreen(screen) {
    if (this.currentScreen) {
      this.currentScreen.hide();
    }
    this.currentScreen = screen;
    this.currentScreen.show();
    this.resize();
  }
}

// 화면 베이스
class Screen {
  constructor(main, numCanvases = 1, fps = 60) {
    this.main = main;
    this.canvasList = [];
    this.contextList = [];
    this.animationFrameId = null;
    this.frameDuration = 1000 / fps;
    this.images = [];
    this.currentFrame = 0;
    this.lastFrameTime = 0;
    this.rendered = false;

    let canvasList = document.getElementsByClassName("canvas");
    if (canvasList.length < numCanvases) {
      for (let i = canvasList.length; i < numCanvases; i++) {
        const canvas = document.createElement("canvas");
        canvas.setAttribute("class", "canvas");
        document.body.appendChild(canvas);
      }
    }

    for (let i = 0; i < canvasList.length; i++) {
      this.canvasList.push(canvasList[i]);
      this.contextList.push(canvasList[i].getContext("2d"));
    }

    this.eventHandlers = {};
    this.addEvents();
  }

  addEvent(type, handler) {
    this.eventHandlers[type] = handler;
    window.addEventListener(type, handler);
  }

  removeEvent(type) {
    if (this.eventHandlers[type]) {
      window.removeEventListener(type, this.eventHandlers[type]);
      delete this.eventHandlers[type];
    }
  }

  loadData() {}

  addEvents() {
    this.addEvent("resize", this.resize.bind(this));
  }

  removeEvents() {
    Object.keys(this.eventHandlers).forEach((type) => this.removeEvent(type));
  }

  async show() {
    this.resize();
    await this.loadData();
    this.setAnimate();
  }

  hide() {
    this.cancelAnimate();
    this.removeEvents();
  }

  setAnimate() {
    const animate = (timestamp) => {
      this.render(timestamp, this.animationFrameId);
      this.animationFrameId = requestAnimationFrame(animate);
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }

  cancelAnimate() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  render() {}

  resize() {
    this.canvasList.forEach((canvas) => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }
}

class IntroPage extends Screen {
  constructor(main, fps = 10) {
    super(main);
    this.imagePaths = Array.from(
      { length: 40 },
      (_, i) => `./images/11zon_${i + 1}.jpeg`
    );
    this.frameDuration = 1000 / fps;
  }

  loadData = () => {
    return new Promise((resolve, reject) => {
      this.imagePaths.forEach((path, index) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
          this.images[index] = img;
        };
      });
      resolve();
    });
  };

  addEvents() {
    super.addEvents();
    this.addEvent("click", this.clickEvent.bind(this));
    this.addEvent("keydown", this.keyDownEvent.bind(this));
  }

  clickEvent(e) {
    console.log("click");
    //this.main.loadScreen(new BattleScreen(this.main));
  }

  keyDownEvent(e) {
    console.log(e.key);
    if (e.key === "Enter") {
      //this.main.loadScreen(new BattleScreen(this.main));
    }
  }

  render(timestamp, frame, ctx) {
    if (this.lastFrameTime === 0) this.lastFrameTime = timestamp;

    const elapsedTime = timestamp - this.lastFrameTime;

    if (elapsedTime >= this.frameDuration) {
      this.currentFrame = (this.currentFrame + 1) % this.images.length;
      this.lastFrameTime = timestamp;
      this.rendered = false;
    }
    if (
      this.images[this.currentFrame] != undefined &&
      this.rendered === false
    ) {
      const canvasWidth = this.canvasList[0].width;
      const canvasHeight = this.canvasList[0].height;
      this.contextList[0].drawImage(
        this.images[this.currentFrame],
        0,
        0,
        canvasWidth,
        canvasHeight
      );
      this.rendered = true;
    }
  }
}

window.onload = () => {
  mainCanvas = new Main();
};
