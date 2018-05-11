const game = function () {
  ////////// Load Quintus object //////////
  const Q = (window.Q = Quintus()
    .include('Sprites, Scenes, Input, UI, Touch, TMX, Anim, 2D, Audio')
    .setup({
      width: 512,
      height: 512,
    })
    .controls()
    .touch());

  ////////// Player Sprite //////////
  Q.Sprite.extend('Player', {
    init: function (p) {
      this._super(p, {
        sprite: 'walk',
        sheet: 'walk_up',
        direction: 'up',
        x: 150,
        y: 380,
        dead: false,
        health: 3,
        stepDistance: 16,
        stepDelay: 0.2
      });

      this.add('2d, stepControls, animation');

      this.on('hit.sprite', function (collision) {
        //TODO
      });
    },

    step: function (dt) {

    },

    hit: function (dmg) {
      this.p.health -= dmg;
      if (this.p.health <= 0) {
        this.p.dead = true
      }
    },
  });


  ////////// ENEMIES //////////

  //// Default component ////
  Q.component('defaultEnemy', {
    added: function () {
      this.entity.on('bump.left,bump.right,bump.bottom,bump.top', function (collision) {
        if (collision.obj.isA('Player')) {
          collision.obj.hit(1);
          console.log('whops')
        }
      });
    },
  });

  ////////// Load TMX level //////////
  Q.scene('test', function (stage) {
    Q.stageTMX('Castle_Room_Final.tmx', stage);
  });

  Q.load(
    'walk.png, walk.json',
    function () {
      Q.compileSheets('walk.png', 'walk.json');
      Q.loadTMX('Castle_Room_Final.tmx', function () {
        Q.stageScene('test');
      });
    }
  );
};
