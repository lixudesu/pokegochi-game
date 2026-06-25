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
const PET_SCALE_MULTIPLIER = 1.85;
const HERO_X = 180;
const HERO_Y = 252;

const POKEMON_MANIFEST = [
      { id: 'pikachu', displayName: 'Pikachu', file: 'PIKACHU.webp', frameSize: 50, frames: 56, scale: 2.35 },
      { id: 'bulbasaur', displayName: 'Bulbasaur', file: 'BULBASAUR.webp', frameSize: 38, frames: 49, scale: 2.65 },
      { id: 'charmander', displayName: 'Charmander', file: 'CHARMANDER.webp', frameSize: 42, frames: 53, scale: 2.65 },
      { id: 'squirtle', displayName: 'Squirtle', file: 'SQUIRTLE.webp', frameSize: 43, frames: 26, scale: 2.55 },
      { id: 'eevee', displayName: 'Eevee', file: 'EEVEE.webp', frameSize: 49, frames: 63, scale: 2.35 },
      { id: 'riolu', displayName: 'Riolu', file: 'RIOLU.webp', frameSize: 49, frames: 63, scale: 2.35 },
      { id: 'mimikyu', displayName: 'Mimikyu', file: 'MIMIKYU.webp', frameSize: 96, frames: 63, scale: 1.45 },
      { id: 'gengar', displayName: 'Gengar', file: 'GENGAR.webp', frameSize: 79, frames: 44, scale: 1.75, portrait: 'go/gengar.png', portraitScale: 1.28, selectorScale: 0.32 },
      { id: 'umbreon', displayName: 'Umbreon', portrait: 'go/umbreon.png', portraitScale: 1.22, selectorScale: 0.32 },
      { id: 'registeel', displayName: 'Registeel', portrait: 'go/registeel.png', portraitScale: 1.12, selectorScale: 0.3 },
      { id: 'azumarill', displayName: 'Azumarill', portrait: 'go/azumarill.png', portraitScale: 1.25, selectorScale: 0.32 },
      { id: 'machamp', displayName: 'Machamp', portrait: 'go/machamp.png', portraitScale: 1.16, selectorScale: 0.31 },
      { id: 'sableye', displayName: 'Sableye', portrait: 'go/sableye.png', portraitScale: 1.3, selectorScale: 0.33 },
      { id: 'lanturn', displayName: 'Lanturn', portrait: 'go/lanturn.png', portraitScale: 1.18, selectorScale: 0.32 },
      { id: 'haunter', displayName: 'Haunter', portrait: 'go/haunter.png', portraitScale: 1.26, selectorScale: 0.33 },
      { id: 'victreebel', displayName: 'Victreebel', portrait: 'go/victreebel.png', portraitScale: 1.18, selectorScale: 0.32 }
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

function getPokemonTextureKey(pokemon)
{
      return pokemon.portrait ? pokemon.id + '_portrait' : pokemon.id;
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
            this.load.image('go_pokeball_badge', 'game/assets/ui/go-pokeball-badge.png');
            this.load.image('great_league_badge', 'game/assets/ui/great-league-badge.png');
            this.load.image('ultra_league_badge', 'game/assets/ui/ultra-league-badge.png');
            this.load.image('master_league_badge', 'game/assets/ui/master-league-badge.png');
            this.load.spritesheet('ball', 'game/assets/sprites/ball.png', { frameWidth: 76, frameHeight: 76 });
            this.load.spritesheet('bubble', 'game/assets/sprites/bubble.png', { frameWidth: 512, frameHeight: 512 });
            this.load.spritesheet('particle', 'game/assets/sprites/heart.png', { frameWidth: 32, frameHeight: 32 });
            this.load.json('pokemon_manifest', 'game/assets/pokemons/manifest.json');

            for (const pokemon of POKEMON_MANIFEST) {
                  if (pokemon.file) {
                        this.load.spritesheet(pokemon.id, 'game/assets/pokemons/' + pokemon.file, {
                              frameWidth: pokemon.frameSize,
                              frameHeight: pokemon.frameSize
                        });
                  }

                  if (pokemon.portrait) {
                        this.load.image(pokemon.id + '_portrait', 'game/assets/pokemons/' + pokemon.portrait);
                  }
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
            this.worldRect = new Phaser.Geom.Rectangle(36, 112, gameconfig.scale.width - 72, gameconfig.scale.height - 210);
            this.buttons = {};
            this.hud = {};
            this.statRows = {};
            this.miniGameActive = false;
            this.selectorOpen = false;

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
                  if (!pokemon.file || !pokemon.frames) {
                        continue;
                  }

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

            const stage = this.add.graphics().setDepth(4);
            stage.fillStyle(0x061226, 0.91);
            stage.fillRoundedRect(-24, -28, gameconfig.scale.width + 48, 354, 30);
            stage.fillStyle(0x103f55, 0.42);
            stage.fillRoundedRect(28, 112, gameconfig.scale.width - 56, 170, 34);
            stage.lineStyle(1, 0x9edcf2, 0.22);
            stage.strokeRoundedRect(28, 112, gameconfig.scale.width - 56, 170, 34);

            for (let i = 0; i < 8; i++) {
                  this.add.rectangle(
                        gameconfig.scale.width / 2,
                        82 + i * 24,
                        gameconfig.scale.width,
                        18,
                        i % 2 === 0 ? 0x112b4d : 0x37142d,
                        0.05 + i * 0.01
                  ).setDepth(5);
            }

            this.add.rectangle(gameconfig.scale.width / 2, 522, gameconfig.scale.width, 236, 0xf4fff8, 0.42).setDepth(4);
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

      createPokemonPreview(pokemon, x, y, maxSize, depth)
      {
            const key = getPokemonTextureKey(pokemon);
            const preview = pokemon.portrait
                  ? this.add.image(x, y, key)
                  : this.add.sprite(x, y, key, 0);
            const scale = pokemon.portrait
                  ? (pokemon.selectorScale || 0.32)
                  : Math.min(pokemon.scale * 0.68, maxSize / pokemon.frameSize);

            preview.setScale(scale).setDepth(depth);
            preview.setData('baseScale', scale);
            return preview;
      }

      showStarterSelection()
      {
            const overlay = this.add.graphics().setDepth(this.uiDepth);
            overlay.fillStyle(0x061226, 0.92);
            overlay.fillRoundedRect(12, 18, gameconfig.scale.width - 24, gameconfig.scale.height - 36, 26);
            overlay.lineStyle(2, 0x9be7c0, 0.42);
            overlay.strokeRoundedRect(12, 18, gameconfig.scale.width - 24, gameconfig.scale.height - 36, 26);

            this.add.text(gameconfig.scale.width / 2, 48, 'Escolha seu Pokemon', {
                  fontSize: '20px',
                  color: '#ffffff',
                  fontFamily: 'Pixel, monospace'
            }).setOrigin(0.5).setDepth(this.uiDepth + 1);
            this.add.text(gameconfig.scale.width / 2, 76, 'Toque em um parceiro para comecar.', {
                  fontSize: '10px',
                  color: '#bfe8dc',
                  fontFamily: 'Pixel, monospace',
                  align: 'center'
            }).setOrigin(0.5).setDepth(this.uiDepth + 1);

            const startX = 54;
            const startY = 130;
            const gapX = 84;
            const gapY = 104;

            POKEMON_MANIFEST.forEach((pokemon, index) => {
                  const col = index % 4;
                  const row = Math.floor(index / 4);
                  const x = startX + col * gapX;
                  const y = startY + row * gapY;

                  const card = this.add.rectangle(x, y, 74, 88, 0xf8fffb, 0.96)
                        .setStrokeStyle(2, 0x67d99c, 0.42)
                        .setInteractive({ useHandCursor: true })
                        .setDepth(this.uiDepth + 1);
                  const preview = this.createPokemonPreview(pokemon, x, y - 13, 60, this.uiDepth + 2);
                  const label = this.add.text(x, y + 31, pokemon.displayName.slice(0, 10), {
                        fontSize: '8px',
                        color: '#17313a',
                        fontFamily: 'Pixel, monospace'
                  }).setOrigin(0.5).setDepth(this.uiDepth + 2);

                  card.on('pointerover', () => {
                        card.setFillStyle(0xe6fff1, 1);
                        preview.setScale(preview.getData('baseScale') * 1.08);
                  });
                  card.on('pointerout', () => {
                        card.setFillStyle(0xf8fffb, 0.96);
                        preview.setScale(preview.getData('baseScale'));
                  });
                  card.on('pointerdown', () => this.chooseStarter(pokemon));
                  preview.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.chooseStarter(pokemon));
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
            const key = getPokemonTextureKey(pokemon);
            const petScale = pokemon.portrait
                  ? (pokemon.portraitScale || 1.18)
                  : pokemon.scale * PET_SCALE_MULTIPLIER;

            this.petShadow = this.add.ellipse(HERO_X, HERO_Y + 86, 154, 30, 0x03121c, 0.32)
                  .setDepth(this.uiDepth + 11);
            this.pet = pokemon.portrait
                  ? this.add.image(HERO_X, HERO_Y, key)
                  : this.add.sprite(HERO_X, HERO_Y, key, 0);
            this.pet.setScale(petScale)
                  .setDepth(this.uiDepth + 16)
                  .setAlpha(this.state.battleActive ? 0.55 : 1);

            if (!pokemon.portrait) {
                  this.pet.play(pokemon.id + '_idle');
            }

            this.petBaseY = HERO_Y;
            this.petNameOffset = Math.max(58, this.pet.displayHeight / 2 + 18);
            this.petThoughtOffset = Math.max(84, this.pet.displayHeight / 2 + 36);

            this.tweens.add({
                  targets: this.pet,
                  y: HERO_Y - 7,
                  duration: 1450,
                  yoyo: true,
                  repeat: -1,
                  ease: 'Sine.inOut'
            });

            this.nameText = this.add.text(this.pet.x, this.pet.y + this.petNameOffset, this.state.name, {
                  fontSize: '12px',
                  color: '#ffffff',
                  fontFamily: 'Pixel, monospace',
                  backgroundColor: 'rgba(0, 0, 0, 0.45)',
                  padding: { x: 6, y: 3 }
            }).setOrigin(0.5).setDepth(this.uiDepth + 17).setVisible(false);

            this.sleepText = this.add.text(this.pet.x, this.pet.y - this.petThoughtOffset, 'Zzz', {
                  fontSize: '20px',
                  color: '#d8ecff',
                  fontFamily: 'Pixel, monospace'
            }).setOrigin(0.5).setDepth(this.uiDepth + 26).setVisible(this.state.sleeping);
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
            this.pet.setAlpha(this.state.battleActive ? 0.55 : 1);

            this.nameText.setPosition(this.pet.x, this.pet.y + this.petNameOffset);
            this.sleepText.setPosition(this.pet.x, this.pet.y - this.petThoughtOffset);
            this.sleepText.setVisible(this.state.sleeping);
      }

      createHud()
      {
            this.drawProfileArc();

            this.hud.levelCaption = this.add.text(HERO_X, 18, 'Nivel', {
                  fontSize: '10px',
                  color: '#bde8ff',
                  fontFamily: 'Pixel, monospace'
            }).setOrigin(0.5).setDepth(this.uiDepth + 13);
            this.hud.levelNumber = this.add.text(HERO_X, 48, '', {
                  fontSize: '38px',
                  color: '#ffffff',
                  fontFamily: 'Pixel, monospace'
            }).setOrigin(0.5).setDepth(this.uiDepth + 13);
            this.hud.cp = this.add.text(HERO_X, 88, '', {
                  fontSize: '15px',
                  color: '#e8f7ff',
                  fontFamily: 'Pixel, monospace'
            }).setOrigin(0.5).setDepth(this.uiDepth + 13);

            const selectorGlow = this.add.circle(318, 204, 27, 0x68e69e, 0.95)
                  .setStrokeStyle(3, 0xffffff, 0.9)
                  .setDepth(this.uiDepth + 19)
                  .setInteractive({ useHandCursor: true });
            this.hud.selectorButton = this.add.image(318, 204, 'go_pokeball_badge')
                  .setScale(0.104)
                  .setDepth(this.uiDepth + 20)
                  .setInteractive({ useHandCursor: true });
            const openSelector = () => {
                  this.sounds.click.play();
                  this.togglePokemonSelector();
            };
            selectorGlow.on('pointerdown', openSelector);
            this.hud.selectorButton.on('pointerdown', openSelector);

            const shadow = this.add.graphics().setDepth(this.uiDepth + 7);
            shadow.fillStyle(0x001820, 0.2);
            shadow.fillRoundedRect(14, 310, 332, 214, 24);

            const panel = this.add.graphics().setDepth(this.uiDepth + 8);
            panel.fillStyle(0xffffff, 0.98);
            panel.fillRoundedRect(10, 302, 340, 214, 24);
            panel.lineStyle(2, 0xd8eee4, 1);
            panel.strokeRoundedRect(10, 302, 340, 214, 24);

            this.hud.name = this.add.text(30, 324, '', {
                  fontSize: '22px',
                  color: '#263238',
                  fontFamily: 'Pixel, monospace'
            }).setDepth(this.uiDepth + 18);
            this.hud.species = this.add.text(32, 350, '', {
                  fontSize: '9px',
                  color: '#6f8387',
                  fontFamily: 'Pixel, monospace'
            }).setDepth(this.uiDepth + 18);

            this.hud.conditionPill = this.add.graphics().setDepth(this.uiDepth + 17);
            this.hud.condition = this.add.text(264, 334, '', {
                  fontSize: '8px',
                  color: '#ffffff',
                  fontFamily: 'Pixel, monospace'
            }).setOrigin(0.5).setDepth(this.uiDepth + 18);
            this.hud.leagueBadge = this.add.image(316, 340, 'great_league_badge')
                  .setScale(0.18)
                  .setDepth(this.uiDepth + 18);

            this.add.rectangle(32, 376, 260, 8, 0xe5f3ea, 1).setOrigin(0, 0.5).setDepth(this.uiDepth + 17);
            this.hud.xpFill = this.add.rectangle(32, 376, 260, 8, 0x39d48a, 1).setOrigin(0, 0.5).setDepth(this.uiDepth + 18);
            this.hud.xpText = this.add.text(32, 388, '', {
                  fontSize: '8px',
                  color: '#60757a',
                  fontFamily: 'Pixel, monospace'
            }).setDepth(this.uiDepth + 18);
            this.hud.battle = this.add.text(194, 388, '', {
                  fontSize: '8px',
                  color: '#60757a',
                  fontFamily: 'Pixel, monospace'
            }).setDepth(this.uiDepth + 18);

            this.createStatChip('hunger', 'Fome', 30, 412, 0xff5d66);
            this.createStatChip('energy', 'Energia', 190, 412, 0x43b7ff);
            this.createStatChip('happiness', 'Feliz', 30, 458, 0xffca3a);
            this.createStatChip('affection', 'Afeto', 190, 458, 0xda6cf5);
      }

      drawProfileArc()
      {
            const arc = this.add.graphics().setDepth(this.uiDepth + 10);
            arc.lineStyle(5, 0xffffff, 0.92);
            arc.beginPath();
            arc.arc(HERO_X, 244, 132, Phaser.Math.DegToRad(205), Phaser.Math.DegToRad(335), false);
            arc.strokePath();
            arc.lineStyle(3, 0x89f5d0, 0.28);
            arc.beginPath();
            arc.arc(HERO_X, 244, 126, Phaser.Math.DegToRad(207), Phaser.Math.DegToRad(333), false);
            arc.strokePath();
            this.hud.cpDot = this.add.circle(HERO_X + 120, 196, 6, 0xffffff, 1)
                  .setStrokeStyle(2, 0x89f5d0, 1)
                  .setDepth(this.uiDepth + 12);
      }

      createStatChip(key, label, x, y, color)
      {
            this.add.circle(x, y + 7, 6, color, 1).setDepth(this.uiDepth + 18);
            this.add.text(x + 13, y, label, {
                  fontSize: '8px',
                  color: '#5f6f76',
                  fontFamily: 'Pixel, monospace'
            }).setDepth(this.uiDepth + 18);
            const value = this.add.text(x + 112, y, '', {
                  fontSize: '9px',
                  color: '#20292e',
                  fontFamily: 'Pixel, monospace'
            }).setOrigin(1, 0).setDepth(this.uiDepth + 18);
            this.add.rectangle(x, y + 24, 122, 7, 0xe8f0ec, 1).setOrigin(0, 0.5).setDepth(this.uiDepth + 17);
            const fill = this.add.rectangle(x, y + 24, 122, 7, color, 1).setOrigin(0, 0.5).setDepth(this.uiDepth + 18);

            this.statRows[key] = { fill, value };
      }

      createMenu()
      {
            const dock = this.add.graphics().setDepth(this.uiDepth + 1);
            dock.fillStyle(0x001820, 0.16);
            dock.fillRoundedRect(14, gameconfig.scale.height - 100, gameconfig.scale.width - 28, 88, 28);
            dock.fillStyle(0xffffff, 0.97);
            dock.fillRoundedRect(10, gameconfig.scale.height - 106, gameconfig.scale.width - 20, 88, 28);
            dock.lineStyle(1, 0xd7efe4, 1);
            dock.strokeRoundedRect(10, gameconfig.scale.height - 106, gameconfig.scale.width - 20, 88, 28);

            const actions = [
                  { key: 'feed', label: 'Comida', icon: 'food', color: 0x21c178, onClick: () => this.feedPokemon() },
                  { key: 'pet', label: 'Carinho', icon: 'hand', onClick: () => this.petPokemon() },
                  { key: 'play', label: 'Brincar', icon: 'ball', color: 0x35aef2, onClick: () => this.playWithPokemon() },
                  { key: 'battle', label: 'Batalha', icon: 'health', color: 0xff8f2e, onClick: () => this.startOrCheckBattle() },
                  { key: 'sleep', label: 'Dormir', icon: 'heart', color: 0xe56ad7, onClick: () => this.toggleSleep() }
            ];

            actions.forEach((action, index) => {
                  const x = 35 + index * 72;
                  const y = gameconfig.scale.height - 64;
                  const color = action.color || 0xffd166;
                  const ring = this.add.circle(x, y - 2, 27, color, 0.16)
                        .setStrokeStyle(3, color, 1)
                        .setDepth(this.uiDepth + 2);
                  const circle = this.add.circle(x, y - 2, 22, 0xffffff, 1)
                        .setStrokeStyle(2, 0xffffff, 1)
                        .setDepth(this.uiDepth + 2)
                        .setInteractive({ useHandCursor: true });
                  let icon;

                  if (action.key === 'play') {
                        icon = this.add.sprite(x, y - 2, action.icon, 0).setScale(0.3).setDepth(this.uiDepth + 3);
                  } else {
                        icon = this.add.image(x, y - 2, action.icon).setScale(0.46).setDepth(this.uiDepth + 3);
                  }
                  icon.setTint(color);

                  const label = this.add.text(x, y + 31, action.label, {
                        fontSize: '8px',
                        color: '#2d383d',
                        fontFamily: 'Pixel, monospace'
                  }).setOrigin(0.5).setDepth(this.uiDepth + 3);
                  const cooldown = this.add.text(x, y - 39, '', {
                        fontSize: '8px',
                        color: '#ffffff',
                        fontFamily: 'Pixel, monospace',
                        backgroundColor: 'rgba(25, 51, 43, 0.72)',
                        padding: { x: 3, y: 2 }
                  }).setOrigin(0.5).setDepth(this.uiDepth + 4);

                  const trigger = () => {
                        this.sounds.click.play();
                        action.onClick();
                  };
                  circle.on('pointerdown', trigger);
                  icon.setInteractive({ useHandCursor: true }).on('pointerdown', trigger);
                  label.setInteractive({ useHandCursor: true }).on('pointerdown', trigger);

                  this.buttons[action.key] = { circle, ring, icon, label, cooldown, color };
            });
      }

      createTopButtons()
      {
      }

      togglePokemonSelector()
      {
            if (this.selectorOpen) {
                  this.closePokemonSelector();
                  return;
            }

            this.openPokemonSelector();
      }

      openPokemonSelector()
      {
            this.closePokemonSelector();
            this.selectorOpen = true;
            if (this.toast) {
                  this.toast.setVisible(false);
            }
            if (this.thought) {
                  this.thought.setVisible(false);
            }

            const depth = this.uiDepth + 30;
            this.selectorLayer = this.add.container(0, 0).setDepth(depth);

            const overlay = this.add.rectangle(HERO_X, 320, gameconfig.scale.width, gameconfig.scale.height, 0x02111a, 0.48)
                  .setInteractive();
            overlay.on('pointerdown', () => this.closePokemonSelector());
            this.selectorLayer.add(overlay);

            const panel = this.add.graphics();
            panel.fillStyle(0x0b3b31, 0.28);
            panel.fillRoundedRect(18, 78, 324, 468, 26);
            panel.fillStyle(0xffffff, 0.98);
            panel.fillRoundedRect(14, 72, 332, 468, 26);
            panel.lineStyle(2, 0xd9efe4, 1);
            panel.strokeRoundedRect(14, 72, 332, 468, 26);
            this.selectorLayer.add(panel);

            this.selectorLayer.add(this.add.text(34, 92, 'Trocar Pokemon', {
                  fontSize: '15px',
                  color: '#263238',
                  fontFamily: 'Pixel, monospace'
            }));
            this.selectorLayer.add(this.add.text(34, 116, 'Escolha seu parceiro.', {
                  fontSize: '8px',
                  color: '#6a7880',
                  fontFamily: 'Pixel, monospace'
            }));

            const startX = 54;
            const startY = 170;
            const gapX = 84;
            const gapY = 90;

            POKEMON_MANIFEST.forEach((pokemon, index) => {
                  const col = index % 4;
                  const row = Math.floor(index / 4);
                  const x = startX + col * gapX;
                  const y = startY + row * gapY;
                  const selected = pokemon.id === this.state.species;

                  const card = this.add.rectangle(x, y, 74, 76, selected ? 0xdff8e7 : 0xf6fbf8, 1)
                        .setStrokeStyle(2, selected ? 0x1fc878 : 0xdbece2, 1)
                        .setInteractive({ useHandCursor: true });
                  const preview = this.createPokemonPreview(pokemon, x, y - 10, 58, 0);
                  const label = this.add.text(x, y + 26, pokemon.displayName.slice(0, 10), {
                        fontSize: '7px',
                        color: selected ? '#159456' : '#4d6067',
                        fontFamily: 'Pixel, monospace'
                  }).setOrigin(0.5);

                  const choose = () => this.switchPokemon(pokemon.id);
                  card.on('pointerdown', choose);
                  preview.setInteractive({ useHandCursor: true }).on('pointerdown', choose);
                  label.setInteractive({ useHandCursor: true }).on('pointerdown', choose);

                  this.selectorLayer.add(card);
                  this.selectorLayer.add(preview);
                  this.selectorLayer.add(label);
            });
      }

      closePokemonSelector()
      {
            if (this.selectorLayer) {
                  this.selectorLayer.destroy(true);
                  this.selectorLayer = null;
            }

            this.selectorOpen = false;
      }

      switchPokemon(species)
      {
            if (species === this.state.species) {
                  this.closePokemonSelector();
                  return;
            }

            this.state.species = species;
            this.saveState();

            if (this.pet) {
                  this.tweens.killTweensOf(this.pet);
                  this.pet.destroy();
            }

            if (this.petShadow) {
                  this.petShadow.destroy();
            }

            if (this.nameText) {
                  this.nameText.destroy();
            }

            if (this.sleepText) {
                  this.sleepText.destroy();
            }

            this.createPet();
            this.closePokemonSelector();
            this.sounds.success.play();
            this.showToast('Pokemon trocado para ' + getPokemonById(species).displayName + '.');
      }

      refreshHud()
      {
            const pokemon = getPokemonById(this.state.species);
            const condition = this.getConditionLabel();
            const displayName = (this.state.name || pokemon.displayName).length > 12
                  ? (this.state.name || pokemon.displayName).slice(0, 11) + '.'
                  : (this.state.name || pokemon.displayName);

            this.hud.name.setText(displayName);
            this.hud.species.setText(pokemon.displayName + ' / ' + this.getReadableAge());
            this.hud.cp.setText('CP ' + this.getDisplayCP());
            this.hud.conditionPill.clear();
            this.hud.conditionPill.fillStyle(condition.color, 1);
            this.hud.conditionPill.fillRoundedRect(224, 324, 80, 20, 10);
            this.hud.condition.setText(condition.label);
            this.hud.levelNumber.setText(this.state.level.toString());
            this.hud.leagueBadge.setTexture(this.getLeagueBadgeKey());

            this.updateStatChip('hunger', this.state.hunger);
            this.updateStatChip('energy', this.state.energy);
            this.updateStatChip('happiness', this.state.happiness);
            this.updateStatChip('affection', this.state.affection);

            this.hud.xpFill.displayWidth = Math.max(3, 260 * this.state.xp / xpToNext(this.state.level));
            this.hud.xpText.setText('XP ' + this.state.xp + '/' + xpToNext(this.state.level));
            this.hud.battle.setText(this.getBattleStatusText());

            const progress = Phaser.Math.Clamp(this.getConditionScore() / 100, 0, 1);
            const angle = Phaser.Math.DegToRad(205 + 130 * progress);
            this.hud.cpDot.setPosition(HERO_X + Math.cos(angle) * 132, 244 + Math.sin(angle) * 132);
      }

      getDisplayCP()
      {
            return Math.round(300 + this.state.level * 42 + this.getConditionScore() * 6 + this.state.affection * 2);
      }

      getLeagueBadgeKey()
      {
            if (this.state.level >= 50) {
                  return 'master_league_badge';
            }

            if (this.state.level >= 25) {
                  return 'ultra_league_badge';
            }

            return 'great_league_badge';
      }

      getConditionLabel()
      {
            if (this.state.battleActive) {
                  return { label: 'Batalha', color: 0xff8f2e };
            }

            if (this.state.sleeping) {
                  return { label: 'Sono', color: 0x5aa6ff };
            }

            const condition = this.getConditionScore();
            if (condition >= 82) {
                  return { label: 'Forte', color: 0x21c178 };
            }

            if (condition >= 58) {
                  return { label: 'Bem', color: 0xf6a800 };
            }

            return { label: 'Cansado', color: 0xef5b5b };
      }

      updateStatChip(key, value)
      {
            const row = this.statRows[key];
            row.fill.displayWidth = Math.max(3, 122 * clamp(value) / STAT_MAX);
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
                  button.circle.setAlpha(blocked ? 0.45 : 1);
                  button.ring.setAlpha(blocked ? 0.35 : 1);
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
                  .setDepth(this.uiDepth + 24)
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
                              .setDepth(this.uiDepth + 24)
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
            }).setDepth(this.uiDepth + 26);

            this.time.delayedCall(900, () => emitter.destroy());
      }

      createFloatingText()
      {
            this.toast = this.add.text(gameconfig.scale.width / 2, 522, '', {
                  fontSize: '11px',
                  color: '#ffffff',
                  fontFamily: 'Pixel, monospace',
                  backgroundColor: 'rgba(0, 0, 0, 0.62)',
                  align: 'center',
                  padding: { x: 8, y: 5 },
                  wordWrap: { width: gameconfig.scale.width - 44 }
            }).setOrigin(0.5).setDepth(this.uiDepth + 40).setVisible(false);

            this.thought = this.add.text(this.pet.x, this.pet.y - this.petThoughtOffset, '', {
                  fontSize: '10px',
                  color: '#ffffff',
                  fontFamily: 'Pixel, monospace',
                  backgroundColor: 'rgba(0, 0, 0, 0.52)',
                  align: 'center',
                  padding: { x: 7, y: 4 },
                  wordWrap: { width: 180 }
            }).setOrigin(0.5).setDepth(this.uiDepth + 28).setVisible(false);
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
            if (!this.thought || this.state.sleeping || this.state.battleActive || this.selectorOpen) {
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

            this.thought.setPosition(this.pet.x, this.pet.y - this.petThoughtOffset);
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
