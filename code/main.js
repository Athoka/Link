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
      const dirs = ['up', 'down', 'left', 'right'];
      this.p.directions = [];
      if (!Q.inputs[this.p.direction]) {
        for (let d in dirs) {
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
      hpui = Q.stage().lists['UI.Button'];
      this.p.health -= dmg;

      for (let i = 0; i < this.p.health; i += 1) {
        if (this.p.health - i >= 1) {
          hpui[i].p.frame = 0;
        } else if (this.p.health - i > 0) {
          hpui[i].p.frame = 1;
        }
      }
      for (let i = Math.ceil(this.p.health); i < 3; i += 1) {
        hpui[i].p.frame = 2;
      }

      if (this.p.health <= 0) {
        Q.stageScene('endGame', 1, {
          label: 'You Died',
        });
      }
    },

    attack: function() {
      const p = this.p;
      const radius = p.range * p.tile_size;
      p.attacking = true;
      sprites = Q.stage(Q.stages.length - 1).getSprites();
      for (i in sprites) {
        const other = sprites[i].p;
        col = { x: p.x - other.x, y: p.y - other.y };
        if (
          !sprites[i].isA('Player') &&
          col.x ** 2 + col.y ** 2 < radius ** 2
        ) {
          if (sprites[i].hit) sprites[i].hit(this.p.damage);
        }
      }
    },

    interact: function() {
      const p = this.p;
      const radius = p.range * p.tile_size;
      sprites = Q.stage(Q.stages.length - 1).getSprites();
      for (i in sprites) {
        const other = sprites[i].p;
        col = { x: p.x - other.x, y: p.y - other.y };
        if (
          !sprites[i].isA('Player') &&
          col.x ** 2 + col.y ** 2 < radius ** 2
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

  /////////

  Q.Sprite.extend('ShadowLink', {
    init: function(p) {
      this._super(p, {
        sheet: 'shadow_link',
        sprite: 'shadow_link',
        gravity: 0,
        direction: 'down',
        tile_size: 16,
        damage: 0,
        health: 5,
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

      if (this.p.direction === 'right') {
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
        Q.stage(0).pause();
        Q.stageScene('endGame', 1, {
          label: 'You Won!',
        });
      }
    },
  });

  Q.animations('shadow_link', {
    walk_up: { frames: [1, 2, 3, 4, 5], rate: 1 / 15 },
    walk_left: { frames: [11, 12, 13, 14, 15], rate: 1 / 15 },
    walk_right: { frames: [11, 12, 13, 14, 15], rate: 1 / 15 },
    walk_down: { frames: [21, 22, 23, 24, 25], rate: 1 / 15 },
    attack_up: {
      frames: [6, 7, 8, 9],
      rate: 1 / 10,
      next: 'stand_up',
      trigger: 'attack.done',
    },
    attack_left: {
      frames: [16, 17, 18, 19],
      rate: 1 / 10,
      next: 'stand_left',
      trigger: 'attack.done',
    },
    attack_right: {
      frames: [16, 17, 18, 19],
      rate: 1 / 10,
      next: 'stand_right',
      trigger: 'attack.done',
    },
    attack_down: {
      frames: [26, 27, 28, 29],
      rate: 1 / 10,
      next: 'stand_down',
      trigger: 'attack.done',
    },
    stand_up: { frames: [0], rate: 1 / 5 },
    stand_left: { frames: [10], rate: 1 / 5 },
    stand_right: { frames: [10], rate: 1 / 5 },
    stand_down: { frames: [21], rate: 1 / 5 },
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
  ////////// NPCs  //////////
  Q.Sprite.extend('npc1',{
    init: function(p){
      this._super(p, {
        sheet: 'shadow_link',
        sprite: 'shadow_link',
        frame: 0,
        gravity: 0,
        talking: false,
      })
    },
    interact: function(){
      if(!this.p.talking){
        this.p.talking = true;
        Q.stageScene("npcTalk", 2, {label: "Holaaaaaa!"});
      }
    },
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
        asset: 'inv.png',
        gravity: 0,
      });

      this.on('hit.sprite', function(collision) {
        if (!collision.obj.isA('Player')) return;
        hpcon = Q.stage().lists['UI.Container'][0];
        collision.obj.p.x = this.p.dx;
        collision.obj.p.y = this.p.dy;
        Q.stage().centerOn(this.p.viewx, this.p.viewy);
        hpcon.p.x = this.p.viewx + 16;
      });
    },
  });

  ////////// Activation Grid ///////////
  Q.Sprite.extend('casillaActivacion', {
    init: function(p) {
      this._super(p, {
        asset: 'inv_colored.png',
        gravity: 0,
        activated: false,
      });
      this.on('hit.sprite', function(collision) {
        if (!collision.obj.isA('Player')) return;
        if (!this.p.activated) {
          this.p.activated = true;
          console.log(Q.state.get('label'));
          Q.state.inc('label', 1);
          console.log(Q.state.get('label'));
          if (Q.state.get('label') >= 2) {
            Q.stageScene('PuzzleDone', 2, { label: 'Puzzle resuelto!' });
          }
        }
      });
    },
  });

  Q.scene('PuzzleDone', function(stage) {
    var container = stage.insert(
      new Q.UI.Container({
        x: Q.width / 2,
        y: Q.height / 2,
        fill: 'rgba(0,0,0,0.5)',
      })
    );
    var button = container.insert(
      new Q.UI.Button({
        x: 0,
        y: 0,
        fill: '#CCCCCC',
        label: 'OC.',
      })
    );
    var label = container.insert(
      new Q.UI.Text({
        x: 10,
        y: -10 - button.p.h,
        label: stage.options.label,
      })
    );
    button.on('click', function() {
      Q.clearStage(2);
    });
    container.fit(20);
  });

  ////////// Load TMX level //////////
  Q.scene('Castle', function(stage) {
    Q.stageTMX('Castle.tmx', stage);

    Q.state.reset({ label: 0 });

    // Room 1 container
    const container = stage.insert(
      new Q.UI.Container({
        x: Q.width / 2 + 80,
        y: Q.height / 2 + 20,
      })
    );

    container.insert(
      new Q.UI.Button({
        x: -Q.width / 2,
        y: -Q.height / 2 - 10,
        w: 20,
        h: 20,
        sprite: 'life',
        sheet: 'life',
        frame: 0,
        scale: 0.75,
      })
    );

    container.insert(
      new Q.UI.Button({
        x: -Q.width / 2 + 20,
        y: -Q.height / 2 - 10,
        w: 20,
        h: 20,
        sprite: 'life',
        sheet: 'life',
        frame: 0,
        scale: 0.75,
      })
    );

    container.insert(
      new Q.UI.Button({
        x: -Q.width / 2 + 40,
        y: -Q.height / 2 - 10,
        w: 20,
        h: 20,
        sprite: 'life',
        sheet: 'life',
        frame: 0,
        scale: 0.75,
      })
    );

    // Room 1
    const player = stage.insert(
      new Q.Player({ x: 300, y: 50, direction: 'down', stepDistance: 25 })
    );

    stage.add('viewport').centerOn(320, 255);

    stage.insert(
      new Q.Darknut({
        x: 150,
        y: 260,
        vfactor: 3,
        damage: 1,
        direction: 'right',
      })
    );
    stage.insert(
      new Q.Darknut({
        x: 330,
        y: 450,
        vfactor: 3,
        damage: 0,
        direction: 'up',
      })
    );
    stage.insert(new Q.BigChest({ x: 100, y: 260, angle: -90 }));
    stage.insert(new Q.casillaActivacion({ x: 500, y: 450 }));
    stage.insert(new Q.casillaActivacion({ x: 135, y: 450 }));

    //go forward
    for (let i = 0; i < 8; i += 1) {
      stage.insert(
        new Q.InvisibleBarrier({
          x: 360 - i * 16,
          y: 510,
          dx: 896,
          dy: 30,
          viewx: 896,
          viewy: 255,
        })
      );
    }

    // Room 2

    //go backwards
    for (let i = 0; i < 8; i += 1) {
      stage.insert(
        new Q.InvisibleBarrier({
          x: 936 - i * 16,
          y: 0,
          dx: 300,
          dy: 480,
          viewx: 320,
          viewy: 255,
        })
      );
    }

    //go forward
    for (let i = 0; i < 8; i += 1) {
      stage.insert(
        new Q.InvisibleBarrier({
          x: 1150,
          y: 343 - i * 16,
          dx: 1250,
          dy: 280,
          viewx: 1472,
          viewy: 255,
        })
      );
    }

    stage.insert(new Q.BigChest({ x: 1050, y: 60 }));
    stage.insert(
      new Q.Darknut({
        x: 1000,
        y: 80,
        vfactor: 3,
        damage: 0,
        view_range: 5,
        direction: 'down',
      })
    );
    stage.insert(
      new Q.Darknut({
        x: 1100,
        y: 80,
        vfactor: 3,
        damage: 0,
        view_range: 5,
        direction: 'down',
      })
    );

    // Room 3

    //go backwards
    for (let i = 0; i < 8; i += 1) {
      stage.insert(
        new Q.InvisibleBarrier({
          x: 1220,
          y: 343 - i * 16,
          dx: 1120,
          dy: 280,
          viewx: 896,
          viewy: 255,
        })
      );
    }

    //go forward
    for (let i = 0; i < 8; i += 1) {
      stage.insert(
        new Q.InvisibleBarrier({
          x: 1590 - i * 16,
          y: 510,
          dx: 2130,
          dy: 40,
          viewx: 2048,
          viewy: 255,
        })
      );
    }

    stage.insert(new Q.BigChest({ x: 1270, y: 430, angle: -90 }));

    // Room 4

    //go backward
    for (let i = 0; i < 8; i += 1) {
      stage.insert(
        new Q.InvisibleBarrier({
          x: 2184 - i * 16,
          y: 0,
          dx: 1530,
          dy: 480,
          viewx: 1472,
          viewy: 255,
        })
      );
    }

    stage.insert(
      new Q.ShadowLink({
        x: 2060,
        y: 300,
        vfactor: 3,
        view_range: 10,
        damage: 0.5,
        reloadSpeed: 1,
        direction: 'down',
        scale: 1.5,
      })
    );
  });

  // Menu

  Q.scene('mainMenu', function(stage) {
    const container = stage.insert(
      new Q.UI.Container({
        x: Q.width,
        y: Q.height,
      })
    );
    const startButton = container.insert(
      new Q.UI.Button({
        x: -Q.width / 2 + 150,
        y: -Q.height / 2,
        asset: 'startButton.png',
        keyActionName: 'fire',
      })
    );
    startButton.on('click', function() {
      Q.clearStages();
      Q.stageScene('Village');
    });
    creditsButton = container.insert(
      new Q.UI.Button({
        x: -Q.width / 2 + 150,
        y: -Q.height / 2 + 100,
        asset: 'creditsButton.png',
        keyActionName: 'fire',
      })
    );
    creditsButton.on('click', function() {
      Q.clearStages();
      Q.stageScene('Credits');
    });
    const background = container.insert(
      new Q.UI.Button({
        x: -Q.width / 2,
        y: -Q.height / 2,
        asset: 'mainTitle.png',
      })
    );
  });
  Q.scene('Credits', function(stage) {
    const container = stage.insert(
      new Q.UI.Container({
        x: Q.width,
        y: Q.height,
      })
    );
    const back = container.insert(
      new Q.UI.Button({
        x: -Q.width / 2,
        y: -Q.height / 2,
        fill: '#CCCCCC',
        asset: 'credits.png',
        keyActionName: 'fire',
      })
    );
    back.on('click', function() {
      Q.clearStages();
      Q.stageScene('mainMenu');
    });
    container.fit(20);
  });

  ////////// End Game Screen //////////
  Q.scene('endGame', function(stage) {
    const container = stage.insert(
      new Q.UI.Container({
        x: Q.width / 2,
        y: Q.height / 2,
        fill: 'rgba(0,0,0,0.5)',
      })
    );

    const button = container.insert(
      new Q.UI.Button({
        x: stage.options.label.length,
        y: 0,
        fill: '#CCCCCC',
        label: 'Menu',
      })
    );

    const label = container.insert(
      new Q.UI.Text({
        x: 10,
        y: -30 - button.p.h,
        label: stage.options.label,
      })
    );

    button.on('click', function() {
      Q.clearStages();
      Q.stageScene('mainMenu');
    });

    container.fit(20);
  });
  ////////// NPC TALKING /////////////
  Q.scene('npcTalk', function(stage){
    var container = stage.insert(new Q.UI.Container({
      x: Q.width/2, y: (Q.height-Q.height/8-50), fill: "rgba(0,0,0,0.5)", w: Q.width, h:Q.height/8, keyActionName: 'action'
    }));
    //var button = container.insert(new Q.UI.Button({keyActionName: "action"}));
    var label = container.insert(new Q.UI.Text({
      //x:10, 
      //y: -10 - button.p.h, 
      label: stage.options.label,
      color: "white",
    }));
    
    container.on("action",function(){
      Q.clearStage(3);
    });
    container.fit(Q.height/8);
  });
  ////////// Load TMX level //////////
  Q.scene('Village', function(stage) {
    Q.stageTMX('village_map.tmx', stage);

    stage.add('viewport').follow(stage.lists.Player[0]);
    //centerOn(Q.width * 0.5, Q.height * 0.5);
    stage.viewport.scale = 1;
  });

  Q.load(
    'purple_link.png, purple_link.json, darknut.png, darknut.json, \
    big_chest.json, big_chest.png, big_rupee.json, big_rupee.png, \
    inv.png, inv_colored.png, life.png, life.json, mainTitle.png, \
    startButton.png, creditsButton.png, credits.png, \
    shadow_link.png, shadow_link.json',
    function() {
      Q.compileSheets('purple_link.png', 'purple_link.json');
      Q.compileSheets('darknut.png', 'darknut.json');
      Q.compileSheets('big_chest.png', 'big_chest.json');
      Q.compileSheets('big_rupee.png', 'big_rupee.json');
      Q.compileSheets('life.png', 'life.json');
      Q.compileSheets('shadow_link.png', 'shadow_link.json');
      Q.loadTMX('village_map.tmx', function() {
        //Q.stageScene('Castle');
        Q.stageScene('mainMenu');
      });
    }
  );
};
