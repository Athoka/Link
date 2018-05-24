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
        damage: 1,
        range: 3,
        tile_size: 16,
        attacking: false,
        points: [[-4, -4], [-4, 4], [4, 4], [4, -4]],
      });

      this.add('2d, stepControls, animation');

      Q.input.on('fire', this, 'attack');
      Q.input.on('action', this, 'interact');
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

      if (this.p.attacking && this.p.health > 0) {
        this.play('attack_' + this.p.direction);
        this.p.attacking = false;
      } else if (this.p.stepping && this.p.health > 0) {
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

    attack: function() {
      const p = this.p;
      p.attacking = true;
      sprites = Q.stage(Q.stages.length - 1).getSprites();
      for (i in sprites) {
        const other = sprites[i].p;
        col = { x: p.x - other.x, y: p.y - other.y };
        if (
          !sprites[i].isA('Player') &&
          Math.abs(col.x) < p.range * p.tile_size &&
          Math.abs(col.y) < p.range * p.tile_size
        ) {
          if (sprites[i].hit) sprites[i].hit(this.p.damage);
        }
      }
    },

    interact: function() {
      const p = this.p;
      c = Q.stage(Q.stages.length - 1).collide(this);
      sprites = Q.stage(Q.stages.length - 1).getSprites();
      for (i in sprites) {
        const other = sprites[i].p;
        col = { x: p.x - other.x, y: p.y - other.y };
        if (
          !sprites[i].isA('Player') &&
          Math.abs(col.x) < p.range * p.tile_size &&
          Math.abs(col.y) < p.range * p.tile_size
        ) {
          if (sprites[i].interact) sprites[i].interact();
        }
      }
    },
  });

  Q.animations('purple_link', {
    walk_up: { frames: [1, 2, 3, 4, 5, 6], rate: 1 / 15 },
    walk_left: { frames: [12, 13, 14, 15, 16, 17], rate: 1 / 15 },
    walk_right: { frames: [12, 13, 14, 15, 16, 17], rate: 1 / 15 },
    walk_down: { frames: [23, 24, 25, 26, 27, 28], rate: 1 / 15 },
    attack_up: { frames: [7, 8, 9, 10], rate: 1 / 5, loop: false },
    attack_left: { frames: [18, 19, 20, 21], rate: 1 / 5, loop: false },
    attack_right: { frames: [18, 19, 20, 21], rate: 1 / 5, loop: false },
    attack_down: { frames: [29, 30, 31, 32], rate: 1 / 5, loop: false },
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
        direction: 'down',
        tile_size: 16,
        damage: 0,
        health: 3,
        death: false,
      });

      this.on('attack.done', function(collision) {
        this.p.attacking = false;
      });

      this.add('2d, aiTrack, animation');
    },

    step: function(dt) {
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
      } else if (this.p.tracking) {
        this.play('walk_' + this.p.direction);
        this.p.tracking = false;
      } else {
        this.play('stand_' + this.p.direction);
      }
    },

    hit: function(dmg) {
      this.p.health -= dmg;
      if (this.p.health <= 0) {
        this.destroy();
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
    attack_up: {
      frames: [3, 4, 5],
      rate: 1 / 10,
      next: 'stand_up',
      trigger: 'attack.done',
    },
    attack_left: {
      frames: [9, 10, 11],
      rate: 1 / 10,
      next: 'stand_left',
      trigger: 'attack.done',
    },
    attack_right: {
      frames: [9, 10, 11],
      rate: 1 / 10,
      next: 'stand_right',
      trigger: 'attack.done',
    },
    attack_down: {
      frames: [15, 16, 17],
      rate: 1 / 10,
      next: 'stand_down',
      trigger: 'attack.done',
    },
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
        opening: false,
        reward: 'big_rupee',
      });
      this.add('animation');
    },

    step: function(dt) {
      if (this.p.opening) {
        this.play('open');
        this.p.opening = false;
      }
      if (this.p.open) {
        this.p.frame = 3;
      } else {
        this.p.frame = 0;
      }
    },

    interact: function() {
      if (!this.p.open) {
        this.p.open = true;
        this.p.opening = true;
        let item = '';
        if ('big_rupee') {
          item = new Q.BigRupee({ x: this.p.x, y: this.p.y });
        }
        Q.stage(Q.stages.length - 1).insert(item);
      }
    },
  });

  Q.animations('big_chest', {
    open: { frames: [1, 2, 3], rate: 1 / 5, loop: false },
  });

  ////////// Items //////////
  Q.Sprite.extend('BigRupee', {
    init: function(p) {
      this._super(p, {
        sheet: 'big_rupee',
        frame: 0,
        sprite: 'big_rupee',
        gravity: 0,
        sensor: true,
        scale: 0.5,
      });

      this.add('tween, animation');
    },
    step: function(p) {
      this.play('color');
      this.animate({ y: this.p.y - 30 }, 1, Q.Easing.Linear, {
        callback: function() {
          this.destroy();
        },
      });
    },
  });

  Q.animations('big_rupee', {
    color: {
      frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      loop: true,
      rate: 1 / 5,
    },
  });

  ////////// Invisible barrier //////////
  Q.Sprite.extend('InvisibleBarrier', {
    init: function(p) {
      this._super(p, {
        asset: 'inv_colored.png',
        gravity: 0,
      });

      this.on('hit.sprite', function(collision) {
        if (!collision.obj.isA('Player')) return;
        /*
        const src = getId(Q.stage(Q.stages.length - 1).scene.name);
        const dst = getId(this.p.scene);
        Q.swapScene(src, dst);
        */
        Q.stageScene(this.p.scene);
      });
    },
  });

  ////////// Load TMX level //////////
  Q.scene('Room 1', function(stage) {
    Q.stageTMX('Castle_Room1.tmx', stage);

    const player = stage.insert(new Q.Player({ x: 300, y: 400 }));
    stage.insert(
      new Q.Darknut({ x: 400, y: 300, vfactor: 3, attack_range: 0 })
    );
    stage.insert(new Q.BigChest({ x: 200, y: 300 }));

    for (let i = 0; i < 5; i += 1) {
      stage.insert(
        new Q.InvisibleBarrier({ x: 296 - i * 16, y: 510, scene: 'Room 2' })
      );
    }
  });

  Q.scene('Room 2', function(stage) {
    Q.stageTMX('Castle_Room2.tmx', stage);

    const player = stage.insert(new Q.Player({ x: 300, y: 400 }));
    stage.insert(new Q.BigChest({ x: 200, y: 300 }));

    for (let i = 0; i < 4; i += 1) {
      stage.insert(
        new Q.InvisibleBarrier({ x: 510, y: 296 - i * 16, scene: 'Room 1' })
      );
    }

    // for testing only
    stage.insert(new Q.InvisibleBarrier({ x: 200, y: 280, scene: 'Room 1' }));
  });

  Q.load(
    'purple_link.png, purple_link.json, darknut.png, darknut.json, \
    big_chest.json, big_chest.png, big_rupee.json, big_rupee.png, \
    inv.png, inv_colored.png',
    function() {
      Q.compileSheets('purple_link.png', 'purple_link.json');
      Q.compileSheets('darknut.png', 'darknut.json');
      Q.compileSheets('big_chest.png', 'big_chest.json');
      Q.compileSheets('big_rupee.png', 'big_rupee.json');
      Q.loadTMX('Castle_Room1.tmx, Castle_Room2.tmx', function() {
        /*
        Q.stageScene('Room 1', 100);
        Q.stageScene('Room 2', 2);
        */
        Q.stageScene('Room 1');
      });
    }
  );

  getId = function(str) {
    const r = str.split(' ');
    return parseInt(r[r.length - 1]);
  };
};
