import "phaser";

export default class CatRepair extends Phaser.Scene {
  catSit: Phaser.GameObjects.Image;
  tailWag: number = 1;
  timer: Phaser.Time.TimerEvent;
  catWalk: Phaser.GameObjects.Image;
  isCatWalk: boolean = true;
  isCatRight: boolean = true;
  wardrobe: Phaser.GameObjects.Image;
  catGrab: Phaser.GameObjects.Image;
  shelves: Phaser.Geom.Point[];
  catTimer: Phaser.Time.TimerEvent;
  pileLocations: {
    [key: string]: [Phaser.Geom.Point, [number, number]];
  };
  clothes: Phaser.GameObjects.Image[];
  pileSize: number = 0;
  bag1: Phaser.GameObjects.Image;
  bag2: Phaser.GameObjects.Image;
  bag3: Phaser.GameObjects.Image;
  clothesInBags: string[];
  bagsNum: number = 5;
  bag4: Phaser.GameObjects.Image;
  bag5: Phaser.GameObjects.Image;
  bagMap: Map<Phaser.GameObjects.Image, number[]>;
  inMouseDownHandler: boolean = true;

  constructor() {
    super("catRepair");
  }
  init() {}

  preload() {
    this.load.image("bag", "assets/bag.png");
    this.load.image("cat_grab", "assets/cat_grab.png");
    this.load.image("cat_sit_1", "assets/cat_sit_right_1.png");
    this.load.image("cat_sit_2", "assets/cat_sit_right_2.png");
    this.load.image("cat_walk", "assets/cat_walk.png");
    this.load.image("wardrobe", "assets/wardrobe.png");
    this.load.image("cloth1", "assets/cloth1.png");
    this.load.image("cloth2", "assets/cloth2.png");
    this.load.image("cloth3", "assets/cloth3.png");
    this.load.image("cloth4", "assets/cloth4.png");
    this.load.image("cloth5", "assets/cloth5.png");

    this.load.image("endCat", "assets/endCat.png");
    this.load.image("endMe", "assets/endMe.png");

    this.preloadCastle();
  }
  preloadCastle() {
    this.load.image("pile1", "assets/pile1.png");
    this.load.image("pile2", "assets/pile1.png");
    this.load.image("pile3", "assets/pile1.png");
    this.load.image("pile4", "assets/pile2.png");
    this.load.image("pile5", "assets/pile2.png");
    this.load.image("pile6", "assets/castle.png");

    this.pileLocations = {
      pile1: [new Phaser.Geom.Point(250, 600), [250, 100]],
      pile2: [new Phaser.Geom.Point(320, 580), [250, 100]],
      pile3: [new Phaser.Geom.Point(170, 580), [250, 100]],
      pile4: [new Phaser.Geom.Point(250, 500), [400, 200]],
      pile5: [new Phaser.Geom.Point(250, 480), [470, 370]],
      pile6: [new Phaser.Geom.Point(250, 390), [400, 500]]
    };
  }

