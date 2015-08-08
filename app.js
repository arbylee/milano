var GAME_WIDTH = 600;
var GAME_HEIGHT = 600;
var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, '');
function Main() {};


var Milano = function (state) {
  this.alreadyScored = false;
  Phaser.Sprite.call(this, state.game, 0, 0, 'milano');
  this.alive = false;
  this.exists = false;
  this.anchor.setTo(0.5, 0.5);
  this.rotation = Math.PI/2;
}

Milano.prototype = Object.create(Phaser.Sprite.prototype);
Milano.prototype.constructor = Milano;

var Player = function (state) {
  this.gameState = state;
  this.game = state.game;
  this.moveSpeed = 250;
  Phaser.Sprite.call(this, this.game, 400, 550, 'player');
  this.game.add.existing(this);
  this.game.physics.arcade.enable(this);

  this.body.collideWorldBounds = true;
  this.cursors = this.game.input.keyboard.createCursorKeys();
}

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function(){
  this.body.velocity.x = 0;
  if(this.cursors.left.isDown && this.body.x > 0){
    this.body.velocity.x -= this.moveSpeed;
  }
  if(this.cursors.right.isDown && this.body.x < GAME_WIDTH-this.body.width){
    this.body.velocity.x += this.moveSpeed;
  }
}


Main.prototype = {
  preload: function(){
    this.game.stage.backgroundColor = '#71c5cf';
    this.game.load.image('player', 'assets/openMouthFace.png');
    this.game.load.image('milano', 'assets/milano.png');
    this.cursors = game.input.keyboard.createCursorKeys();
  },
  create: function(){
    this.score = 0;
    this.scoreText = game.add.text(20, 20, "Score: 0", {font: "16px Arial", fill: "#FFFFFF"});
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.player = new Player(this);
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
    this.game.physics.arcade.overlap(this.player, this.milanos, this.milanoHitsPlayer, null, this);
  },
  spawnMilano: function(){
    var milano = this.milanos.getFirstDead();
    milano.reset(this.game.rnd.between(0, 600), -50);
    milano.body.velocity.y = 300;
  },
  milanoHitsPlayer: function(player, milano){
    var milanoLeftEdge = milano.body.center.x - milano.height/2; //Uses height because the milano is rotated
    var milanoRightEdge = milano.body.center.x + milano.height/2; //Uses height because the milano is rotated
    var playerMouthLeft = player.left + 30;
    var playerMouthRight = player.right - 7;

    if(milanoLeftEdge > playerMouthLeft && milanoRightEdge < playerMouthRight) {
      this.addPoints();
    }
    milano.kill();
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
