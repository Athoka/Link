const game = function() {
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
    init: function(p) {
      this._super(p, {
        sprite: 'link',
        sheet: 'walk',
        direction: 'up',
        health: 3,
        stepDistance: 16,
        stepDelay: 0.2,
        gravity: 0,
      });

      this.add('2d, stepControls, animation');

      this.on('hit.sprite', function(collision) {
        //TODO
      });
    },

    step: function(dt) {
      dirs = ['up', 'down', 'left', 'right'];
      if (!Q.inputs[this.p.direction]) {
        for (d in dirs) {
          if (Q.inputs[dirs[d]]) {
            this.p.direction = dirs[d];
            break;
          }
        }
      }

      if (this.p.direction == 'right') {
        this.p.flip = 'x';
      } else {
        this.p.flip = '';
      }

      if (this.p.stepping && this.p.health > 0) {
        this.play('walk_' + this.p.direction);
      } else {
        this.play('stand_' + this.p.direction);
      }
    },

    hit: function(dmg) {
      this.p.health -= dmg;
      if (this.p.health <= 0) {
        this.p.dead = true;
      }
    },
  });

  Q.animations('link', {
    walk_up: { frames: [0, 1, 2, 3, 4], rate: 1 / 15 },
    walk_left: { frames: [5, 6, 7, 8, 9], rate: 1 / 15 },
    walk_right: { frames: [5, 6, 7, 8, 9], rate: 1 / 15 },
    walk_down: { frames: [10, 11, 12, 13, 14], rate: 1 / 15 },
    stand_up: { frames: [0], rate: 1 / 5 },
    stand_left: { frames: [5], rate: 1 / 5 },
    stand_right: { frames: [5], rate: 1 / 5 },
    stand_down: { frames: [11], rate: 1 / 5 },
  });

  ////////// ENEMIES //////////

  //// Default component ////
  Q.component('defaultEnemy', {
    added: function() {
      this.entity.on('bump.left,bump.right,bump.bottom,bump.top', function(
        collision
      ) {
        if (collision.obj.isA('Player')) {
          collision.obj.hit(1);
          console.log('whops');
        }
      });
    },
  });

  ////////// Load TMX level //////////
  Q.scene('test', function(stage) {
    Q.stageTMX('Castle_Room2.tmx', stage);

    const player = stage.insert(new Q.Player({ x: 300, y: 300 }));
  });

  Q.load('walk.png, walk.json', function() {
    Q.compileSheets('walk.png', 'walk.json');
    Q.loadTMX('Castle_Room2.tmx', function() {
      Q.stageScene('test');
    });
  });
};
