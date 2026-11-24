# Basecamp Shillong · Hostel Owner Sim

A browser game set in Basecamp Shillong, a 30-bed container hostel for founders at Umiam, Meghalaya. The 3D world is the actual 10,000 sq ft design (v2) modelled in Blender.

Run the hostel: set prices, hire and look after your team, run the café, kitchen, laundry and server room, host events, back the founders who stay with you, and survive Shillong's monsoons. Press **Walk as you** to walk around as yourself and talk to guests and staff in person.

## Play locally

It's a static site with no build step. Serve the folder with any static server, for example:

```
python3 -m http.server 8000
```

then open http://localhost:8000. (Opening `index.html` straight from disk won't work, because browsers block module scripts and fetches from `file://`.)

## Files

- `index.html`: layout and styles
- `main.js`: game loop, people, your avatar, panels
- `render.js`: 3D world: sky, lighting, textures, model loading, collision
- `econ.js`: business engine (revenue, costs, demand, staff, incubator)
- `people.js`: characters, their concerns and choices, life news
- `model.b64.txt`: the Blender model (glTF binary, base64-encoded)

three.js and three-mesh-bvh load from the jsDelivr CDN.

## Deploy

Netlify: import this repo, leave the build command empty, and set the publish directory to `.` (already set in `netlify.toml`).

## Credits

- Furniture and plants: [Kenney](https://kenney.nl) Furniture Kit and Nature Kit (CC0)
- People: [Quaternius](https://quaternius.com) Ultimate Animated Character Pack (CC0)
- Engine: three.js
