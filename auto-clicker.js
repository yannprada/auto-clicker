class AutoClicker {
  constructor(options) {
    this.interval = options.interval || 10;
    this.debug = options.debug || false;
    this.grimoire = Game.Objects['Wizard tower'].minigame;
    this.spells = {
      conjureBakedGoods: {
        button: document.querySelector('#grimoireSpell0'),
        cast() { this.button.click(); },
      },
    }
  }

  manaIsFull() {
    return this.grimoire.magic >= this.grimoire.magicM;
  }

  run() {
    if (this.manaIsFull() && !Game.hasBuff('Clot')) {
      this._('Casting spell "Conjure Baked Goods"');
      this.spells.conjureBakedGoods.cast();
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
