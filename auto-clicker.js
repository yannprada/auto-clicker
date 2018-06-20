let _ = msg => console.log(msg);

class AutoClicker {
  constructor(interval=10, debug=false) {
    this.grimoire = Game.Objects['Wizard tower'].minigame;
    this.spellButton = document.querySelector('#grimoireSpell0');
    this.interval = interval;
    this.debug = debug;
  }

  manaIsFull() {
    return this.grimoire.magic >= this.grimoire.magicM;
  }

  hasClotDebuff() {
    return Boolean(Game.hasBuff('Clot'));
  }

  conjureBakedGoods() {
    this.spellButton.click();
  }

  run() {
    if (this.manaIsFull() && !this.hasClotDebuff()) {
      if (this.debug) {
        _('Casting spell "Conjure Baked Goods"');
      }
      this.conjureBakedGoods();
    } else {
      if (this.debug) {
        _(`Conditions not met: {
          manaIsFull: ${this.manaIsFull()}, 
          hasClothDebuff: ${this.hasClotDebuff()}
        }`);
      }
    }
  }

  start() {
    if (this.debug) {
      _('Starting AutoClicker');
    }
    this.timerId = setInterval(this.run.bind(this), this.interval * 1000);
  }

  stop() {
    if (this.debug) {
      _('Stopping AutoClicker');
    }
    clearInterval(this.timerId);
  }
}

let launcher = new AutoClicker();
launcher.start();
