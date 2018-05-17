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
    init: function (p) {
      this._super(p, {
        sheet: 'darknut',
        sprite: 'darknut',
        gravity: 0,
        direction: 'down',
        tile_size: 16,
        damage: 1,
      });

      this.add('2d, aiTrack, animation');
    },

    step: function (dt) {
      if (this.p.vy > 0) {
        this.p.direction = 'down';
      } else if (this.p.vy < 0) {
        this.p.direction = 'up';
      }
      if (Math.abs(this.p.vx) > Math.abs(this.p.vy)) {
        if (this.p.vx > 0) {
          this.p.direction = 'right';
        } else if (this.p.vx < 0) {
          this.p.direction = 'left';
        }
      }

      if (this.p.direction === 'left') {
        this.p.flip = 'x';
      } else {
        this.p.flip = '';
      }

      if (this.p.attacking) {
        this.play('attack_' + this.p.direction);
        this.p.attacking = false;
      } else if (this.p.tracking) {
        this.play('walk_' + this.p.direction);
        this.p.tracking = false;
      } else {
        this.play('stand_' + this.p.direction);
      }
    },
  });

  Q.animations('darknut', {
    walk_up: { frames: [0, 1, 2], rate: 1 / 1 },
    walk_left: { frames: [6, 7, 8], rate: 1 / 5 },
    walk_right: { frames: [6, 7, 8], rate: 1 / 5 },
    walk_down: { frames: [12, 13, 14], rate: 1 / 5 },
    stand_up: { frames: [0], rate: 1 / 5 },
    stand_left: { frames: [6], rate: 1 / 5 },
    stand_right: { frames: [6], rate: 1 / 5 },
    stand_down: { frames: [12], rate: 1 / 5 },
    attack_up: { frames: [3, 4, 5], rate: 1 / 15, next: 'stand_up' },
    attack_left: { frames: [9, 10, 11], rate: 1 / 15, next: 'stand_left' },
    attack_right: { frames: [9, 10, 11], rate: 1 / 15, next: 'stand_right' },
    attack_down: { frames: [15, 16, 17], rate: 1 / 15, next: 'stand_down' },
  });


  ////////// TREASURE CHEST //////////

  Q.Sprite.extend('BigChest', {
    init: function(p) {
      this._super(p, {
         sheet: 'big_chest', 
         sprite: 'big_chest',
         frame: 0, 
         gravity: 0,
         open: false,
         opening: false
      });
      this.add('animation');
    }, 

    step: function(dt) {
      if(this.p.opening) {
        this.play('open');
        this.p.opening = false;
      } 
      if(this.p.open) {
        frame = 3;
      } else {
        frame = 0;
      }
    }, 

    hit: function() {
      if(!open) {
        open = true;
        opening = true;
      }
    } 
  });

  Q.animations('big_chest', {
    open: {frames: [2, 3, 4], rate: 1/5, loop: false}
  });


  ////////// Load TMX level //////////
  Q.scene('test', function(stage) {
    Q.stageTMX('Castle_Room1.tmx', stage);

    const player = stage.insert(new Q.Player({ x: 300, y: 400 }));
    stage.insert(
      new Q.Darknut({ x: 400, y: 300, vfactor: 3, attack_range: 0 })
    );
    stage.insert(new Q.BigChest({x: 200, y:300}));
  });

  Q.load(
    'purple_link.png, purple_link.json, darknut.png, darknut.json, big_chest.json, big_chest.png',
    function() {
      Q.compileSheets('purple_link.png', 'purple_link.json');
      Q.compileSheets('darknut.png', 'darknut.json');
      Q.compileSheets('big_chest.png', 'big_chest.json');
      Q.loadTMX('Castle_Room1.tmx', function() {
        Q.stageScene('test');
      });
    }
  );
};
