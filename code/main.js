const game = function() {
  ////////// Load Quintus object //////////
  const Q = (window.Q = Quintus()
    .include('Sprites, Scenes, Input, UI, Touch, TMX, Anim, 2D, Audio')
    .setup({
      width: 512,
      height: 512,
      audioSupported: ['ogg', 'mp3'],
    })
    .controls()
    .touch()
    .enableSound());

  ////////// Player Sprite //////////
  Q.Sprite.extend('Player', {
    init: function(p) {
      this._super(p, {
        sprite: 'purple_link',
        sheet: 'purple_link',
        direction: 'up',
        health: 3,
        max_health: 3,
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

      // Refresh hp HUD
      this.hpHUD();

      if (this.p.attacking && this.p.health > 0) {
        Q.audio.play('MC_Link_Sword.ogg');
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

    hit: function(dmg, source) {
      const pos = { x: this.p.x, y: this.p.y };
      if (facing(this.p.direction, pos, source)) {
        Q.audio.play('MC_Link_Shield_Deflect.ogg');
        return;
      }
      Q.audio.play('MC_Link_Hurt.ogg');
      this.p.health -= dmg;
      this.hpHUD();
      if (this.p.health <= 0) {
        this.destroy();
        Q.stageScene('endGame', 2, {
          label: 'You Died',
        });
      }
    },

    attack: function() {
      const p = this.p;
      const pos = { x: p.x, y: p.y };
      const radius = p.range * p.tile_size;
      p.attacking = true;
      sprites = Q.stage(1).getSprites();
      for (i in sprites) {
        const other = sprites[i].p;
        const col = { x: p.x - other.x, y: p.y - other.y };
        const other_pos = { x: other.x, y: other.y };
        if (
          !sprites[i].isA('Player') &&
          col.x ** 2 + col.y ** 2 < radius ** 2 &&
          sprites[i].hit &&
          facing(p.direction, pos, other_pos)
        ) {
          sprites[i].hit(this.p.damage);
        }
      }
    },

    interact: function() {
      const p = this.p;
      const pos = { x: p.x, y: p.y };
      const radius = p.range * p.tile_size;
      sprites = Q.stage(1).getSprites();
      for (i in sprites) {
        const other = sprites[i].p;
        const col = { x: p.x - other.x, y: p.y - other.y };
        const other_pos = { x: other.x, y: other.y };
        if (
          !sprites[i].isA('Player') &&
          col.x ** 2 + col.y ** 2 < radius ** 2 &&
          sprites[i].interact &&
          facing(p.direction, pos, other_pos)
        ) {
          sprites[i].interact(this);
        }
      }
    },

    hpHUD: function() {
      hpui = Q.stage(2).lists['UI.Button'];

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
      Q.audio.play('MC_Enemy_Hit.ogg');
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
      Q.audio.play('MC_Enemy_Hit.ogg');
      this.p.health -= dmg;
      if (this.p.health <= 0) {
        this.destroy();
        Q.stage(1).pause();
        Q.clearStage(2);
        Q.stageScene('endGame', 2, {
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
        Q.audio.play('MC_Chest_Open.ogg');
        this.play('open');
        this.p.opening = false;
      }
      if (this.p.open) {
        this.p.frame = 3;
      } else {
        this.p.frame = 0;
      }
    },

    interact: function(obj) {
      if (!this.p.open) {
        this.p.open = true;
        this.p.opening = true;
        let item = '';
        switch (this.p.reward) {
          case 'big_rupee':
            Q.audio.play('MC_Rupee.ogg');
            item = new Q.BigRupee({ x: this.p.x, y: this.p.y });
            break;
          case 'heart':
            Q.audio.play('MC_Heart.ogg');
            obj.p.health = obj.p.max_health;
            item = new Q.Heart({ x: this.p.x, y: this.p.y });
            break;
        }
        Q.stage(1).insert(item);
      }
    },
  });

  Q.animations('big_chest', {
    open: { frames: [1, 2, 3], rate: 1 / 5, loop: false },
  });
  ////////// NPCs  //////////
  Q.Sprite.extend('npc1', {
    init: function(p) {
      this._super(p, {
        sheet: 'shadow_link',
        sprite: 'shadow_link',
        frame: 0,
        gravity: 0,
        talking: false,
      });
    },
    interact: function() {
      if (!this.p.talking) {
        this.p.talking = true;
        Q.stageScene('npcTalk', 3, { label: 'Holaaaaaa!' });
        this.p.talking = false;
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

  Q.Sprite.extend('Heart', {
    init: function(p) {
      this._super(p, {
        sheet: 'life',
        frame: 0,
        sprite: 'life',
        gravity: 0,
        sensor: true,
        scale: 0.5,
      });

      this.add('tween');
    },
    step: function(p) {
      this.animate({ y: this.p.y - 30 }, 1, Q.Easing.Linear, {
        callback: function() {
          this.destroy();
        },
      });
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
        const hp = collision.obj.p.health;
        const source = Q.stage(1).scene.name;
        Q.clearStages();
        Q.stageScene(this.p.scene, 1);
        Q.stageScene('HUD', 2);
        const sprites = Q.stage(1).getSprites();
        let player = '';
        let dest = { x: 0, y: 0 };
        for (s in sprites) {
          obj = sprites[s];
          if (obj.isA('Player')) {
            player = obj;
          } else if (obj.isA('InvisibleBarrier')) {
            switch (this.p.scene) {
              case 'Village':
                dest.x = obj.p.x;
                dest.y = obj.p.y + 20;
                break;
              case 'CastleOut':
                if (source === 'Village' && obj.p.direction === 'backward') {
                  dest.x = obj.p.x;
                  dest.y = obj.p.y - 20;
                } else if (
                  source === 'Castle' &&
                  obj.p.direction === 'forward'
                ) {
                  dest.x = obj.p.x;
                  dest.y = obj.p.y + 20;
                }
                break;
              case 'Castle':
                dest.x = obj.p.x;
                dest.y = obj.p.y - 20;
                break;
            }
          }
        }
        player.p.health = hp;
        player.p.x = dest.x;
        player.p.y = dest.y;
      });
    },
  });

  ////////// Puzzle Grid ///////////

  Q.Sprite.extend('activationGrid', {
    init: function(p) {
      this._super(p, {
        asset: 'puzzle.png',
        gravity: 0,
        sensor: true,
        activated: false,
      });
      this.on('sensor', function(collision) {
        if (!collision.isA('Player')) return;
        if (!this.p.activated) {
          Q.audio.play('MC_FloorSwitch.ogg');
          console.log(Q.state.get('label'));
          Q.state.inc('label', 1);
          console.log(Q.state.get('label'));
          if (Q.state.get('label') >= 2) {
            Q.audio.play('MC_Secret.ogg');
            let sprites = Q.stage(1).getSprites();
            for (i in sprites) {
              if (sprites[i].isA('barrierPuzzle')) sprites[i].eliminate();
            }
          }
          this.destroy();
        }
      });
    },
  });

  Q.Sprite.extend('barrierPuzzle', {
    init: function(p) {
      this._super(p, {
        asset: 'inv.png',
        gravity: 0,
      });
    },
    eliminate: function() {
      this.destroy();
    },
  });

  ////////// Main Menu //////////
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
      Q.audio.stop();
      Q.audio.play('Music.ogg', { loop: true });
      Q.stageScene('Village', 1);
      Q.stageScene('HUD', 2);
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
      Q.audio.stop();
      Q.audio.play('Menu.ogg', { loop: true });
      Q.stageScene('mainMenu');
    });

    container.fit(20);
  });

  ////////// NPC TALKING /////////////
  Q.scene('npcTalk', function(stage) {
    var container = stage.insert(
      new Q.UI.Container({
        x: Q.width / 2,
        y: Q.height - Q.height / 8 - 50,
        fill: 'rgba(0,0,0,0.5)',
        w: Q.width,
        h: Q.height / 8,
      })
    );
    var button = container.insert(new Q.UI.Button({ keyActionName: 'action' }));
    var label = container.insert(
      new Q.UI.Text({
        //x:10,
        //y: -10 - button.p.h,
        label: stage.options.label,
        color: 'white',
      })
    );

    button.on('click', function() {
      Q.clearStage(3);
      Q.stage(1).unpause();
    });
    container.fit(Q.height / 8);
    Q.stage(1).pause();
  });

  ////////// Scenes //////////
  Q.scene('Village', function(stage) {
    Q.stageTMX('village_map.tmx', stage);

    stage.add('viewport').follow(stage.lists.Player[0]);
  });

  Q.scene('CastleOut', function(stage) {
    Q.stageTMX('castle_outside_map.tmx', stage);

    stage.add('viewport').follow(stage.lists.Player[0]);
  });

  Q.scene('Castle', function(stage) {
    Q.stageTMX('castle_sheet_map.tmx', stage);
    Q.state.set('label', 0);
    stage.add('viewport').follow(stage.lists.Player[0]);
  });

  Q.scene('HUD', function(stage) {
    container = stage.insert(new Q.HealthHUD());

    for (let i = 0; i < 3; i += 1) {
      container.insert(
        new Q.UI.Button({
          x: -Q.width / 2 + i * 20,
          y: -Q.height / 2 - 10,
          w: 20,
          h: 20,
          sprite: 'life',
          sheet: 'life',
          frame: 0,
          scale: 0.75,
        })
      );
    }
  });

  ////////// HUD //////////
  Q.UI.Container.extend('HealthHUD', {
    init: function(p) {
      this._super({
        x: Q.width / 2 + 10,
        y: Q.height / 2 + 20,
      });

      Q.state.on('change.score', this, 'score');
    },
  });

  Q.load(
    'purple_link.png, purple_link.json, darknut.png, darknut.json, \
    big_chest.json, big_chest.png, big_rupee.json, big_rupee.png, \
    inv.png, inv_colored.png, life.png, life.json, mainTitle.png, \
    startButton.png, creditsButton.png, credits.png, shadow_link.png, \
    shadow_link.json, puzzle.png, MC_Enemy_Hit.ogg, MC_Heart.ogg, \
    MC_Link_Hurt.ogg, MC_Link_Shield_Deflect.ogg, MC_Link_Sword.ogg, \
    MC_Rupee.ogg, MC_Secret.ogg, MC_FloorSwitch.ogg, MC_Chest_Open.ogg, \
    Music.ogg, Menu.ogg',
    function() {
      Q.compileSheets('purple_link.png', 'purple_link.json');
      Q.compileSheets('darknut.png', 'darknut.json');
      Q.compileSheets('big_chest.png', 'big_chest.json');
      Q.compileSheets('big_rupee.png', 'big_rupee.json');
      Q.compileSheets('life.png', 'life.json');
      Q.compileSheets('shadow_link.png', 'shadow_link.json');
      Q.loadTMX(
        'village_map.tmx, castle_sheet_map.tmx,\
        castle_outside_map.tmx',
        function() {
          Q.audio.play('Menu.ogg', { loop: true });
          Q.stageScene('mainMenu');
        }
      );
    }
  );
};

///////////// Aux functions //////////////////
function facing(direction, source, target) {
  switch (direction) {
    case 'up':
      return source.y > target.y && Math.abs(source.x - target.x) < 10;
    case 'down':
      return source.y < target.y && Math.abs(source.x - target.x) < 10;
    case 'left':
      return source.x > target.x && Math.abs(source.y - target.y) < 10;
    case 'right':
      return source.x < target.x && Math.abs(source.y - target.y) < 10;
  }
}
