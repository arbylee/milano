var GAME_WIDTH = 600;
var GAME_HEIGHT = 600;
var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, '');
function Main() {};


var Milano = function (state) {
  this.alreadyScored = false;
  Phaser.Sprite.call(this, state.game, 0, 0, 'milano');
  this.alive = false;
  this.exists = false;
}

Milano.prototype = Object.create(Phaser.Sprite.prototype);
Milano.prototype.constructor = Milano;


Main.prototype = {
  preload: function(){
    this.game.stage.backgroundColor = '#71c5cf';
    this.game.load.image('cone', 'assets/cone.png');
    this.game.load.image('milano', 'assets/milano.png');
    this.cursors = game.input.keyboard.createCursorKeys();
  },
  create: function(){
    this.score = 0;
    this.scoreText = game.add.text(20, 20, "Score: 0", {font: "16px Arial", fill: "#FFFFFF"});
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.player = game.add.sprite(300, 550, 'cone');
    this.game.physics.arcade.enable(this.player);
    this.player.body.collideWorldBounds = true;

    this.milanos = this.game.add.group();
    this.milanos.enableBody = true;

    for(i=0; i<80; i++){
      this.milanos.add(new Milano(this));
    }

    this.game.time.events.loop(this.game.rnd.between(250, 450), this.spawnMilano, this);
  },
  update: function(){
    this.player.body.velocity.x = 0;
    if(this.cursors.left.isDown && this.player.body.x > 0){
      this.player.body.velocity.x -= 250;
    }
    if(this.cursors.right.isDown && this.player.body.x < GAME_WIDTH-this.player.body.width){
      this.player.body.velocity.x += 250;
    }

    this.game.physics.arcade.overlap(this.player, this.milanos, this.milanoHitsCone, null, this);
    this.game.physics.arcade.overlap(this.milanos, this.milanos, this.milanoHitsMilano, null, this);
  },
  spawnMilano: function(){
    var milano = this.milanos.getFirstDead();
    milano.reset(this.game.rnd.between(0, 600), -50);
    milano.body.velocity.y = 300;
  },
  milanoHitsCone: function(player, milano){
    if(!milano.alreadyScored){
      milano.alreadyScored = true;
      milano.body.velocity.y = 0;
      milano.body.velocity = player.body.velocity;
      this.addPoints();
    }
  },
  milanoHitsMilano: function(milano1, milano2){
    if(!milano2.alreadyScored){
      if(milano1 != milano2){
        milano2.alreadyScored = true;
        milano2.body.velocity.y = 0;
        milano2.body.velocity = milano1.body.velocity;
        this.addPoints();
      };
    };
  },
  addPoints: function(){
    this.score += 1;
    this.scoreText.text = "Score: " + this.score;
    if(this.score >= 20){
      this.game.state.start('win');
    }
  }
};

function Win() {};
Win.prototype = {
  create: function(){
    this.game.add.text(240, 240, "You win!", {font: "24px Arial", fill: "#FFFFFF"});
    this.game.add.text(150, 440, "Press spacebar to restart", {font: "24px Arial", fill: "#FFFFFF"});
  },
  update: function(){
    if(this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
      this.game.state.start('main');
    };
  }
}

game.state.add('main', Main);
game.state.add('win', Win);
game.state.start('main');
