class AutoClicker {
  constructor(options) {
    this.interval = options.interval || 10;
    this.debug = options.debug || false;
    this.grimoire = Game.Objects['Wizard tower'].minigame;
    this.spells = {
      0: 'Conjure Baked Goods',
      1: 'Force the Hand of Fate',
      2: 'Stretch Time',
      3: 'Spontaneous Edifice',
      4: 'Haggler\'s Charm',
      5: 'Summon Crafting Pixies',
      6: 'Ganbler\'s Fever Dream',
      7: 'Resurrect Abomination',
      8: 'Diminish Ineptitude',
    }
    this.garden = Game.Objects['Farm'].minigame;
    this.seeds = {
      0: 'Baker\'s Wheat',
    }
  }

  manaIsFull() {
    return this.grimoire.magic >= this.grimoire.magicM;
  }

  cast(spellId) {
    this._(`Casting spell "${this.spells[spellId]}"`);
    document.querySelector(`#grimoireSpell${spellId}`).click();
  }

  tileIsEmpty(x, y) {
    return this.garden.getTile(x, y)[0] == 0;
  }

  plant(seedId, x, y) {
    this._(`Planting seed "${this.seeds[seedId]}" on tile [${x}, ${y}]`);
    this.garden.useTool(seedId, x, y);
  }

  run() {
    // Spells
    if (this.manaIsFull() && !Game.hasBuff('Clot') && !Game.hasBuff('Magic inept')) {
      this.cast(8);
      if (Game.hasBuff('Magic adept')) {
        this.cast(0);
      }
    }

    // Garden
    for (let x = 0; x <= 6; x++) {
      for (let y = 0; y <= 6; y++) {
        if (this.garden.isTileUnlocked(x, y) && this.tileIsEmpty(x, y)) {
          this.plant(0, x, y);
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
