class AutoClicker {
  constructor(options) {
    if (options === undefined) {
      options = {};
    }
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
    document.getElementById('sectionLeft').insertAdjacentHTML('beforeend',
`<div style="font-size: 1.5em; color: white; position: absolute; top: 75%; left: 1em;
             z-index: 10;" id="auto-clicker-infos">
  <strong>Conjure Baked Goods infos:</strong><br/>
  gain: <span id="auto-clicker-CBG-gain"
        title="Cookies gained when casting Conjure Baked Goods."></span><br/>
  keep: <span id="auto-clicker-CBG-bank"
        title="Keep this amount of cookies in bank to maximise CBG output."></span>
</div>`);
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

  beautifyAndUpdate(elementId, amount) {
    document.getElementById(elementId).textContent = Beautify(amount);
  }

  run() {
    // Spells
    if (!Game.hasBuff('Clot') && !Game.hasBuff('Magic inept')) {
      if (this.manaIsFull()) {
        this.cast(8);
      }
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

    // Infos
    let amount = Math.min(Game.cookies * 0.15, Game.cookiesPs * 1800);
    this.beautifyAndUpdate('auto-clicker-CBG-gain', amount);
    this.beautifyAndUpdate('auto-clicker-CBG-bank', Game.cookiesPs * 12000);
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

let launcher = new AutoClicker();
launcher.start();
