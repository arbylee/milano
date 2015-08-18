var GAME_WIDTH = 600;
var GAME_HEIGHT = 600;
var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, '');
function Main() {};


var Milano = function (state) {
  Phaser.Sprite.call(this, state.game, 0, 0, 'milano');
  this.alive = false;
  this.exists = false;
  this.anchor.setTo(0.5, 0.5);
  this.rotation = Math.PI/2;
}

Milano.prototype = Object.create(Phaser.Sprite.prototype);
Milano.prototype.constructor = Milano;

Milano.prototype.foodValue = function(){
  return this.game.rnd.between(2,4);
}

var Player = function (state) {
  this.gameState = state;
  this.game = state.game;
  this.moveSpeed = 250;
  Phaser.Sprite.call(this, this.game, 400, 550, 'player');
  this.game.add.existing(this);
  this.game.physics.arcade.enable(this);
  this.anchor.setTo(0.5, 0.5);
  this.body.collideWorldBounds = true;
  this.cursors = this.game.input.keyboard.createCursorKeys();
  this.initialHungerLevel = 25;
  this.hungerLevel = this.initialHungerLevel;
  this.maxHungerLevel = 70;
}

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function(){
  this.body.velocity.x = 0;

  if(this.game.input.activePointer.isDown){
    if(this.game.input.x < this.x-5){
      this.moveLeft();
    } else if (this.game.input.x > this.x+5){
      this.moveRight();
    }
  } else {
    if(this.cursors.left.isDown){
      this.moveLeft();
    }
    if(this.cursors.right.isDown){
      this.moveRight();
    }
  }
}

Player.prototype.moveLeft = function(){
  if(this.body.x > 0){
    this.body.velocity.x -= this.moveSpeed;
  }
}

Player.prototype.moveRight = function(){
  if(this.body.x < GAME_WIDTH-this.body.width) {
    this.body.velocity.x += this.moveSpeed;
  }
}

Main.prototype = {
  preload: function(){
    this.game.stage.backgroundColor = '#71c5cf';
    this.game.load.image('player', 'assets/openMouthFace.png');
    this.game.load.image('milano', 'assets/milano.png');
    this.game.load.spritesheet('hungerBar', 'assets/barsSprite.png', 18, 60);
    this.game.load.audio('ow', 'assets/ow.m4a');
    this.game.load.audio('mmm', 'assets/mmm.m4a');
    this.game.load.audio('yum', 'assets/yum.m4a');
    this.cursors = game.input.keyboard.createCursorKeys();
  },
  create: function(){
    this.score = 0;
    this.scoreText = game.add.text(20, 20, "Score: 0", {font: "16px Arial", fill: "#FFFFFF"});
    this.hungerText = game.add.text(GAME_WIDTH-100, 20, "Hunger:", {font: "16px Arial", fill: "#FFFFFF"});
    this.hungerBar = this.game.add.sprite(GAME_WIDTH-35, 20, 'hungerBar');
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.player = new Player(this);
    this.game.physics.arcade.enable(this.player);
    this.player.body.collideWorldBounds = true;

    this.eatSounds = [
      this.game.add.audio('yum'),
      this.game.add.audio('mmm')
    ]
    this.owSound = this.game.add.audio('ow');

    this.milanos = this.game.add.group();
    this.milanos.enableBody = true;

    this.hungerIncreaseRate = 2000;
    this.hungerIncreaseAmount = 8;

    for(i=0; i<80; i++){
      this.milanos.add(new Milano(this));
    }

    this.game.time.events.loop(this.game.rnd.between(250, 450), this.spawnMilano, this);
  },
  update: function(){
    this.game.physics.arcade.overlap(this.player, this.milanos, this.milanoHitsPlayer, null, this);
    this.hungerCheck();
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
      this.eatMilano(milano);
    } else {
      this.owSound.play();
    }
    milano.kill();
  },
  addPoints: function(){
    this.score += 1;
    this.scoreText.text = "Score: " + this.score;
  },
  eatMilano: function(milano){
    this.addPoints();
    this.changeHunger(-(milano.foodValue()));
    this.eatSounds[this.game.rnd.between(0, this.eatSounds.length-1)].play();
  },
  hungerCheck: function(){
    if(this.game.time.time < this.nextHungerIncrease){return;};

    this.changeHunger(this.hungerIncreaseAmount);

    if(this.player.hungerLevel > this.player.maxHungerLevel){
      this.game.state.start('gameOver', true, false, {milanosEaten: this.score});
    }
    this.nextHungerIncrease = this.game.time.time + this.hungerIncreaseRate;
  },
  changeHunger: function(amount){
    this.player.hungerLevel += amount;
    var lastFrameIndex = 9;
    var hungerFrame = Math.floor(this.player.hungerLevel / this.player.maxHungerLevel * 10);
    this.hungerBar.frame = Math.min(hungerFrame, lastFrameIndex);
  }
};

function GameOver() {};
GameOver.prototype = {
  init: function(params){
    this.milanosEaten = params.milanosEaten;
  },
  create: function(){
    this.game.add.text(220, 240, "Game Over!", {font: "24px Arial", fill: "#FFFFFF"});
    this.game.add.text(180, 340, "You ate " + this.milanosEaten + " milanos!", {font: "24px Arial", fill: "#FFFFFF"});
    this.restartButton = this.game.add.text(110, 440, "Press here or spacebar to restart", {font: "24px Arial", fill: "#FFFFFF"});
    this.restartButton.inputEnabled = true;
    this.restartButton.events.onInputDown.add(function(){
      this.game.state.start('main');
    }, this)
  },
  update: function(){
    if(this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
      this.game.state.start('main');
    };
  }
}

game.state.add('main', Main);
game.state.add('gameOver', GameOver);
game.state.start('main');
