
const CPSBUFFS = ['Frenzy', 'Dragon Harvest'];
const CPSDEBUFFS = ['Clot'];
for (let [buff, debuff] of Object.values(Game.goldenCookieBuildingBuffs)) {
  CPSBUFFS.push(buff);
  CPSDEBUFFS.push(debuff);
}

class AutoClickerModule {
  constructor(autoClicker) {
    this.activated = true;
    this.autoClicker = autoClicker;
    this._ = autoClicker._;
  }

  activate() { this.activated = true }
  deactivate() { this.activated = false }

  _isOneOfTheseBuffsActive(BuffList) {
    const buffs = Game.buffs;
    for (let buff in buffs) {
      if (BuffList.includes(buff)) {
        return true;
      }
    }
    return false;
  }

  aCpSBuffIsActive() {
    return this._isOneOfTheseBuffsActive(CPSBUFFS);
  }

  aCpSDebuffIsActive() {
    return this._isOneOfTheseBuffsActive(CPSDEBUFFS);
  }
}

class SpellCaster extends AutoClickerModule {
  constructor(autoClicker,
              options = {waitForCpSBuff: true, avoidCpSDebuff: true}) {
    super(autoClicker);
    this.waitForCpSBuff = options.waitForCpSBuff;
    this.avoidCpSDebuff = options.avoidCpSDebuff;
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
        (this.waitForCpSBuff && !this.aCpSBuffIsActive()) ||
        (this.avoidCpSDebuff && this.aCpSDebuffIsActive())
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
              options = {avoidCpSBuffs: true, waitForCpSDebuff: true}) {
    super(autoClicker);
    this.avoidCpSBuffs = options.avoidCpSBuffs;
    this.waitForCpSDebuff = options.waitForCpSDebuff;
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
        (this.avoidCpSBuffs && this.aCpSBuffIsActive()) ||
        (this.waitForCpSDebuff && !this.aCpSDebuffIsActive())
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
    style="font-size: 1.5em; text-align: right; z-index: 10;
           position: absolute; bottom: 5em; right: 0;
           color: white; background-color: rgba(0, 0, 0, 0.5)">
  <div style="margin: 0.5em;">
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
  </div>
</div>`);
  }

  beautifyAndUpdate(elementId, amount, color = false) {
    const element = document.getElementById(elementId);
    element.textContent = Beautify(amount);
    if (color) {
      element.style.color = color;
    }
  }

  run() {
    const maxGain = Game.cookiesPs * 1800;
    const gain = Math.min(Game.cookies * 0.15, maxGain);
    this.beautifyAndUpdate('auto-clicker-CBG-gain', gain,
      (gain >= maxGain) ? 'green' : 'red');
    this.beautifyAndUpdate('auto-clicker-CBG-max-gain', maxGain);
    this.beautifyAndUpdate('auto-clicker-CBG-bank', Game.cookiesPs * 12000);
  }
}

class AutoClicker {
  constructor(options = {interval: 1, debug: false}) {
    this.interval = options.interval;
    this.debug = options.debug;

    this.modules = [
      new SpellCaster(this, {waitForCpSBuff: true, avoidCpSDebuff: true}),
      new SeedPlanter(this, {avoidCpSBuffs: true, waitForCpSDebuff: true}),
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
