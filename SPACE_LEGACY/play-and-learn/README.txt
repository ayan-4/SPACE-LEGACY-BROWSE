SPACE LEGACY — ROVER SIMULATOR (SYNTAX FIX)
==========================================

This ZIP fixes a packaging error in play.js that caused: SyntaxError: Invalid or unexpected token.

INSTALL:
1. Close the game tab.
2. Back up your existing SPACE_LEGACY/play-and-learn folder.
3. Extract this ZIP.
4. Copy the files inside the extracted play-and-learn folder into your existing SPACE_LEGACY/play-and-learn folder, replacing old files.
5. In VS Code save files, then refresh Live Server with Ctrl+F5.

Keep the main homepage and knowledge-quest folder unchanged.

The game uses Three.js and Rapier from CDNs, so internet is required. The rover chassis has rigid-body physics and collision with large obstacles. Wheels are animated visual components, not independently simulated suspension. The ground physics collider is flat. This is a prototype, not a photorealistic NASA simulator.
