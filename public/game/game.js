const SAVE_PREFIX = 'pokegochi_';

const STAT_MAX = 100;
const LEVEL_MAX = 100;
const TICK_MS = 15 * 60 * 1000;
const DAY_CAP_MS = 24 * 60 * 60 * 1000;
const BATTLE_DURATION_MS = 60 * 60 * 1000;
const COOLDOWNS = {
      feed: 10 * 60 * 1000,
      pet: 5 * 60 * 1000,
      play: 20 * 60 * 1000
};

const POKEMON_MANIFEST = [
      { id: 'pikachu', displayName: 'Pikachu', file: 'PIKACHU.webp', frameSize: 50, frames: 56, scale: 2.35 },
      { id: 'bulbasaur', displayName: 'Bulbasaur', file: 'BULBASAUR.webp', frameSize: 38, frames: 49, scale: 2.65 },
      { id: 'charmander', displayName: 'Charmander', file: 'CHARMANDER.webp', frameSize: 42, frames: 53, scale: 2.65 },
      { id: 'squirtle', displayName: 'Squirtle', file: 'SQUIRTLE.webp', frameSize: 43, frames: 26, scale: 2.55 },
      { id: 'eevee', displayName: 'Eevee', file: 'EEVEE.webp', frameSize: 49, frames: 63, scale: 2.35 },
      { id: 'riolu', displayName: 'Riolu', file: 'RIOLU.webp', frameSize: 49, frames: 63, scale: 2.35 },
      { id: 'mimikyu', displayName: 'Mimikyu', file: 'MIMIKYU.webp', frameSize: 96, frames: 63, scale: 1.45 },
      { id: 'gengar', displayName: 'Gengar', file: 'GENGAR.webp', frameSize: 79, frames: 44, scale: 1.75 }
];

const BIOMES = [
      {
            ident: 'grass',
            name: 'Grass',
            raincolor: 0x65ccff,
            objects: [
                  { asset: 'plant1.png', x: 70, y: 150, w: 34, h: 32, sx: 0.8, sy: 1.2 },
                  { asset: 'plant2.png', x: 280, y: 220, w: 47, h: 30, sx: 0.8, sy: 1.2 },
                  { asset: 'plant3.png', x: 85, y: 470, w: 39, h: 35, sx: 0.8, sy: 1.2 },
                  { asset: 'plant4.png', x: 292, y: 455, w: 41, h: 35, sx: 0.8, sy: 1.2 }
            ]
      },
      {
            ident: 'foliage',
            name: 'Foliage',
            raincolor: 0xf0e68c,
            objects: [
                  { asset: 'rock1.png', x: 70, y: 150, w: 32, h: 32, sx: 1, sy: 1 },
                  { asset: 'rock2.png', x: 280, y: 220, w: 33, h: 32, sx: 1, sy: 1 },
                  { asset: 'rock3.png', x: 80, y: 470, w: 34, h: 29, sx: 1, sy: 1 },
                  { asset: 'rock4.png', x: 285, y: 455, w: 30, h: 24, sx: 1, sy: 1 }
            ]
      },
      {
            ident: 'glowath',
            name: 'Glowath',
            raincolor: 0x39ff14,
            objects: [
                  { asset: 'bamboo.png', x: 70, y: 155, w: 256, h: 128, sx: 0.33, sy: 0.42 },
                  { asset: 'bush.png', x: 288, y: 225, w: 256, h: 128, sx: 0.35, sy: 0.45 },
                  { asset: 'shrub.png', x: 80, y: 470, w: 256, h: 128, sx: 0.35, sy: 0.45 },
                  { asset: 'tropical1.png', x: 288, y: 455, w: 256, h: 128, sx: 0.35, sy: 0.45 }
            ]
      }
];

function clamp(value, min = 0, max = STAT_MAX)
{
      return Math.max(min, Math.min(max, Math.round(value)));
}

function saveKey(name)
{
      return SAVE_PREFIX + name;
}

function xpToNext(level)
{
      return 40 + level * 20;
}

