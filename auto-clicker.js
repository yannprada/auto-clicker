class AutoClicker {
  constructor(options) {
    this.interval = options.interval || 10;
    this.debug = options.debug || false;
    this.grimoire = Game.Objects['Wizard tower'].minigame;
    this.spells = {
      conjureBakedGoods: { id: 0 },
    }
    this.garden = Game.Objects['Farm'].minigame;
    this.seeds = {
      bakerWheat: { id: 0 },
    }
  }

  manaIsFull() {
    return this.grimoire.magic >= this.grimoire.magicM;
  }

  cast(spell) {
    document.querySelector(`#grimoireSpell${spell.id}`).click();
  }

  tileIsEmpty(x, y) {
    return this.garden.getTile(x, y)[0] == 0;
  }

  plant(seed, x, y) {
    this.garden.useTool(seed.id, x, y);
  }

  run() {
    // Spells
    if (this.manaIsFull() && !Game.hasBuff('Clot')) {
      this._('Casting spell "Conjure Baked Goods"');
      this.cast(spells.conjureBakedGoods);
    }

    // Garden
    for (let x = 0; x <= 6; x++) {
      for (let y = 0; y <= 6; y++) {
        if (this.garden.isTileUnlocked(x, y) && this.tileIsEmpty(x, y)) {
          this._(`Planting seed "Baker's Wheat" on tile [${x}, ${y}]`);
          this.plant(seeds.bakerWheat, x, y);
        }
      }
    }
  }

  start() {
    this._('Starting AutoClicker');
    this.timerId = setInterval(this.run.bind(this), this.interval * 1000);
  }

  stop() {
    this._('Stopping AutoClicker');
    clearInterval(this.timerId);
  }

  _(msg) {
    if (this.debug) { console.log(msg); }
  }
}

let launcher = new AutoClicker({debug: true});
launcher.start();
