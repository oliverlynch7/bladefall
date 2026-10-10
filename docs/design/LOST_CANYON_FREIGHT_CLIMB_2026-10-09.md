# Lost Canyon freight store: live-level quality pass

The optional HP-04 shard currently uses four direction handles in one fixed order. Reading the rail clue and pressing those handles is the same input pattern as several other campaign locks. The existing freight store is a useful location; keep its geography and reward, and change how the player reaches its brake.

## Player action

From the loaded cart on the western freight route, the player can see a cable running to a high brake above the sealed store. The old-cage ledge gives access to a series of separated scaffold decks. Each landing has a visible support and the next deck is within the game's normal jump reach. A continuous freight path below catches a missed jump; the player can climb back without dying or restarting the main rescue. At the last deck, releasing the brake rolls the loaded cart along its rail and opens the store. The Rift Shard remains at its established position behind the gate.

This is an optional spatial challenge, not a mandatory detour for the prisoners. The clue should identify the brake and show the reward route without prescribing a button order. The old four-handle objects are removed from new play. Old saves with `lc.rail.open` still show an open store; partial sequence state is harmless. The new action writes that same existing flag, so shard persistence and co-op story authority remain unchanged.

## Verification

Check the start and every landing with actual player movement, including one missed jump and a return climb. In the normal camera, confirm that the cart, cable, scaffold and brake read as one physical system and that the cart changes position after release. Verify the unchanged main route, HP-04 pickup, a previous-version save, repeat interaction, and a guest receiving the open gate without receiving the host's personal shard. Automated checks establish reachability and state consistency; the intended difficulty and satisfaction require Oliver's playtest.

## Implemented and checked

The live second half now has seven separated landings from the existing freight-road entry to a high brake. Teal markers and an overhead cable connect the climb to the loaded cart. The cart starts across the store doorway, then follows its drawn rails away over 2.8 seconds when the brake is released. The same lc.rail.open flag removes the existing gate collision and reveals HP-04. The retired direction handles are absent. The brake disappears after use, and its journal note describes the physical change.

Browser checks used normal player jump movement for every landing, a missed jump and return from below, the main rescue route, co-op host/guest sharing with personal shard pickup, checkpoint death/retry, the full five-shard chain, and a prior layout-revision save. The static gate and story unit test passed. Shoulder-camera screenshots from the brake show the blocked doorway before and the visible shard after. The rest of Lost Canyon's terrain and visual language have not been rebuilt here; Oliver still needs to judge the optional climb's feel in play.