function formatDuration(ms)
{
      if (ms <= 0) {
            return '0:00';
      }

      const totalSeconds = Math.ceil(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (hours > 0) {
            return hours + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
      }

      return minutes + ':' + seconds.toString().padStart(2, '0');
}

function seededRoll(seed)
{
      const x = Math.sin(Number(seed) || 1) * 10000;
      return (x - Math.floor(x)) * 100;
}

function getPokemonById(id)
{
      return POKEMON_MANIFEST.find((pokemon) => pokemon.id === id) || POKEMON_MANIFEST[0];
}

class PokegochiGame extends Phaser.Scene {
      preload()
      {
            this.load.image('fence_h', 'game/assets/sprites/fence-horizontal.png');
            this.load.image('fence_v', 'game/assets/sprites/fence-vertical.png');
            this.load.image('slot', 'game/assets/sprites/slot.png');
            this.load.image('food', 'game/assets/sprites/food.png');
            this.load.image('hand', 'game/assets/sprites/hand.png');
            this.load.image('heart', 'game/assets/sprites/heart.png');
            this.load.image('health', 'game/assets/sprites/health.png');
            this.load.image('music', 'game/assets/sprites/music.png');
            this.load.image('biome', 'game/assets/sprites/biome.png');
            this.load.image('sym_help', 'game/assets/sprites/sym_help.png');
            this.load.image('pokegochi_bg', 'game/assets/backgrounds/pokegochi-grass.png');
            this.load.spritesheet('ball', 'game/assets/sprites/ball.png', { frameWidth: 76, frameHeight: 76 });
            this.load.spritesheet('bubble', 'game/assets/sprites/bubble.png', { frameWidth: 512, frameHeight: 512 });
            this.load.spritesheet('particle', 'game/assets/sprites/heart.png', { frameWidth: 32, frameHeight: 32 });
            this.load.json('pokemon_manifest', 'game/assets/pokemons/manifest.json');

            for (const pokemon of POKEMON_MANIFEST) {
                  this.load.spritesheet(pokemon.id, 'game/assets/pokemons/' + pokemon.file, {
                        frameWidth: pokemon.frameSize,
                        frameHeight: pokemon.frameSize
                  });
            }

            for (const biome of BIOMES) {
                  this.load.audio('biome_theme_' + biome.ident, 'game/assets/biomes/' + biome.ident + '/theme.ogg');
            }

            this.load.audio('click', 'game/assets/sounds/click.wav');
            this.load.audio('eating', 'game/assets/sounds/eating.wav');
            this.load.audio('purr', 'game/assets/sounds/purr.wav');
            this.load.audio('success', 'game/assets/sounds/success.wav');
            this.load.audio('noaction', 'game/assets/sounds/noaction.wav');
            this.load.audio('boing', 'game/assets/sounds/boing.wav');
            this.load.audio('missedbubble', 'game/assets/sounds/missedbubble.wav');
            this.load.audio('hurt', 'game/assets/sounds/hurt.wav');
            this.load.audio('refreshed', 'game/assets/sounds/refreshed.wav');
            this.load.audio('nameselect', 'game/assets/sounds/nameselect.wav');
            this.load.audio('rain_1', 'game/assets/sounds/rain_1.wav');
            this.load.audio('rain_2', 'game/assets/sounds/rain_2.wav');
            this.load.audio('thunder_1', 'game/assets/sounds/thunder_1.wav');
            this.load.audio('thunder_2', 'game/assets/sounds/thunder_2.wav');
            this.load.audio('thunder_3', 'game/assets/sounds/thunder_3.wav');
            this.load.audio('thunder_4', 'game/assets/sounds/thunder_4.wav');
            this.load.audio('thunder_5', 'game/assets/sounds/thunder_5.wav');
      }

      create()
      {
            this.uiDepth = 1000;
            this.worldRect = new Phaser.Geom.Rectangle(18, 116, gameconfig.scale.width - 36, gameconfig.scale.height - 228);
            this.buttons = {};
            this.hud = {};
            this.statRows = {};
            this.miniGameActive = false;

            this.createAnimations();
            this.loadBiome();
            this.drawBiome();
            this.createSoundRefs();
            this.createWeather();

            if (!this.hasPet()) {
                  this.showStarterSelection();
                  return;
            }

            this.loadState();
            this.processElapsedTime();
            this.resolveBattleIfReady(false);
            this.saveState(false);

            this.createPet();
            this.createHud();
            this.createMenu();
            this.createFloatingText();
            this.createTopButtons();
            this.registerCareTimers();
            this.showToast('Bem-vindo de volta, ' + this.state.name + '!');
      }

      update()
      {
            if (!this.state || !this.pet) {
                  return;
            }

            this.movePet();
            this.updateFloatingText();
            this.refreshHud();
            this.refreshButtons();
      }

      createAnimations()
      {
            for (const pokemon of POKEMON_MANIFEST) {
                  const animKey = pokemon.id + '_idle';
                  if (this.anims.exists(animKey)) {
                        continue;
                  }

                  this.anims.create({
                        key: animKey,
                        frames: this.anims.generateFrameNumbers(pokemon.id, {
                              start: 0,
                              end: Math.max(0, Math.min(pokemon.frames - 1, 23))
                        }),
                        frameRate: Math.min(12, Math.max(6, Math.floor(pokemon.frames / 5))),
                        repeat: -1
                  });
            }
      }

      createSoundRefs()
      {
            this.sounds = {
                  click: this.sound.add('click'),
                  eating: this.sound.add('eating'),
                  purr: this.sound.add('purr'),
                  success: this.sound.add('success'),
                  noaction: this.sound.add('noaction'),
                  boing: this.sound.add('boing'),
                  missedbubble: this.sound.add('missedbubble'),
                  hurt: this.sound.add('hurt'),
                  refreshed: this.sound.add('refreshed'),
                  nameselect: this.sound.add('nameselect')
            };
      }

      loadBiome()
      {
            const saved = localStorage.getItem(saveKey('biome')) || BIOMES[0].ident;
            this.biomeData = BIOMES.find((biome) => biome.ident === saved) || BIOMES[0];
      }

      drawBiome()
      {
            const background = this.add.image(gameconfig.scale.width / 2, gameconfig.scale.height / 2, 'pokegochi_bg')
                  .setDepth(0);
            const scale = Math.max(gameconfig.scale.width / background.width, gameconfig.scale.height / background.height);
            background.setScale(scale);

            this.add.rectangle(gameconfig.scale.width / 2, 56, gameconfig.scale.width, 112, 0x103f34, 0.25).setDepth(4);
            this.add.rectangle(gameconfig.scale.width / 2, gameconfig.scale.height - 44, gameconfig.scale.width, 88, 0x103f34, 0.32).setDepth(4);
      }

      createWeather()
      {
            if (Phaser.Math.Between(1, 4) !== 1) {
                  return;
            }

            if (!this.textures.exists('raindrop')) {
                  const drop = this.make.graphics({ x: 0, y: 0, add: false });
                  drop.fillStyle(0xffffff, 1);
                  drop.fillRect(0, 0, 2, 8);
                  drop.generateTexture('raindrop', 2, 8);
                  drop.destroy();
            }

            const rain = this.add.particles(0, 0, 'raindrop', {
                  x: { min: -20, max: gameconfig.scale.width + 20 },
                  y: -20,
                  lifespan: 1400,
                  speedY: { min: 180, max: 260 },
                  scale: { start: 1, end: 0.3 },
                  quantity: 1,
                  frequency: 70,
                  tint: this.biomeData.raincolor
            }).setDepth(6);

            this.time.delayedCall(45000, () => rain.destroy());
      }

      hasPet()
      {
            return Boolean(localStorage.getItem(saveKey('name')) && localStorage.getItem(saveKey('species')));
      }

      showStarterSelection()
      {
            this.add.rectangle(gameconfig.scale.width / 2, gameconfig.scale.height / 2, gameconfig.scale.width - 34, gameconfig.scale.height - 70, 0x1f1f1f, 0.9)
                  .setDepth(this.uiDepth);
            this.add.text(gameconfig.scale.width / 2, 58, 'Escolha seu Pokemon', {
                  fontSize: '22px',
                  color: '#ffffff',
                  fontFamily: 'Pixel, monospace'
            }).setOrigin(0.5).setDepth(this.uiDepth + 1);
            this.add.text(gameconfig.scale.width / 2, 88, 'Seu parceiro vai salvar progresso neste navegador.', {
                  fontSize: '10px',
                  color: '#c9d7e8',
                  fontFamily: 'Pixel, monospace',
                  align: 'center'
            }).setOrigin(0.5).setDepth(this.uiDepth + 1);

            const startX = 96;
            const startY = 158;
            const gapX = 168;
            const gapY = 104;

            POKEMON_MANIFEST.forEach((pokemon, index) => {
                  const col = index % 2;
                  const row = Math.floor(index / 2);
                  const x = startX + col * gapX;
                  const y = startY + row * gapY;

                  const card = this.add.rectangle(x, y, 132, 82, 0x2b3848, 0.88)
                        .setStrokeStyle(1, 0x7fb5ff, 0.5)
                        .setInteractive({ useHandCursor: true })
                        .setDepth(this.uiDepth + 1);
                  const sprite = this.add.sprite(x, y - 9, pokemon.id, 0)
                        .setScale(pokemon.scale * 0.55)
                        .setDepth(this.uiDepth + 2);
                  const label = this.add.text(x, y + 27, pokemon.displayName, {
                        fontSize: '12px',
                        color: '#ffffff',
                        fontFamily: 'Pixel, monospace'
                  }).setOrigin(0.5).setDepth(this.uiDepth + 2);

                  card.on('pointerover', () => {
                        card.setFillStyle(0x385678, 0.95);
                        sprite.setScale(pokemon.scale * 0.62);
                  });
                  card.on('pointerout', () => {
                        card.setFillStyle(0x2b3848, 0.88);
                        sprite.setScale(pokemon.scale * 0.55);
                  });
                  card.on('pointerdown', () => this.chooseStarter(pokemon));
                  sprite.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.chooseStarter(pokemon));
                  label.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.chooseStarter(pokemon));
            });
      }

      chooseStarter(pokemon)
      {
            this.sounds.click.play();

            const complete = (name) => {
                  const cleanedName = String(name || pokemon.displayName).trim() || pokemon.displayName;
                  const now = Date.now();

                  localStorage.setItem(saveKey('name'), cleanedName.slice(0, 18));
                  localStorage.setItem(saveKey('species'), pokemon.id);
                  localStorage.setItem(saveKey('birthdate'), now.toString());
                  localStorage.setItem(saveKey('updated_timestamp'), now.toString());
                  localStorage.setItem(saveKey('stats_hunger'), '20');
                  localStorage.setItem(saveKey('stats_energy'), '90');
                  localStorage.setItem(saveKey('stats_happiness'), '85');
                  localStorage.setItem(saveKey('stats_affection'), '70');
                  localStorage.setItem(saveKey('level'), '1');
                  localStorage.setItem(saveKey('xp'), '0');
                  localStorage.setItem(saveKey('sleeping'), '0');
                  localStorage.setItem(saveKey('battle_active'), '0');
                  localStorage.setItem(saveKey('battle_end_timestamp'), '0');
                  localStorage.setItem(saveKey('battle_seed'), '0');
                  localStorage.setItem(saveKey('last_feed_at'), '0');
                  localStorage.setItem(saveKey('last_pet_at'), '0');
                  localStorage.setItem(saveKey('last_play_at'), '0');

                  this.sounds.nameselect.play();
                  this.scene.restart();
            };

            if (window.showPrompt) {
                  window.showPrompt('PokeGochi', 'De um nome para ' + pokemon.displayName + ':', complete, pokemon.displayName);
            } else {
                  complete(window.prompt('Nome do Pokemon:', pokemon.displayName));
            }
      }

      loadState()
      {
            this.state = {
                  name: this.getSavedString('name', 'Pokemon'),
                  species: this.getSavedString('species', 'pikachu'),
                  birthdate: this.getSavedNumber('birthdate', Date.now()),
                  updatedTimestamp: this.getSavedNumber('updated_timestamp', Date.now()),
                  hunger: this.getSavedNumber('stats_hunger', 20),
                  energy: this.getSavedNumber('stats_energy', 90),
                  happiness: this.getSavedNumber('stats_happiness', 85),
                  affection: this.getSavedNumber('stats_affection', 70),
                  level: this.getSavedNumber('level', 1),
                  xp: this.getSavedNumber('xp', 0),
                  sleeping: this.getSavedBool('sleeping', false),
                  battleActive: this.getSavedBool('battle_active', false),
                  battleEndTimestamp: this.getSavedNumber('battle_end_timestamp', 0),
                  battleSeed: this.getSavedNumber('battle_seed', 0),
                  lastFeedAt: this.getSavedNumber('last_feed_at', 0),
                  lastPetAt: this.getSavedNumber('last_pet_at', 0),
                  lastPlayAt: this.getSavedNumber('last_play_at', 0)
            };
      }

      saveState(markNow = true)
      {
            if (markNow) {
                  this.state.updatedTimestamp = Date.now();
            }

            localStorage.setItem(saveKey('name'), this.state.name);
            localStorage.setItem(saveKey('species'), this.state.species);
            localStorage.setItem(saveKey('birthdate'), this.state.birthdate.toString());
            localStorage.setItem(saveKey('updated_timestamp'), this.state.updatedTimestamp.toString());
            localStorage.setItem(saveKey('stats_hunger'), this.state.hunger.toString());
            localStorage.setItem(saveKey('stats_energy'), this.state.energy.toString());
            localStorage.setItem(saveKey('stats_happiness'), this.state.happiness.toString());
            localStorage.setItem(saveKey('stats_affection'), this.state.affection.toString());
            localStorage.setItem(saveKey('level'), this.state.level.toString());
            localStorage.setItem(saveKey('xp'), this.state.xp.toString());
            localStorage.setItem(saveKey('sleeping'), this.state.sleeping ? '1' : '0');
            localStorage.setItem(saveKey('battle_active'), this.state.battleActive ? '1' : '0');
            localStorage.setItem(saveKey('battle_end_timestamp'), this.state.battleEndTimestamp.toString());
            localStorage.setItem(saveKey('battle_seed'), this.state.battleSeed.toString());
            localStorage.setItem(saveKey('last_feed_at'), this.state.lastFeedAt.toString());
            localStorage.setItem(saveKey('last_pet_at'), this.state.lastPetAt.toString());
            localStorage.setItem(saveKey('last_play_at'), this.state.lastPlayAt.toString());
      }

      getSavedString(name, fallback)
      {
            const value = localStorage.getItem(saveKey(name));
            return value === null ? fallback : value;
      }

      getSavedNumber(name, fallback)
      {
            const value = Number(localStorage.getItem(saveKey(name)));
            return Number.isFinite(value) ? value : fallback;
      }

      getSavedBool(name, fallback)
      {
            const value = localStorage.getItem(saveKey(name));
            if (value === null) {
                  return fallback;
            }

            return value === '1' || value === 'true';
      }

      processElapsedTime()
      {
            const now = Date.now();
            const elapsed = Math.min(Math.max(0, now - this.state.updatedTimestamp), DAY_CAP_MS);
            const ticks = Math.floor(elapsed / TICK_MS);

            if (ticks <= 0) {
                  return;
            }

            for (let i = 1; i <= ticks; i++) {
                  if (this.state.sleeping) {
                        this.state.energy = clamp(this.state.energy + 8);
                        this.state.hunger = clamp(this.state.hunger + 2);

                        if (this.state.energy >= STAT_MAX) {
                              this.state.energy = STAT_MAX;
                              this.state.sleeping = false;
                        }
                  } else {
                        this.state.hunger = clamp(this.state.hunger + 4);
                        this.state.energy = clamp(this.state.energy - 2);
                        this.state.happiness = clamp(this.state.happiness - 1);

                        if (i % 2 === 0) {
                              this.state.affection = clamp(this.state.affection - 1);
                        }
                  }
            }

            this.state.updatedTimestamp += ticks * TICK_MS;
      }

      registerCareTimers()
      {
            this.time.addEvent({
                  delay: 60 * 1000,
                  loop: true,
                  callback: () => {
                        this.processElapsedTime();
                        this.resolveBattleIfReady(true);
                        this.saveState(false);
                  }
            });

            this.time.addEvent({
                  delay: 18000,
                  loop: true,
                  callback: () => this.showThought()
            });
      }

      createPet()
      {
            const pokemon = getPokemonById(this.state.species);
            const petScale = pokemon.scale * 1.65;

            this.pet = this.physics.add.sprite(gameconfig.scale.width / 2, 330, pokemon.id)
                  .setScale(petScale)
                  .setDepth(20)
                  .setCollideWorldBounds(true);
            this.pet.body.setCollideWorldBounds(true);
            this.pet.body.setBoundsRectangle(this.worldRect);

            this.nameText = this.add.text(this.pet.x, this.pet.y + 96, this.state.name, {
                  fontSize: '12px',
                  color: '#ffffff',
                  fontFamily: 'Pixel, monospace',
                  backgroundColor: 'rgba(0, 0, 0, 0.45)',
                  padding: { x: 6, y: 3 }
            }).setOrigin(0.5).setDepth(21);

            this.sleepText = this.add.text(this.pet.x, this.pet.y - 118, 'Zzz', {
                  fontSize: '20px',
                  color: '#d8ecff',
                  fontFamily: 'Pixel, monospace'
            }).setOrigin(0.5).setDepth(22).setVisible(this.state.sleeping);
      }

      pickPetTarget()
      {
            return new Phaser.Math.Vector2(
                  Phaser.Math.Between(this.worldRect.left + 30, this.worldRect.right - 30),
                  Phaser.Math.Between(this.worldRect.top + 30, this.worldRect.bottom - 30)
            );
      }

      movePet()
      {
            this.pet.setVelocity(0, 0);
            this.pet.setPosition(gameconfig.scale.width / 2, 330);
            this.pet.setAlpha(this.state.battleActive ? 0.45 : 1);

            this.nameText.setPosition(this.pet.x, this.pet.y + 96);
            this.sleepText.setPosition(this.pet.x, this.pet.y - 118);
            this.sleepText.setVisible(this.state.sleeping);
      }

      createHud()
      {
            this.hud.title = this.add.text(10, 8, '', {
                  fontSize: '14px',
                  color: '#ffffff',
                  fontFamily: 'Pixel, monospace'
            }).setDepth(this.uiDepth);
            this.hud.sub = this.add.text(10, 27, '', {
                  fontSize: '10px',
                  color: '#c9d7e8',
                  fontFamily: 'Pixel, monospace'
            }).setDepth(this.uiDepth);

            this.createStatRow('hunger', 'Fome', 10, 48, 0xff6b6b);
            this.createStatRow('energy', 'Energia', 10, 68, 0x77ddff);
            this.createStatRow('happiness', 'Felicidade', 178, 48, 0xffd166);
            this.createStatRow('affection', 'Afeicao', 178, 68, 0xff8ed8);

            this.hud.level = this.add.text(10, 92, '', {
                  fontSize: '10px',
                  color: '#ffffff',
                  fontFamily: 'Pixel, monospace'
            }).setDepth(this.uiDepth);
            this.hud.battle = this.add.text(178, 92, '', {
                  fontSize: '10px',
                  color: '#ffffff',
                  fontFamily: 'Pixel, monospace'
            }).setDepth(this.uiDepth);
      }

      createStatRow(key, label, x, y, color)
      {
            this.add.text(x, y, label, {
                  fontSize: '9px',
                  color: '#ffffff',
                  fontFamily: 'Pixel, monospace'
            }).setDepth(this.uiDepth);
            const bg = this.add.rectangle(x + 58, y + 5, 80, 7, 0x111111, 0.82)
                  .setOrigin(0, 0.5)
                  .setDepth(this.uiDepth);
            const fill = this.add.rectangle(x + 58, y + 5, 80, 7, color, 0.95)
                  .setOrigin(0, 0.5)
                  .setDepth(this.uiDepth + 1);
            const value = this.add.text(x + 142, y - 1, '', {
                  fontSize: '9px',
                  color: '#ffffff',
                  fontFamily: 'Pixel, monospace'
            }).setDepth(this.uiDepth);

            this.statRows[key] = { bg, fill, value };
      }

      createMenu()
      {
            const actions = [
                  { key: 'feed', label: 'Alimentar', icon: 'food', onClick: () => this.feedPokemon() },
                  { key: 'pet', label: 'Carinho', icon: 'hand', onClick: () => this.petPokemon() },
                  { key: 'play', label: 'Brincar', icon: 'ball', onClick: () => this.playWithPokemon() },
                  { key: 'battle', label: 'Batalha', icon: 'health', onClick: () => this.startOrCheckBattle() },
                  { key: 'sleep', label: 'Dormir', icon: 'heart', onClick: () => this.toggleSleep() }
            ];

            actions.forEach((action, index) => {
                  const x = 36 + index * 72;
                  const y = gameconfig.scale.height - 42;
                  const slot = this.add.image(x, y - 13, 'slot').setScale(0.42).setDepth(this.uiDepth).setInteractive({ useHandCursor: true });
                  let icon;

                  if (action.key === 'play') {
                        icon = this.add.sprite(x, y - 14, action.icon, 0).setScale(0.34).setDepth(this.uiDepth + 1);
                  } else {
                        icon = this.add.image(x, y - 14, action.icon).setScale(0.55).setDepth(this.uiDepth + 1);
                  }

                  const label = this.add.text(x, y + 17, action.label, {
                        fontSize: '8px',
                        color: '#ffffff',
                        fontFamily: 'Pixel, monospace'
                  }).setOrigin(0.5).setDepth(this.uiDepth + 1);
                  const cooldown = this.add.text(x, y - 33, '', {
                        fontSize: '8px',
                        color: '#ffd166',
                        fontFamily: 'Pixel, monospace',
                        backgroundColor: 'rgba(0, 0, 0, 0.45)',
                        padding: { x: 3, y: 2 }
                  }).setOrigin(0.5).setDepth(this.uiDepth + 2);

                  const trigger = () => {
                        this.sounds.click.play();
                        action.onClick();
                  };
                  slot.on('pointerdown', trigger);
                  icon.setInteractive({ useHandCursor: true }).on('pointerdown', trigger);
                  label.setInteractive({ useHandCursor: true }).on('pointerdown', trigger);

                  this.buttons[action.key] = { slot, icon, label, cooldown };
            });
      }

      createTopButtons()
      {
            const biome = this.add.image(gameconfig.scale.width - 23, 23, 'biome')
                  .setScale(0.25)
                  .setDepth(this.uiDepth + 1)
                  .setInteractive({ useHandCursor: true });
            biome.on('pointerdown', () => {
                  const index = BIOMES.findIndex((item) => item.ident === this.biomeData.ident);
                  const next = BIOMES[(index + 1) % BIOMES.length];
                  localStorage.setItem(saveKey('biome'), next.ident);
                  this.saveState(true);
                  this.scene.restart();
            });
      }

      refreshHud()
      {
            const pokemon = getPokemonById(this.state.species);
            this.hud.title.setText(this.state.name + ' / ' + pokemon.displayName);
            this.hud.sub.setText(this.state.sleeping ? 'Dormindo' : (this.state.battleActive ? 'Em batalha' : 'Cuidando'));

            this.updateStatBar('hunger', this.state.hunger);
            this.updateStatBar('energy', this.state.energy);
            this.updateStatBar('happiness', this.state.happiness);
            this.updateStatBar('affection', this.state.affection);

            this.hud.level.setText('Nivel ' + this.state.level + '  XP ' + this.state.xp + '/' + xpToNext(this.state.level));
            this.hud.battle.setText(this.getBattleStatusText());
      }

      updateStatBar(key, value)
      {
            const row = this.statRows[key];
            row.fill.displayWidth = Math.max(2, 80 * clamp(value) / STAT_MAX);
            row.value.setText(clamp(value).toString());
      }

      getBattleStatusText()
      {
            if (!this.state.battleActive) {
                  return 'Batalha pronta';
            }

            const remaining = this.state.battleEndTimestamp - Date.now();
            if (remaining <= 0) {
                  return 'Batalha pronta!';
            }

            return 'Batalha ' + formatDuration(remaining);
      }

      refreshButtons()
      {
            const now = Date.now();
            const cooldowns = {
                  feed: this.remainingCooldown(this.state.lastFeedAt, COOLDOWNS.feed, now),
                  pet: this.remainingCooldown(this.state.lastPetAt, COOLDOWNS.pet, now),
                  play: this.remainingCooldown(this.state.lastPlayAt, COOLDOWNS.play, now),
                  battle: this.state.battleActive ? Math.max(0, this.state.battleEndTimestamp - now) : 0,
                  sleep: 0
            };

            Object.entries(this.buttons).forEach(([key, button]) => {
                  const blocked = this.isButtonBlocked(key, cooldowns[key]);
                  button.cooldown.setText(cooldowns[key] > 0 ? formatDuration(cooldowns[key]) : '');
                  button.slot.setAlpha(blocked ? 0.45 : 1);
                  button.icon.setAlpha(blocked ? 0.45 : 1);
                  button.label.setAlpha(blocked ? 0.55 : 1);
            });
      }

      isButtonBlocked(key, cooldown)
      {
            if (key === 'sleep') {
                  return this.state.battleActive;
            }

            if (this.state.sleeping) {
                  return true;
            }

            if (key === 'battle') {
                  return this.state.battleActive && cooldown > 0;
            }

            return this.state.battleActive || cooldown > 0;
      }

      remainingCooldown(lastUsedAt, cooldown, now = Date.now())
      {
            if (!lastUsedAt) {
                  return 0;
            }

            return Math.max(0, cooldown - (now - lastUsedAt));
      }

      feedPokemon()
      {
            if (!this.requireActionReady('feed')) {
                  return;
            }

            const tooFull = this.state.hunger < 15;
            this.state.hunger = clamp(this.state.hunger - 25);
            this.state.energy = clamp(this.state.energy + 3);
            this.state.happiness = clamp(this.state.happiness + (tooFull ? -2 : 4));
            this.state.lastFeedAt = Date.now();

            this.spawnHearts(0xffd166);
            this.sounds.eating.play();
            this.showToast(tooFull ? 'Ainda estava sem fome.' : 'Hora do lanche!');
            this.saveState();
      }

      petPokemon()
      {
            if (!this.requireActionReady('pet')) {
                  return;
            }

            this.state.happiness = clamp(this.state.happiness + 8);
            this.state.affection = clamp(this.state.affection + 6);
            this.state.energy = clamp(this.state.energy - 1);
            this.state.lastPetAt = Date.now();

            this.spawnHearts(0xff8ed8);
            this.sounds.purr.play();
            this.showToast(this.state.name + ' adorou o carinho.');
            this.saveState();
      }

      playWithPokemon()
      {
            if (!this.requireActionReady('play')) {
                  return;
            }

            this.state.happiness = clamp(this.state.happiness + 12);
            this.state.affection = clamp(this.state.affection + 5);
            this.state.energy = clamp(this.state.energy - 8);
            this.state.hunger = clamp(this.state.hunger + 8);
            this.state.lastPlayAt = Date.now();
            this.addXp(3);

            if (Phaser.Math.Between(0, 1) === 0) {
                  this.startBallPlay();
            } else {
                  this.startBubblePlay();
            }

            this.sounds.boing.play();
            this.showToast('Brincadeira rendeu +3 XP.');
            this.saveState();
      }

      startOrCheckBattle()
      {
            if (this.state.sleeping) {
                  this.sounds.noaction.play();
                  this.showToast('Acorde antes de batalhar.');
                  return;
            }

            if (this.state.battleActive) {
                  if (this.resolveBattleIfReady(true)) {
                        this.saveState();
                        return;
                  }

                  this.sounds.noaction.play();
                  this.showToast('Batalha termina em ' + formatDuration(this.state.battleEndTimestamp - Date.now()) + '.');
                  return;
            }

            if (this.state.energy < 35 || this.state.hunger > 70) {
                  this.sounds.noaction.play();
                  this.showToast('Precisa de energia >= 35 e fome <= 70.');
                  return;
            }

            const now = Date.now();
            this.state.energy = clamp(this.state.energy - 20);
            this.state.hunger = clamp(this.state.hunger + 18);
            this.state.happiness = clamp(this.state.happiness - 3);
            this.state.battleActive = true;
            this.state.battleEndTimestamp = now + BATTLE_DURATION_MS;
            this.state.battleSeed = Phaser.Math.Between(1, 999999);
            this.petTarget = null;
            this.pet.setVelocity(0, 0);

            this.sounds.success.play();
            this.showToast('Batalha iniciada: 1 hora.');
            this.saveState();
      }

      resolveBattleIfReady(showMessage)
      {
            if (!this.state.battleActive || Date.now() < this.state.battleEndTimestamp) {
                  return false;
            }

            const condition = this.getConditionScore();
            const chance = clamp(35 + (condition - 50) * 0.7 + this.state.level * 0.5, 15, 85);
            const roll = seededRoll(this.state.battleSeed);
            const victory = roll <= chance;
            const xpReward = victory ? 35 + this.state.level * 4 : 12 + this.state.level * 2;

            this.state.battleActive = false;
            this.state.battleEndTimestamp = 0;
            this.state.battleSeed = 0;
            this.addXp(xpReward);

            if (victory) {
                  this.state.happiness = clamp(this.state.happiness + 10);
                  this.state.affection = clamp(this.state.affection + 2);
                  this.sounds.success.play();
            } else {
                  this.state.happiness = clamp(this.state.happiness - 6);
                  this.state.affection = clamp(this.state.affection + 1);
                  this.sounds.hurt.play();
            }

            if (showMessage) {
                  this.showToast((victory ? 'Vitoria!' : 'Derrota...') + ' Chance ' + Math.round(chance) + '%, XP +' + xpReward + '.');
            }

            return true;
      }

      toggleSleep()
      {
            if (this.state.battleActive) {
                  this.sounds.noaction.play();
                  this.showToast('Nao da para dormir em batalha.');
                  return;
            }

            this.processElapsedTime();
            this.state.sleeping = !this.state.sleeping;
            this.petTarget = null;
            this.sounds.refreshed.play();
            this.showToast(this.state.sleeping ? 'Boa noite.' : 'Acordou!');
            this.saveState();
      }

      requireActionReady(action)
      {
            this.processElapsedTime();
            this.resolveBattleIfReady(true);

            if (this.state.sleeping) {
                  this.sounds.noaction.play();
                  this.showToast('Esta dormindo agora.');
                  return false;
            }

            if (this.state.battleActive) {
                  this.sounds.noaction.play();
                  this.showToast('Esta em batalha.');
                  return false;
            }

            const cooldown = COOLDOWNS[action];
            const lastUsedAt = {
                  feed: this.state.lastFeedAt,
                  pet: this.state.lastPetAt,
                  play: this.state.lastPlayAt
            }[action];

            const remaining = this.remainingCooldown(lastUsedAt, cooldown);
            if (remaining > 0) {
                  this.sounds.noaction.play();
                  this.showToast('Espere ' + formatDuration(remaining) + '.');
                  return false;
            }

            return true;
      }

      getConditionScore()
      {
            return ((100 - this.state.hunger) + this.state.energy + this.state.happiness + this.state.affection) / 4;
      }

      addXp(amount)
      {
            if (this.state.level >= LEVEL_MAX) {
                  this.state.xp = 0;
                  return;
            }

            this.state.xp += Math.max(0, Math.round(amount));

            while (this.state.level < LEVEL_MAX && this.state.xp >= xpToNext(this.state.level)) {
                  this.state.xp -= xpToNext(this.state.level);
                  this.state.level++;
                  this.state.happiness = clamp(this.state.happiness + 5);
                  this.state.energy = clamp(this.state.energy + 5);
                  this.showToast('Subiu para o nivel ' + this.state.level + '!');
            }

            if (this.state.level >= LEVEL_MAX) {
                  this.state.xp = 0;
            }
      }

      startBallPlay()
      {
            this.miniGameActive = true;

            const ball = this.physics.add.sprite(this.pet.x, this.pet.y - 20, 'ball', 0)
                  .setScale(0.45)
                  .setDepth(24)
                  .setBounce(1)
                  .setCollideWorldBounds(true);
            ball.body.setBoundsRectangle(this.worldRect);
            ball.setVelocity(Phaser.Math.Between(-110, 110), Phaser.Math.Between(-90, 90));

            this.time.delayedCall(6000, () => {
                  ball.destroy();
                  this.miniGameActive = false;
            });
      }

      startBubblePlay()
      {
            this.miniGameActive = true;
            let spawned = 0;
            const timer = this.time.addEvent({
                  delay: 650,
                  repeat: 7,
                  callback: () => {
                        spawned++;
                        const bubble = this.add.sprite(Phaser.Math.Between(48, gameconfig.scale.width - 48), this.worldRect.bottom, 'bubble', 0)
                              .setScale(0.07)
                              .setDepth(24)
                              .setAlpha(0.85)
                              .setInteractive({ useHandCursor: true });
                        bubble.on('pointerdown', () => {
                              this.spawnHearts(0x77ddff, bubble.x, bubble.y);
                              this.sounds.missedbubble.play();
                              bubble.destroy();
                        });
                        this.tweens.add({
                              targets: bubble,
                              y: this.worldRect.top,
                              alpha: 0,
                              duration: 3800,
                              onComplete: () => bubble.destroy()
                        });

                        if (spawned >= 8) {
                              this.time.delayedCall(4200, () => {
                                    this.miniGameActive = false;
                              });
                              timer.remove(false);
                        }
                  }
            });
      }

      spawnHearts(tint, x = null, y = null)
      {
            const emitter = this.add.particles(x || this.pet.x, y || this.pet.y - 20, 'particle', {
                  speed: 65,
                  lifespan: 850,
                  quantity: 4,
                  scale: { start: 0.45, end: 0.05 },
                  gravityY: -80,
                  tint
            }).setDepth(26);

            this.time.delayedCall(900, () => emitter.destroy());
      }

      createFloatingText()
      {
            this.toast = this.add.text(gameconfig.scale.width / 2, 126, '', {
                  fontSize: '11px',
                  color: '#ffffff',
                  fontFamily: 'Pixel, monospace',
                  backgroundColor: 'rgba(0, 0, 0, 0.62)',
                  align: 'center',
                  padding: { x: 8, y: 5 },
                  wordWrap: { width: gameconfig.scale.width - 44 }
            }).setOrigin(0.5).setDepth(this.uiDepth + 10).setVisible(false);

            this.thought = this.add.text(this.pet.x, this.pet.y - 82, '', {
                  fontSize: '10px',
                  color: '#ffffff',
                  fontFamily: 'Pixel, monospace',
                  backgroundColor: 'rgba(0, 0, 0, 0.52)',
                  align: 'center',
                  padding: { x: 7, y: 4 },
                  wordWrap: { width: 180 }
            }).setOrigin(0.5).setDepth(25).setVisible(false);
      }

      showToast(text)
      {
            if (!this.toast) {
                  return;
            }

            this.toast.setText(text);
            this.toast.setVisible(true);
            this.toast.setAlpha(1);
            this.tweens.killTweensOf(this.toast);
            this.tweens.add({
                  targets: this.toast,
                  alpha: 0,
                  delay: 2200,
                  duration: 450,
                  onComplete: () => this.toast.setVisible(false)
            });
      }

      showThought()
      {
            if (!this.thought || this.state.sleeping || this.state.battleActive) {
                  return;
            }

            const thoughts = this.pickThoughts();
            const thought = thoughts[Phaser.Math.Between(0, thoughts.length - 1)];
            this.thought.setText(thought);
            this.thought.setVisible(true);
            this.thought.setAlpha(1);
            this.tweens.killTweensOf(this.thought);
            this.tweens.add({
                  targets: this.thought,
                  alpha: 0,
                  delay: 4500,
                  duration: 450,
                  onComplete: () => this.thought.setVisible(false)
            });
      }

      pickThoughts()
      {
            if (this.state.hunger > 75) {
                  return ['Estou com muita fome.', 'Um lanchinho ajudaria agora.', 'Minha barriga esta roncando.'];
            }

            if (this.state.energy < 25) {
                  return ['Estou ficando cansado.', 'Uma soneca seria otima.', 'Preciso recuperar energia.'];
            }

            if (this.state.happiness < 35) {
                  return ['Vamos brincar um pouco?', 'Hoje esta meio parado.', 'Quero fazer algo divertido.'];
            }

            if (this.state.affection < 35) {
                  return ['Fica comigo?', 'Um carinho cairia bem.', 'Gosto quando voce cuida de mim.'];
            }

            return ['Que dia bom!', 'Estou pronto para treinar.', 'Aqui parece um lar.', 'Podemos explorar depois?'];
      }

      updateFloatingText()
      {
            if (!this.thought) {
                  return;
            }

            this.thought.setPosition(this.pet.x, this.pet.y - 82);
      }

      getReadableAge()
      {
            const days = Math.max(0, Math.floor((Date.now() - this.state.birthdate) / (24 * 60 * 60 * 1000)));
            return days === 1 ? '1 dia' : days + ' dias';
      }
}

const gameconfig = {
      type: Phaser.AUTO,
      scene: PokegochiGame,
      physics: {
            default: 'arcade',
            arcade: {
                  gravity: { y: 0 },
                  debug: false
            }
      },
      scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 360,
            height: 640
      },
      about: {
            name: 'PokeGochi',
            version: '1.0',
            author: 'Daniel Brendel, fork by lixudesu',
            contact: '',
            description: 'A Pokemon-inspired virtual pet',
            info: 'This fan-made project is not affiliated with Nintendo, Game Freak, Creatures, The Pokemon Company, Mojang, Microsoft, Bandai, or any of their properties.'
      }
};