  create() {
    this.wardrobe = this.add.image(700, 400, "wardrobe");
    this.wardrobeInitParts();

    this.clothesInBags = ["cloth1", "cloth2", "cloth3", "cloth4", "cloth5"];

    this.bag1 = this.add.image(1060, 420, "bag");
    this.bag2 = this.add.image(1080, 450, "bag");
    this.bag3 = this.add.image(1100, 480, "bag");
    this.bag4 = this.add.image(1120, 510, "bag");
    this.bag5 = this.add.image(1140, 540, "bag");

    this.bagMap = new Map<Phaser.GameObjects.Image, number[]>();
    this.bagMap.set(this.bag1, [this.bag1.x, this.bag1.y]);
    this.bagMap.set(this.bag2, [this.bag2.x, this.bag2.y]);
    this.bagMap.set(this.bag3, [this.bag3.x, this.bag3.y]);
    this.bagMap.set(this.bag4, [this.bag4.x, this.bag4.y]);
    this.bagMap.set(this.bag5, [this.bag5.x, this.bag5.y]);

    this.bag1.setDisplaySize(200, 200);
    this.bag2.setDisplaySize(200, 200);
    this.bag3.setDisplaySize(200, 200);
    this.bag4.setDisplaySize(200, 200);
    this.bag5.setDisplaySize(200, 200);
    this.bag1.setInteractive();
    this.bag2.setInteractive();
    this.bag3.setInteractive();
    this.bag4.setInteractive();
    this.bag5.setInteractive();
    this.input.setDraggable(this.bag1);
    this.input.setDraggable(this.bag2);
    this.input.setDraggable(this.bag3);
    this.input.setDraggable(this.bag4);
    this.input.setDraggable(this.bag5);

    this.input.topOnly = true;
    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      gameObject.setTexture(this.clothesInBags[this.bagsNum - 1]);
      gameObject.setDisplaySize(240, 250);
    });
    this.input.on("dragend", (pointer, gameObject, dropped) => {
      const wardrobeRect = this.wardrobe.getBounds();
      const objectRect = gameObject.getBounds();

      if (
        Phaser.Geom.Intersects.RectangleToRectangle(wardrobeRect, objectRect)
      ) {
        gameObject.setVisible(false);
        this.bagsNum--;
      } else {
        gameObject.setTexture("bag");
        gameObject.setDisplaySize(200, 200);
        gameObject.x = this.bagMap.get(gameObject)[0];
        gameObject.y = this.bagMap.get(gameObject)[1];
      }
    });

    this.catSit = this.add.image(300, 550, "cat_sit_1");
    this.catSit.setDisplaySize(200, 200);
    this.catGrab = this.add.image(800, 120, "cat_grab");
    this.catGrab.setDisplaySize(200, 200);
    this.catGrab.setVisible(false);
    this.catWalk = this.add.image(600, 55, "cat_walk");
    this.catWalk.setDisplaySize(180, 180);
    this.catWalk.setVisible(false);

    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.doTailWag,
      callbackScope: this,
      repeat: 4
    });
    this.catTimer = this.time.addEvent({
      // TODO turn off when the game ends
      delay: 2000,
      callback: this.catDoingTrouble,
      callbackScope: this,
      loop: true,
      paused: true
    });

    this.clothes = [];
    for (const pile in this.pileLocations) {
      const { x, y } = this.pileLocations[pile][0];
      const image = this.add.image(x, y, pile);
      const [width, height] = this.pileLocations[pile][1];
      image.setDisplaySize(width, height);
      this.clothes.push(image);
      image.setVisible(false);
    }

    // const graphics = this.add.graphics({ fillStyle: { color: 0x2266aa } });
    // graphics.fillPoint(785, 250, 10);
  }
  wardrobeInitParts() {
    this.shelves = [
      new Phaser.Geom.Point(785, 250),
      new Phaser.Geom.Point(785, 155),
      new Phaser.Geom.Point(595, 155),
      new Phaser.Geom.Point(595, 250),
      new Phaser.Geom.Point(595, 330),
      new Phaser.Geom.Point(595, 420)
    ];

    // const graphics = this.add.graphics({ fillStyle: { color: 0x2266aa } });
    // graphics.fillPoint(785, 250, 10);
    // graphics.fillPoint(785, 155, 10);
    // graphics.fillPoint(595, 155, 10);
    // graphics.fillPoint(595, 250, 10);
    // graphics.fillPoint(595, 330, 10);
    // graphics.fillPoint(595, 420, 10);
  }

  endGame(winner: "cat" | "me") {
    this.scene.pause();
    if (winner === "cat") {
      this.add.image(0, 0, "endCat").setOrigin(0);
    } else {
      this.add.image(0, 0, "endMe").setOrigin(0);
    }
  }

  catDoingTrouble() {
    let randomShelf = Math.floor(Math.random() * 6);
    if (Math.random() < 0.5) {
      this.isCatWalk = false;
      this.catGrab.setVisible(true);

      this.catGrab.x = this.shelves[randomShelf].x;
      this.catGrab.y = this.shelves[randomShelf].y;
      this.catWalk.setVisible(false);

      if (this.pileSize < this.clothes.length) {
        if (this.pileSize === this.clothes.length - 1) {
          this.clothes.forEach(pile => {
            pile.setVisible(false);
          });
        }
        this.clothes[this.pileSize].setVisible(true);
        this.pileSize++;
        this.pileClickable(this.clothes[this.pileSize - 1]);

        if (this.pileSize >= this.clothes.length) {
          this.endGame("cat");
        }
      }

      this.time.delayedCall(
        500,
        function() {
          this.catGrab.setVisible(false);
          this.catWalk.setVisible(true);
          this.isCatWalk = true;
        },
        [],
        this
      );
    }
  }
  pileClickable(pile: Phaser.GameObjects.Image) {
    pile
      .setInteractive()
      .on("pointerdown", (pointer, localX, localY, event) => {
        if (this.inMouseDownHandler) {
          this.pileSize--;
          this.clothes[this.pileSize].setVisible(false);
          this.inMouseDownHandler = false;
        }
      })
      .on("pointerup", () => {
        this.inMouseDownHandler = true;
      });
  }

  update() {
    if (this.isCatWalk) {
      if (this.isCatRight) {
        if (this.catWalk.x < this.getWardrobeEdge(1)) {
          this.catWalk.x += 0.5;
        } else {
          this.isCatRight = false;
          this.catWalk.flipX = false;
        }
      } else {
        if (this.catWalk.x > this.getWardrobeEdge(-1)) {
          this.catWalk.x -= 0.5;
        } else {
          this.isCatRight = true;
          this.catWalk.flipX = true;
        }
      }
    }

    if (this.bagsNum === 0 && this.pileSize === 0) {
      this.endGame("me");
    }
  }

  getWardrobeEdge(direction: -1 | 1) {
    return this.wardrobe.x + (direction * this.wardrobe.displayWidth) / 4;
  }

  startCatPlay() {
    this.catSit.setVisible(false);
    this.catWalk.setVisible(true);
    this.catWalk.flipX = true;
    this.catTimer.paused = false;
  }

  doTailWag() {
    if (this.tailWag % 2 === 0) {
      this.catSit.setTexture("cat_sit_2");
    } else {
      this.catSit.setTexture("cat_sit_1");
    }
    this.tailWag++;
    this.catSit.setDisplaySize(200, 200);

    if (this.timer.getOverallProgress() === 1) {
      this.startCatPlay();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#FFFFFF",
  width: 1400,
  height: 660,
  scene: CatRepair
};

const game = new Phaser.Game(config);
