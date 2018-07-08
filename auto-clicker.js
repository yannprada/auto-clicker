
let buildingBuffs = Object.values(Game.goldenCookieBuildingBuffs).reduce(
  (acc, next) => acc.concat(next), []);
const CPSBOOSTS = ['Frenzy', 'Dragon Harvest'].concat(...buildingBuffs);


class AutoClickerModule {
  constructor(autoClicker) {
    this.activated = true;
    this.autoClicker = autoClicker;
    this._ = autoClicker._;
  }

  activate() { this.activated = true }
  deactivate() { this.activated = false }

  aBoostIsActive() {
    const buffs = Game.buffs;
    for (let buff in buffs) {
      if (CPSBOOSTS.includes(buff)) {
        return true;
      }
    }
    return false;
  }
}

class SpellCaster extends AutoClickerModule {
  constructor(autoClicker,
              options = {waitForBoost: true, avoidClot: true}) {
    super(autoClicker);
    this.waitForBoost = options.waitForBoost;
    this.avoidClot = options.avoidClot;
    this.grimoire = Game.Objects['Wizard tower'].minigame;
  }

  manaIsFull() {
    return this.grimoire.magic >= this.grimoire.magicM;
  }

  hasEnoughMagic(spell) {
    return this.grimoire.getSpellCost(spell) <= this.grimoire.magic;
  }

  getSpellButton(spell) {
    return document.querySelector(`#grimoireSpell${spell.id}`);
  }

  cast(spell) {
    if (this.hasEnoughMagic(spell)) {
      this._(`Casting spell "${spell.name}"`);
      this.getSpellButton(spell).click();
    }
  }

  run() {
    if (
        !this.activated ||
        Game.hasBuff('Magic inept') ||
        (this.waitForBoost && !this.aBoostIsActive()) ||
        (this.avoidClot && Game.hasBuff('Clot'))
      ) {
      return;
    }
    if (this.manaIsFull()) {
      this.cast(this.grimoire.spells['diminish ineptitude']);
    }
    if (Game.hasBuff('Magic adept')) {
      this.cast(this.grimoire.spells['conjure baked goods']);
    }
  }
}

class SeedPlanter extends AutoClickerModule {
  constructor(autoClicker,
              options = {avoidBoosts: true, waitForClot: false}) {
    super(autoClicker);
    this.avoidBoosts = options.avoidBoosts;
    this.waitForClot = options.waitForClot;
    this.garden = Game.Objects['Farm'].minigame;
    this.seeds = {
      0: 'Baker\'s Wheat',
    };
  }

  tileIsEmpty(x, y) {
    return this.garden.getTile(x, y)[0] == 0;
  }

  plant(seedId, x, y) {
    this._(`Planting seed "${this.seeds[seedId]}" on tile [${x}, ${y}]`);
    this.garden.useTool(seedId, x, y);
  }

  run() {
    if (
        !this.activated ||
        (this.avoidBoosts && this.aBoostIsActive()) ||
        (this.waitForClot && !Game.hasBuff('Clot'))
      ) {
      return;
    }
    for (let x = 0; x <= 6; x++) {
      for (let y = 0; y <= 6; y++) {
        if (this.garden.isTileUnlocked(x, y) && this.tileIsEmpty(x, y)) {
          setTimeout(() => this.plant(0, x, y), 10);
        }
      }
    }
  }
}

class ShimmerClicker extends AutoClickerModule {
  constructor(autoClicker,
              allow = {golden: true, wrath: false, reindeer: true}) {
    super(autoClicker);
    this.allow = allow;
  }

  click(shimmer, name) {
    this._(`Clicking a ${name}`);
    setTimeout(() => shimmer.pop(), 10);
  }

  run() {
    if (!this.activated) {
      return;
    }
    Game.shimmers.forEach((shimmer) => {
      if (shimmer.type == 'golden') {
        if (this.allow.golden && !shimmer.wrath) {
          this.click(shimmer, 'golden cookie');
        } else if (this.allow.wrath && shimmer.wrath) {
          this.click(shimmer, 'wrath cookie');
        }
      } else if (this.allow.reindeer && shimmer.type == 'reindeer') {
        this.click(shimmer, 'reindeer');
      }
    });
  }
}

class BetterUI extends AutoClickerModule {
  constructor(autoClicker) {
    super(autoClicker);
    document.getElementById('sectionLeft').insertAdjacentHTML('beforeend',
`<div id="auto-clicker-infos"
    style="font-size: 1.5em; color: white; text-align: right; z-index: 10;
           position: absolute; bottom: 5em; right: 1em; width: 100%;">
  <p style="font-weight: bold;">Conjure Baked Goods infos</p>
  <p title="Cookies gained when casting Conjure Baked Goods.">
    current gain:
    <span id="auto-clicker-CBG-gain"></span>
  </p>
  <p title="Maximum gain when casting Conjure Baked Goods (see below)">
    maximum gain:
    <span id="auto-clicker-CBG-max-gain"></span>
  </p>
  <p title="Keep this amount of cookies in bank to maximise CBG output.">
    keep in bank:
    <span id="auto-clicker-CBG-bank"></span>
  </p>
</div>`);
  }

  beautifyAndUpdate(elementId, amount) {
    document.getElementById(elementId).textContent = Beautify(amount);
  }

  run() {
    // TODO: add colors (green good, red bad, maybe ?)
    const maxGain = Game.cookiesPs * 1800;
    const gain = Math.min(Game.cookies * 0.15, maxGain);
    this.beautifyAndUpdate('auto-clicker-CBG-gain', gain);
    this.beautifyAndUpdate('auto-clicker-CBG-max-gain', maxGain);
    this.beautifyAndUpdate('auto-clicker-CBG-bank', Game.cookiesPs * 12000);
  }
}

class AutoClicker {
  constructor(options = {interval: 1, debug: false}) {
    this.interval = options.interval;
    this.debug = options.debug;

    this.modules = [
      new SpellCaster(this, {waitForBoost: true, avoidClot: true}),
      new SeedPlanter(this, {avoidBoosts: true, waitForClot: true}),
      new ShimmerClicker(this, {golden: true, wrath: true, reindeer: true}),
      new BetterUI(this),
    ];
  }

  getModule(name) {
    return this.modules.find((module) => module.constructor.name == name);
  }

  run() {
    this.modules.forEach((module) => {
      module.run();
    });
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

let autoClicker = new AutoClicker();
autoClicker.start();
