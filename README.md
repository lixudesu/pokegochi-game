# PokeGochi

A small Pokemon-inspired virtual pet game built on top of Krepagotchi.

You choose a starter Pokemon, give it a name, and keep it happy through feeding, petting, playing, sleeping, and timed battles. Progress is saved in the browser with `localStorage`, so the pet continues to change while you are away.

## Credits

- Original project: [Krepagotchi](https://github.com/danielbrendel/krepagotchi-game)
- Original author: Daniel Brendel
- Fork target: [lixudesu/pokegochi-game](https://github.com/lixudesu/pokegochi-game)
- Additional UI and Pokemon portrait assets adapted from the user-provided `POGO _ TELOS Academy [Mobile App 01] - Thinh Dinh (Community)` PDFs.

This fork keeps the original MIT license and project credits.

## Features

- Starter selection with the original sprite Pokemon plus GO-style portrait options extracted from the provided design PDFs
- Pokemon GO-inspired profile screen with large front-facing Pokemon art, CP arc, level, league badge, XP, and status meters
- Pokemon status: hunger, energy, happiness, affection, level, and XP
- Feeding, petting, playing, sleeping, and biome switching
- One-hour timed battles with win chance based on Pokemon condition and level
- Offline progression capped at 24 hours
- Phaser-powered pixel game loop, existing biomes, weather, sounds, and PWA shell

## Run locally

Install dependencies, then run the Asatru development server:

```sh
npm install
php asatru serve
```

You can also build the frontend bundle:

```sh
npm run build
```

## Build a shippable game

```sh
php asatru game:release [platform]
```

`platform` can be one of:

- `html5`
- `windows`
- `linux`
- `macos`

The packaged builds are stored in `/public/builds`.

## Disclaimer

This is a fan-made project and is not affiliated with Nintendo, Game Freak, Creatures, The Pokemon Company, Mojang, Microsoft, Bandai, or any of their properties.
