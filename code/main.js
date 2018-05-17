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
        sprite: 'purple_link',
        sheet: 'purple_link',
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
      } else if (this.p.health > 0) {
        this.play('stand_' + this.p.direction);
      } else {
        this.destroy();
      }
    },

    hit: function(dmg) {
      this.p.health -= dmg;
      if (this.p.health <= 0) {
        this.p.dead = true;
      }
    },
  });

  Q.animations('purple_link', {
    walk_up: { frames: [1, 2, 3, 4, 5, 6], rate: 1 / 15 },
    walk_left: { frames: [12, 13, 14, 15, 16, 17], rate: 1 / 15 },
    walk_right: { frames: [12, 13, 14, 15, 16, 17], rate: 1 / 15 },
    walk_down: { frames: [23, 24, 25, 26, 27, 28], rate: 1 / 15 },
    stand_up: { frames: [0], rate: 1 / 5 },
    stand_left: { frames: [11], rate: 1 / 5 },
    stand_right: { frames: [11], rate: 1 / 5 },
    stand_down: { frames: [22], rate: 1 / 5 },
  });

  ////////// ENEMIES //////////

  Q.Sprite.extend('Darknut', {
    init: function(p) {
      this._super(p, {
        sheet: 'darknut',
        sprite: 'darknut',
        gravity: 0,
        tile_size: 16,
        damage: 0,
      });

      this.add('2d, aiTrack, animation');
    },

    step: function(dt) {
      if (this.p.attacking) {
        // TODO add darknut attack animations
        console.log('die!');
        this.p.attacking = false;
      }
      // TODO add darknut movement animations
    },
  });

  ////////// Load TMX level //////////
  Q.scene('test', function(stage) {
    Q.stageTMX('Castle_Room1.tmx', stage);

    const player = stage.insert(new Q.Player({ x: 300, y: 400 }));
    stage.insert(
      new Q.Darknut({ x: 400, y: 300, vfactor: 3, attack_range: 0 })
    );
  });

  Q.load(
    'purple_link.png, purple_link.json, darknut.png, darknut.json',
    function() {
      Q.compileSheets('purple_link.png', 'purple_link.json');
      Q.compileSheets('darknut.png', 'darknut.json');
      Q.loadTMX('Castle_Room1.tmx', function() {
        Q.stageScene('test');
      });
    }
  );
};
