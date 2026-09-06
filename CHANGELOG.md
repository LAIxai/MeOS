# MeOS — Changelog (Original Notes)

_Detailed per-version development notes. Moved here from README to keep the README compact._

## v4.1 era — highlights (2026-08 →)

### v4.1.161 (2026-09-06)
- **A raw row gets no added characters at all.** One rule replaces a growing list of exceptions: *raw adds no characters; colour is not a character, so it stays.* The running figures, the round count, the drawn weekday and the drawn 🔓 all disappear with the caret in the block or in Raw mode — Raw is defined as what MeOS looks like switched off, and anything written into the line breaks that definition. This reverses the one exception granted in v4.1.1103 for the clock's remaining time, and nothing is lost by it: the same number is on the Me Dock ⏰ button and in the status bar the whole time. The colours stay — arrow direction, the white running element, the red ⏸, the white ✓ — because they add nothing to the text.

### v4.1.160 (2026-09-06)
- **The running figures no longer split `×12` down the middle.** They were anchored one character back from the end of the comment so that they and the round count could not land on the same spot — but v4.1.149 moved that end past the trailing spaces, and one character back from there is *inside the number*, so `×12` rendered as `×1 [figures] 2`. Both anchors now sit outside the text: the figures right after the last character, the count just before the closing `-->`.

### v4.1.159 (2026-09-06)
- **The caret lands between the `0` and the `s`.** `((30|s 15s)×4 1m)×3` — right at the end of the first number, where Backspace already does the right thing. The brackets, the `×` and the unit are scaffolding; the digits are the only part anyone edits, so that is where the hand should start.

### v4.1.158 (2026-09-06)
- **Ticking Repeat fills the box with a working HIIT.** `((30s 15s)×4 1m)×3` — four rounds of thirty on, fifteen off, a minute between sets, three sets — appears the moment you tick `□ Repeat ↺↻`, with the caret at the end and nothing selected, so you edit the numbers rather than type the shape. The placeholder shows the same pattern. v4.1.157 tried to do this with a `value` attribute on the field, which never survived to the screen.

### v4.1.157 (2026-09-06)
- **Nesting — `((30s 15s)×8 1m)×3` — which is what an interval timer is actually for.** Sets of reps with a rest between sets is the shape every HIIT and circuit app is built around, and it was the one thing the notation could not say. It needs no new symbol: a space already means *and then*, so `(…)×8 1m` reads "that group, then one minute", and the outer level is just the same list one step up. Two rules cover it — **a list is elements joined by a space; an element is a length, or `(list)×N`** — and there is no depth limit.
- **The engine did not change.** The inner nesting is expanded into a flat run of steps, which is exactly the cycle MeOS already counted, and the outermost `×N` is exactly the round limit it already honoured. `((30s 15s)×8 1m)×3` is seventeen steps, three times.
- **The panel opens with the skeleton in the box** — `((30s 15s)×1 1m)×1` — to be edited in place rather than typed from nothing. Change it to `(3m 1m)×12` and you have a world title fight; start it on the opening bell and you can watch how far the real event drifts.
- Written with spaces, shown with `/`: the raw line is what you type, the decorated line is what you read. Everything already written keeps working — `3m/1m`, a bare `×3`, and the old `(↺↻3m/1m)×3` all still read, and are quietly rewritten into the new shape the next time MeOS touches them.

### v4.1.156 (2026-09-06)
- **The two-second lag while scrolling was v4.1.153 opening a 100,000-line membrane over and over.** Its test for "is this folded?" asked whether the line after the ▼ was in a visible range — but a range excludes anything scrolled off screen just as it excludes anything folded, so a large membrane, whose ▼ is almost always above the viewport, read as folded every single time. The log showed it firing twelve times in six minutes. It now only judges a membrane whose ▼ is actually on screen — what you cannot see, you cannot know the fold state of — and never sends the same membrane twice.

### v4.1.155 (2026-09-06)
- **v4.1.154 fixed a door nobody uses.** The Me Dock button posts `viewMode` and goes through the mode cycler, never through `toggleRawMode`, so the clearing added there never ran — the stranded membrane stayed raw and a fourth one joined it. The clearing now sits where the mode is *decided*, so all three doors (button, command, keybinding) get it.

### v4.1.154 (2026-09-06)
- **Raw view can no longer strand a membrane.** Raw is a per-membrane property, and the toggle acted on whichever membrane held the caret *at the moment it was pressed* — so turning it on inside membrane A, moving away, and pressing again set some other membrane and left A raw for good. That membrane then kept showing its open and close lines as comments while every other clock membrane behaved, which is exactly what it looked like. Decoding the view map stored in the file confirmed it: three membranes were sitting at `raw`, plus one written explicitly to `normal` — the footprint of an "off" that landed on the wrong membrane. Pressing the toggle now means *off* whenever anything in the file is raw, and it clears every one of them, so the three already stranded are cleaned up the first time it is pressed.

### v4.1.153 (2026-09-06)
- **The pause count is white inside the membrane too.** Only the ⏸ mark was being cut out of the orange row; the digits beside it stayed under it, and orange is painted `!important`, so white could not win. Both are cut out now — the mark stays red because it is a state, the count is white because it is a result.
- **The drawn 🔓 stays out of Raw.** It is not in the text — MeOS draws it to say "not locked" — and Raw is meant to look like MeOS switched off, so it adds nothing there.
- **A membrane whose badge says ⊕ opens when you enter it.** The badge is a statement of intent, so a membrane marked open that is nonetheless folded is the screen falling behind the intent. The restore at startup runs once per file and nothing put it right afterwards; now entering the membrane asks once more. Only ⊕ is acted on — ⊖ means you folded it yourself — and only on entry, so you can still fold a membrane and look inside it.

### v4.1.152 (2026-09-06)
- **A paused clock now carries two numbers, and they mean different things.** `⏸116` in the text says where the cycle is *now* — the round you would resume into. The `×21` on the borrowed row says where you *stopped*. Keeping only the stopping figure was what made a resumed clock jump from 21 to 116 with no explanation: the origin grid never stops advancing just because the clock does.
- **`⏸N` is refreshed only when the caret enters the membrane.** Once, on entry — not while you sit there typing, which would move the text under your hands, and not on a timer, which would be work for nothing.
- **The digits after `⏸` are white.** The pause mark is red because it is a state; the count beside it is a result, and results get to stand out.
- **No `×N` on a raw row.** With the caret in the block, or in Raw mode, the text's own `⏸N` already says it — the decoration was saying the same thing twice.

### v4.1.151 (2026-09-06)
- **Raw rows get their raw text back, and nothing else.** With the caret in the block, or in Raw mode, the badge row was still carrying the clock's figures and the round count had escaped past the closing `-->`. Not collapsing the row on a raw line was only half the rule — the figures also had to stop being *placed* there. When any row involved is shown raw, the membrane does not borrow: the badge row is just the badge, and the figures return to their old place inside the ⏰ line's own comment. Raw means what MeOS looks like switched off, so the difference between the two views is visible again.

### v4.1.150 (2026-09-06)
- **`×0/12` shows up next to the figures.** It had been anchored one column in from the head — inside the collapsed badge text — and was collapsed along with it. Injected content survives at the edges of a hidden run, not inside it, which is why the figures at column 0 came through and the round count did not. The count now sits at the far end of the row, mirroring the figures, so the draw order stays fixed.

### v4.1.149 (2026-09-06)
- **The clock row shows the appointment, not the envelope.** `<!-- Mew!UFC` and ` -->` are MeOS addressing itself, not something to read, so they are collapsed away and the row reads `⏰🔒 2026-09-05(s) 20:05 ↺↻3m/1m` from column 0. Together with the badge row above it, both rows now start at the head and neither can be cut off by a narrow window.
- **Put the caret in the row and the raw line comes back, whole** — nothing is hidden on a row you are editing. The collapse is zero-width, not `display:none`, so every character keeps its place in the line: the colours, the weekday, the white running element and the figures all still land on the same columns.

### v4.1.148 (2026-09-06)
- **The figures start at the head of the line.** v4.1.147 put them at the right-hand end of the badge row, which does not solve the problem it was meant to solve — narrow the window and they are the first thing cut off. The badge row now lends its space rather than sharing it: its own text is collapsed to zero width and the clock's figures stand at column 0, so they survive any width. On a row shown raw (the caret's line, Raw mode) nothing is collapsed — that row is there to be edited — and the figures simply sit at its head.

### v4.1.147 (2026-09-06)
- **The clock reads as two rows, and the data stays one line.** With remaining and elapsed shown together the ⏰ line had grown wide. The badge row directly above it is now kept unfolded whenever the membrane has a live clock, and the running figures (`⏰ 5.37 0.41 ×0`) are drawn there instead — what is *written* never moves. Splitting the source into two lines was the obvious fix and the wrong one: a clock spread over two lines can no longer be pasted as one, and pasting one UFC line to turn any membrane into a timer is the whole point of putting the clock in the text.
- **A paused clock keeps its count.** Pausing now writes it into the comment as `⏸2` — two turns done. It cannot be recomputed later: the origin grid keeps advancing while the clock is stopped, so the number is only true at the moment you stop. The count also stays on screen while paused.
- **`⏸2` and `×3` are different things and live in different places.** The tail's `×N` says how many turns to run; the head's `⏸N` says how many were run. Writing the result with the same mark as the limit would make a resumed clock stop after two.

### v4.1.146 (2026-09-05)
- **`(…)×N` — a repeat that knows when to stop.** Three rules now cover every clock: **the arrow is the direction, the number is how long one turn lasts, and `(…)×N` is how many turns** (leave it off for endless). `(↺↻3m/1m)×3` is three boxing rounds; `(↻15m)×1` is the one thing the notation could not say before — a stopwatch that runs once, because a stopwatch counts *length minus remaining* and so needs a length.
- **It closes itself.** When the last turn ends, the clock writes its own ✓, folds away, and the next booking below it moves up into the live seat — the same rule that already governed one-shot clocks.
- **`×2/3` while it runs**, so you can read how many turns are left, not just how many have passed.
- **The panel takes the same notation.** Type `3m/1m×3` into the Repeat box; no new control, because the box was already the place that asks how long a turn is. Parentheses are accepted, and `x` for `×`. MeOS reads all three shapes and always writes the one with parentheses.

### v4.1.145 (2026-09-05)
- **The panel opens downward by definition, not by accident.** It had always been told to open *upward* (`bottom:anchor(top)`) with a flip to below when there was no room — so it appeared below only because it was too tall to fit above. v4.1.143 stopped the footer wrapping, the panel got shorter, it fitted above, and up it went. (The v4.1.143 note below has the causality backwards.) Now `top:anchor(bottom)`, and the JS path for hosts without anchor positioning tries below first too; the flip stays as the escape.
- **Ticking Repeat asks for the length.** Checking `□ Repeat ↺↻` now focuses the cycle box and takes `Set ⏰` back out of reach until something is typed there. A tick with an empty box used to set a clock with no repeat at all — the tick said one thing and the clock did another.

### v4.1.143 (2026-09-05)
- **Arrows are coloured whether or not there is a repeat** — the colouring, and the cutting of them out of the orange, sat inside the branch for repeating clocks, so a line carrying only `↺↻` was left orange inside the membrane and colourless outside it. v4.1.1108 separated the arrow from the cycle in the notation; the drawing had not caught up.
- **The footer stops wrapping** — with the direction switch gone there are three controls again, so the row fits on one line. (This note originally claimed it put the panel back below the button; it did the opposite. See v4.1.144.)

### v4.1.142 (2026-09-05)
- **Both faces by default** — the direction switch is gone from the panel; a clock set here always gets `↺↻`, so remaining and elapsed both appear. Anyone who wants one face deletes one arrow in the text, which still reads. One control fewer, one thing fewer to know.
- **Set ⏰ waits until you have said something** — it sits at the right, pale and unclickable until a date, a time, a repeat, a tag or a lock has been touched, and then it darkens. Nobody opens this panel to press Set on what is already there.
- **The round number is neither the ground nor a face** — orange is the colour the whole line turns, and green and cyan belong to the two figures, so the round takes the editor's own foreground.

### v4.1.141 (2026-09-05)
- **The round number comes back inside the comment** — a clock stands inside its comment, before the `-->`; the amber ×N had been put at the end of the line, outside it. Keeping the two apart without leaving the comment just needs one character of distance: the figures sit one place before the `-->`, the round immediately before it. Different places, so the order is settled by the places.

### v4.1.140 (2026-09-05)
- **×0 shows again** — the round was read as `round || 1`, and `||` turns a legitimate 0 into 1, so the wait always claimed to be the first round.
- **Both arrows are cut out of the orange** — only the last one was, leaving the first still orange whenever the membrane's lines turn raw.
- **The round has its own colour and its own place** — remaining and elapsed say where you are inside a round; the round number says which round. Different jobs, so it sits at the end of the line in amber, as a decoration of its own. Being somewhere else also means it cannot get into a drawing-order argument with the figures.

### v4.1.139 (2026-09-05)
- **Each arrow takes its own colour** — the pair was coloured from the line's single direction, which for a two-faced line is neither of them, so both came out green. Reading the character itself also means `↻↺` works as well as `↺↻`: the order does not have to be remembered.
- **The two figures stop swapping places** — they were two decorations of the same kind at the same spot, and nothing decides which is drawn first. One decoration carrying a `before` and an `after` has an order by definition, and still holds two colours.

### v4.1.138 (2026-09-05)
- **`↺↻3m/1m` puts both faces on one line** — remaining in green and elapsed in cyan, from one start time. Two separate lines could drift apart the moment one of the times was edited; with one line there is nothing to keep in step, because there is only one time to write. The round is shown once, since both faces are watching the same round.
- The direction is carried through every rewrite, the scan included, so pausing or finishing a clock cannot quietly reduce it to a single arrow.

### v4.1.137 (2026-09-05)
- **The wait is round zero** — `×0` until the start time, so the number itself says nothing has begun. The first round starts at the gong.

### v4.1.136 (2026-09-05)
- **Before the gong there are no rounds to count, only time to measure** — an hour's wait on a four-minute cycle is not fifteen cycles; it is one wait. The countdown shows how long until the start, the stopwatch how long since the timer was set, and the round stays at 1. When the start time passes, 3m/1m begins and the two go back to sharing the round between them.

### v4.1.135 (2026-09-05)
- **The panel's footer wraps** — a fourth control pushed Set ⏰ off the edge. The row now folds instead of the panel growing, and copy ⏰ sits with the other switches so that the only thing standing on the right is the one that starts a clock.
- Its tip is a sentence shorter; the old one ran off the top of the strip.

### v4.1.134 (2026-09-05)
- **copy ⏰ actually responds** — the button existed and the branch that answers it existed, but the panel finds out which button was pressed by walking up from the click through a list of ids, and the new one was not on the list. A branch nobody can reach looks exactly like a branch that does nothing.

### v4.1.133 (2026-09-05)
- **copy ⏰** — takes the membrane's clock lines, and only those; the badge stays where it belongs. Paste them under another membrane's closing line and that membrane has the same clocks, because a clock belongs to whatever closes above it. No membrane is created and nothing is pasted for you: the button only saves the selecting.

### v4.1.132 (2026-09-05)
- **The figure takes the arrow's colour** — ↺ green for time left, ↻ cyan for time elapsed. The colours already existed on the arrows; carrying them to the numbers means the direction can be read from the number alone, without adding a colour to the page.
- **A repeating clock says which round it is on** — `×3` after the figure, counted in the same pass that works out the next bell. For a 3m/1m pair a round is the pair, which is how a boxing round is counted.

### v4.1.131 (2026-09-05)
- **The subtraction now uses the same rounding as the display** — remaining time is shown rounded up, and elapsed was being worked out from a rounded-down figure, so the pair came to a second over. The check for this is arithmetic rather than shape: it renders both faces from one instant and asserts they add to the length of the turn.

### v4.1.130 (2026-09-05)
- Version numbering settles back down: 1101–1120 were twenty steps past 110, so this is 130.
- **A clock with no membrane above it colours nothing** — it is just text now, so it no longer claims the line above as its partner.
- **Both faces read the same instant** — each was calling for the time of day on its own, and two calls a few milliseconds apart can fall either side of a second. One reading per repaint, so A + B stays equal to the length of the turn.
- **× removes the clock that is running** — a membrane can hold several now, and deleting one booking should not take the ones waiting behind it.

### v4.1.1120 (2026-09-05)
- **A clock belongs to the membrane that closes above it, or to nothing** — a ⏰ line anywhere inside a membrane was being adopted by it, which contradicts the notation: these lines are stacked under the closing membrane. So a line pasted into the middle of some text became the outer membrane's booking, and ringing jumped to the top of that membrane. A line with no closing membrane above it is now just text.
- **The two faces add up** — remaining and elapsed were each rounded down, so together they came to a second short of the round. Elapsed is now taken from the remaining figure as shown, which keeps A + B equal to the length of the turn on screen as well as in principle.

### v4.1.1119 (2026-09-05)
- **Clocks set on the same instant are one clock with two faces** — a round can be watched as time remaining and as time elapsed at once, which is not two timers but one interval read from both ends. Lines sharing a start time all show a figure, each in its own direction; lines with a different time are separate bookings, so only the one nearest the membrane runs. The figure is now worked out from the line rather than from the record, since the direction and the length belong to the line.
- When the bell goes, every line on that same instant is marked done together. Repeating ones are left alone; they have not finished.

### v4.1.1118 (2026-09-05)
- **Finishing a clock no longer flips its direction** — the write that marks one done passed the time, the hold and the lock, but not the direction or the cycle, so a stopwatch came back as `↺✓`. The omission was always there; it only became visible once the arrow was always written.
- **Two clocks set for the same minute are told apart by line** — the running line was identified by its time, which two bookings can share, and then both showed a figure and both took the direction of whichever one was armed.

### v4.1.1117 (2026-09-05)
- **One door builds the record** — a one-shot set from the panel built its own half-formed record, with no `when`, no signature and no position in the series. Without a `when` the guard that shows the figure on the running line only could not tell the lines apart, so both counted; without a signature the text could never re-arm it; and when it rang, it could not say which line had rung, so the ✓ landed on the first one. Membrane clocks are written into the text and left to the arming pass, the way repeating ones already were. Only a clock on the file itself, which has nowhere to be written, still keeps its own record.
- **The ✓ goes on the line that rang** — found by the record's `when` rather than by taking the first one that is not done.

### v4.1.1116 (2026-09-05)
- **The second booking now lands** — the append wrote a newline onto the end of the previous line, while the branch right below it, which has always worked, inserts at the start of the next one. It now uses that shape. The status bar reports a set clock whether or not the write succeeded, so a failed write said nothing at all; a write that comes back false now says so in the log.

### v4.1.1115 (2026-09-05)
- **A new booking is added, not written over the running one** — setting a clock from the panel replaced the first ⏰ line of the membrane, so the clock that was running vanished as you booked the next one. Callers that mean one particular clock — done, paused, renamed, resumed — now say which line they mean; the panel, which means "a new one", adds a line under the group.
- Both clock logs name the line they touched, so the next thing that goes wrong here can be read instead of guessed.

### v4.1.1114 (2026-09-05)
- **The turn's own length** — with `↻3m/1m`, the first entry of the series was written into the state every pass, so on the 1-minute turn the length was still 3 minutes and the elapsed figure started at 2.00. It now asks which turn ends at the time it is waiting for, and keeps that length and that position.
- **White survives inside the membrane** — the orange row paints with `!important`, so a colour laid on top only wins by creation order. The running part is cut out of the orange range instead, the way ✓ and ⏸ already were; the cut now takes a span, not a single character.
- **A ✓ where ⏸ belongs means paused** — the list's ☑ means running and the trailing ✓ means finished, which are opposite senses of one tick. Position decides: a ✓ in the face reads as paused and is rewritten to ⏸. Anyone who can type ⏸ still can.

### v4.1.1113 (2026-09-05)
- **v4.1.1111 had never run once** — it read `owner` above the line that declares it, so every pass threw a ReferenceError straight into the try/catch wrapped around it: nothing drawn, nothing said. The code now sits where `owner` exists and where the line is already known to be the running one. A check watches the order, because a swallowed error looks exactly like working code.

### v4.1.1112 (2026-09-05)
- **Only a finished clock gives up its place** — a paused one keeps it. Pausing says "I will run again", so it has no business handing the turn to the clock below. The ⏰ button and the list's checkbox both write the same ⏸ into the text, so all three doors agree without the rule being written three times.
- **A ✓ written by hand renames the line to FC** — the name is a copy of the state, so the state should carry it. The line then folds away and the next one moves up. The reverse is not read: FC without a ✓ was already given a meaning in v4.1.18 ("the ✓ was removed, run it again"), and one string cannot hold two intentions. Stopping a clock is ✓ or ⏸, and nothing else.

### v4.1.1111 (2026-09-05)
- **The series says which turn it is on** — with `↻3m/1m`, the part being counted right now is drawn in the editor's own foreground colour, so the pair itself shows where you are. Nothing is added to the line; the mark sits on the thing it describes.
- **The figure is no longer orange** — inside a membrane the whole line turns orange, and the countdown disappeared into it. It now takes the editor foreground, so what is running stands out from what is written.

### v4.1.1110 (2026-09-05)
- **Only the clock directly under the membrane runs** — two ⏰ lines on one membrane were fighting over one timer: the state is keyed by file and membrane, so both showed the same figure, the later one armed, and the ✓ landed on the first line instead. The clock nearest the membrane is the one that runs; the ones below it are bookings, and a booking has no figure, arms nothing, and can be edited without waking anything. A finished clock gives up its place, so when a one-shot is done the next line simply becomes the one that runs — no reordering, nothing remembered.

### v4.1.1109 (2026-09-05)
- **Direction and repeat are independent** — pressing the direction button switched Repeat on as well, and six places in the code threw the direction away whenever there was no cycle: the panel's answer, the arm-from-text path, and the one-shot write which simply passed `up: false`. So a stopwatch chosen in the panel was written as ↺, and even a hand-typed ↻ was discarded on the way back in. v4.1.1108 gave the arrow its own meaning; this gives it its own life.

### v4.1.1108 (2026-09-04)
- **The arrow is the direction, the number is the cycle** — a one-shot stopwatch could be chosen in the panel and was gone the moment it was written: the arrow was only ever written alongside a repeat, and reading a line without one always came back "countdown". Two facts now have two marks, and a clock line says what it is without anyone knowing a default. Lines already written keep working: no arrow still reads as countdown.

### v4.1.1107 (2026-09-04)
- **A scrollbar in the Tag&Go room** — the clock list is short enough to take in at a glance, but Tag&Go is where you go looking for something, and there you need to know how much further it runs and where in it you are. One bar says both. It borrows VS Code's own slider colours over a transparent track, so the panel gains no new colour, and the clock list keeps its hidden bar.

### v4.1.1106 (2026-09-04)
- **Don't write the badge while MeOS is moving the folds** — leaving raw mode wrote ⊕ over every ⊖ before the re-fold could run: the badge sync fires on a 120 ms timer, the re-fold of 600 membranes takes seconds, and by then the mode is already normal so v4.1.1105's guard no longer applied. The badge is intent, and a shape caught mid-move is not intent. The same hold now covers the startup restore, which is the path that folds *by* the badges — without it, the restore was free to overwrite its own instructions on the way.

### v4.1.1105 (2026-09-04)
- **The badge records intent, not what the screen happens to show** — raw mode opened the membranes and the badge sync wrote ⊕ over every ⊖, erasing the decision to keep them folded. Leaving raw then had nothing to restore. A membrane in raw mode no longer has its badge rewritten, and any rewrite that does happen now says so in the debug log — the month-old "my folded membranes keep expanding" has a trail to follow.
- **Redraw after the fold changes** — decorations are only applied to visible lines, so lines coming out from under a fold arrive still wearing what they wore while hidden. The redraw ran before the unfold, so it never reached them.

### v4.1.1104 (2026-09-04)
- **Raw mode opens the membranes inside it** — folding was the one thing left outside the mode. v4.0.444 made the mode a property of the membrane and wired up which lines show raw and which spec groups open, but never the membrane's own fold, so raw data stayed hidden under it. Entering raw now opens every membrane in scope; leaving raw puts them back the way the badges say, reading the same badges the startup restore reads. The caret-line raw display still leaves folds alone — that one is a window for editing, not a declaration.
- The mode change writes a line to the debug log, so what a press actually did is a fact rather than a guess.

### v4.1.1103 (2026-09-04)
- **Raw mode adds nothing** — there are two kinds of raw and they mean different things. A caret line is a window opened to edit through, and it still says ▲ when the membrane is folded. Raw mode is a declaration that this is how the file looks without MeOS, so not one character is added there.

### v4.1.1102 (2026-09-04)
- **The mark goes where the mark is** — a folded membrane shown as raw carried a ▼▲ at the head of the line, next to the real ▼ already there in the comment: two of the same thing, one of them a glyph standing outside the text that cannot be pressed. The ▲ now sits directly after the real ▼ inside the comment, so it reads `<!-- {* ▼▲mCN=…` — still raw data, one character added, and folded still says so.

### v4.1.1101 (2026-09-04)
- **Three lines are one thing** — the ▼ became a button again whenever the caret sat on ▲ or on the badge line. A line shows raw data not only when the caret is on it: ▼, ▲ and the badge are one group, so the caret on any of them puts all three into raw. Asking "was the caret on this exact line" missed that. It now asks the real question — at the caret position just before the click, was this line showing raw data — by passing that position to the same function the renderer uses.

### v4.1.110 (2026-09-04)
- **Ask whether the line was raw *before* the click** — v4.1.109 asked after, and pressing ▼ puts the caret on that line, which is what makes a line raw. So every press answered "this is raw" and no membrane could be toggled at all. A line counts as text only if it was already raw: either it shows raw with no caret on it (a Raw membrane), or the caret was already sitting there. Anything else is a click that landed on the decoration — a button press.

### v4.1.109 (2026-09-04)
- **A comment is not a button** — v4.1.108 only narrowed the ▼ target on raw lines; it still left a button inside a comment. There is no mark on that line at all: the ▼ you see in raw data is one character of a comment, not a decoration. Decorated means mark (press it); raw means text (edit it). The tip follows the same ruler, so nothing says "press me" where nothing can be pressed.
- The hit test now asks the same question the renderer asks, landing suppression included — otherwise pressing ▼ would make the line look raw and the second press would do nothing.

### v4.1.108 (2026-09-04)
- **The ▼ hit area follows the display state** — a membrane kept folding and unfolding "by itself" on ordinary clicks. The log named it: the click was on the ▼ button, but the finger was on the first character of the membrane name. v4.0.359 widened the target from the ▼ glyph to just before the name, which is right while the line is decorated — the hidden `<!-- {* ▼mCN=` columns all land there. On a line showing raw data those columns are real characters, and the last one is the name's first letter, the very character v4.0.368 colored as editable. Raw lines now hit only the mark itself.

### v4.1.107 (2026-09-04)
- **Aim the fold at the badge line, not at ▲** — an open membrane closed itself once, and never again. It is a race, not a mystery: leaving the membrane asks VS Code for new ranges, waits 150 ms, then folds at ▲ — and if the new ranges have not landed, no range starts at ▲, so the fold takes the innermost one that contains it, which is the membrane. The badge line only sits inside a range in the settled shape, so folding there either folds the badge group or does nothing at all. Either way it cannot reach the membrane.

### v4.1.106 (2026-09-04)
- **The badge folds back after the caret has been inside** — entering the membrane makes the badge's fold range vanish, and a range that vanishes comes back expanded, so nothing folded it again. The bookkeeping key now stays on ▲ whatever the shape does; only the command target moves.
- **The ⏰ line counts as part of the membrane** — ▼, ▲, badge and ⏰ are one group of four, so clicking the ⏰ line keeps the badge open. Only the open signal reaches it; the fold range still stops short, or the ⏰ would fold.
- **Never aim "unfold" at a hidden line** — a hidden line means something outside it is collapsed, so VS Code opens that instead: click a folded membrane, watch it expand. The fold side has had this guard since v4.0.186; the open side never did.

### v4.1.105 (2026-09-04)
- **The fold shape follows the caret** — v4.1.104 took the badge line out of the fold for good, so it stayed visible even with the caret outside; but FC means folding comment, so out means folded. Now the membrane folds up to ▲ only while the caret is inside it, and goes back to swallowing the badge line when the caret leaves. Neither moment crosses.
- One function decides the shape, and the open/close commands aim at the head it names. Shift the head without moving the target and "open the badge" becomes "open the membrane".

### v4.1.104 (2026-09-04)
- **The badge line moves out of the fold** — FC and UFC lines both live directly under the membrane, but only the ⏰ line survived folding; the badge went back to the right of the open membrane as a blue italic copy, which is the shape MeOS abandoned when badges became FC lines. The membrane now folds up to ▲ only, so the badge line stays where it belongs, folded or not — and it is real text, so it can be edited. The copy is gone.
- A fold needs a head line, and a head line is never hidden. Putting the block's head below ▲ is also what keeps the two ranges apart, so nothing crosses.

### v4.1.103 (2026-09-04)
- **The echo stops where the fold stops** — a folded membrane echoes its FC line at the end of the row, but it counted its own way (up to 4 spec lines) instead of asking the fold. A UFC (⏰) line is never folded, so it stayed visible *and* got echoed: the same alarm twice. The echo now ends at `meosPairBlockEnd`, the one ruler that decides what the fold hides.

### v4.1.102 (2026-09-03)
- **The ↩ goes 1px down** — 6, then 3, then 0, and one pixel is what was left.

### v4.1.101 (2026-09-03)
- **The ↩ moves up 3px** — with the glyph in a span of its own, its resting place is already lower than it
  used to be, so no nudge is the right nudge.

### v4.1.100 (2026-09-03)
- **The ↩ settles halfway.** Centred was too high, 6px dropped it onto the rim; 3px is where it reads as
  being in the middle of the circle.

### v4.1.99 (2026-09-03)
- **The circle is a circle again.** v4.1.98 moved the glyph by shrinking the button's height — but a webview
  is served with the host's own `box-sizing: border-box`, so that height became the outer height and the
  circle turned into a 17x9 ellipse. The glyph now sits in a span of its own and is nudged there; the button's
  box is not touched at all, so no box model can flatten it. The dev harness was missing the host's reset,
  which is why it drew a circle while the real panel drew an ellipse — it has the reset now.

### v4.1.98 (2026-09-03)
- **The ↩ sits 3px lower in its circle.** The glyph's own metrics carried it high; the circle itself is
  unchanged (the padding is taken out of the content height, so the outer 17px stays the same).

### v4.1.97 (2026-09-03)
- **Inside the pinned file, the 📌 becomes ↩ — the way back.** One circle carries both directions: press it
  anywhere to reach the pinned file, press it there to return to the file you came from. The way back is read
  from the recent list (the entry under the pin), so nothing new is remembered. With no file to go back to it
  stays the dimmed 📌 saying *you are here*.

### v4.1.96 (2026-09-03)
- **Setting a membrane colour now creates the badge if the membrane has not got one.** A colour lives in the
  membrane's badge (the `Mew!FC mCN (…)` line after the closing line). A membrane written by hand — or made
  by an older version — has no badge, so choosing a colour in Mepy did nothing at all, silently, and the
  membrane kept the colour its depth gives it. MeOS now writes the badge in the same shape it writes for its
  own membranes. Clearing a colour still creates nothing.

### v4.1.95 (2026-09-03)
- **The 📌 sits 5px higher**, so the white circle only just bites into the corner of the file-name box
  instead of resting on top of it.

### v4.1.94 (2026-09-03)
- **The 📌 shoulder is always there once a file is pinned.** In v4.1.93 it hid itself whenever there was
  nowhere to go — which meant it disappeared exactly when you were sitting in the pinned file, and a button
  you cannot see is a button you cannot learn. It now stays, and simply dims to say *you are here*.

### v4.1.93 (2026-09-03)
- **A 📌 on the shoulder of the file name takes you straight to the pinned file.** One click — no dropdown.
  It rides the corner of the box the way the ⊕/⊖ badges ride the A button, so it costs the name no width,
  and it appears only when there is somewhere to go: no pin, or you are already there, and it stays away.

### v4.1.92 (2026-09-03)
- **The clock list is about the file you have open.** A clock lives in a membrane, and a membrane lives in a
  file — so switching files switches the list, exactly like the H-TOC and the Tag & Go room in the same panel.
  Clocks running in other files are not lost: the status bar has always been the machine-wide one (the next
  bell, its name, `+N` for the rest, and one click gives you all of them with a way to go there).
- The **Tag & Go door now stands even when the file has no clock** — the room is about tags, not about clocks.
- The room and the door's count follow the file too, refreshed once when the file changes.

### v4.1.91 (2026-09-03)
- **The number on a door counts what the door opens.** `Tag & Go · +7` was counting the clocks that did not
  fit in the five rows above it — but behind that door are the *tagged membranes of this file*, so those seven
  were never there. A number nobody could reach. The door now shows how many membranes it will list, and
  nothing when there are none.
- **A clock left on a closed untitled file is dropped from the list.** An untitled document cannot be reopened,
  so a clock hung on one becomes an address with no house. Pressing **New .md** a few times filled all five
  rows with those ghosts, which is why a brand-new file looked like it had never been reset. The list now
  shows only what you can still travel to; nothing is erased — a still-open untitled file is listed as before.

### v4.1.32 (2026-08-30)
- **The mark on the clock that rings next is a ring around the row, not a bar down its edge.** A straight bar
  meets a rounded corner badly — its ends stood outside the curve, like a strip of paper stuck on. A ring
  follows the corner, so nothing juts out, and the wash behind it is stronger now so the row is easy to find.
  The ring is a shadow rather than a border, so no column and no height moves by even a pixel.

### v4.1.33 (2026-08-30)
- **The clock that rings next is marked by a white row inside an orange ring, with plain dark text.** Three
  passes got here. A bar down the edge met the rounded corner badly and stood outside the curve. Filling the row
  with orange was clear but swallowed the ⏰ sitting in it — an alarm clock is red, and so is orange. So the fill
  is white, where that little red clock shows best, and only the ring carries colour: one thing in a row should
  speak in colour, not three. The white does the work against a dark theme; against a light one the ring does.
- The ring is a shadow, not a border, so no column and no height shifts by a pixel.

### v4.1.34 (2026-08-30)
- **The tail of a clock's name sat slightly high, as if it were a superscript.** A name is shown in two pieces so
  the end always survives, and each piece hides its own overflow — which, inside a flex row, costs a box its
  baseline: what gets used instead is the bottom of the box. Two boxes of different heights therefore sit at
  different levels, and the heights did differ, because a Japanese head and a digits-only tail are drawn in
  different faces. Both pieces now have the same stated line height, so whatever face is used the two boxes
  match. The row asks for baselines as well.
- The mark for the clock that rings next now uses plain black text: an alarm clock is red, and orange lettering
  around it was the same family of colour, which took the eye off the little clock the row is about.

### v4.1.90 (2026-09-03)
- **Found why the tooltips were missing**: v4.0.463 turns the shared tooltip off entirely while the ⏰ panel is
  open, and it does so long before any of the placement code — so the two attempts to fix the placement were
  edits to lines that never ran. The rule stays, because the shared tooltip really would cover the panel; the
  reason is now written where the next reader will meet it.
- **The panel's own strip takes over everything in it** — rows, buttons and boxes alike. A plain `title` is
  moved into the strip and removed, so the operating system's own tooltip cannot appear beside it: one panel,
  one place where writing appears.

### v4.1.89 (2026-09-03)
- **The clock list draws its own tooltip.** Twice now the shared one showed for some rows and not others, and
  twice I tried to fix it by reading the code and guessed wrong; a panel that needs one line of text does not
  need seven hundred lines of placement logic. The strip is glued to the top of the panel by CSS — the same
  place for every row, above everything, and it cannot be clicked. Its first line is the membrane's whole name.

### v4.1.88 (2026-09-03)
- **A row's tooltip sits just above the panel, always in the same place.** Following the row was the mistake:
  beside a row it always covers another one, and a list is read with the finger moving. Outside the panel and
  pinned to its top edge, it never covers anything and the eye never hunts for it. Its first line is the
  membrane's whole name, which is what the row had to shorten.
- **The tag bar holds ten**, most recently pressed first; the box finds the rest. What can be laid out has a
  limit, what can be searched does not. A tag you have selected is always kept on the bar even if it falls
  past the tenth, because a thing you just pressed should not vanish.

### v4.1.87 (2026-09-03)
- **A tag written from the panel landed outside the membrane and broke it.** The end of `… // comment *} -->`
  is two closing marks working as one, and only the last was being treated as the end — so the tag went in
  between them, putting `*}` in the middle of the line. The whole run of closing marks is taken as the end now,
  and a tag always lands inside the comment. The line rewriting is a plain function of the text, so it can be
  checked as strings.
- **Enter no longer fires Set from the Tag box.** Confirming a kana-kanji conversion and pressing Enter to mean
  "do it" come from the same key, and in a box that takes Japanese they cannot be told apart — so that box
  commits only when Set is pressed. Elsewhere an Enter arriving mid-conversion is ignored.

### v4.1.86 (2026-09-03)
- **Reopening ⏰▾ comes back to today** — unless the last one was set less than a minute ago, in which case
  everything is left as it was. Setting several things for next month in a row means your finger has not
  stopped; leaving it a minute means a different errand. It is the same minute `Stop ⇄ Undo` uses: the
  interval says what you meant.
- Underneath was a leftover from v4.1.83: with the year drum showing a decade, "go back to today" could not
  find this year inside the 2030s and silently stayed put. Going back now moves the window first.

### v4.1.85 (2026-09-03)
- README — the store page — now describes what v4.1 actually became: the stopwatch, the origin that does not
  move, the ⏰▾ panel, the list of the next five, and Tag & Go.

### v4.1.84 (2026-09-03)
- ⌥ Option on the year drum takes half as much of a push to move: 90 was as far past comfortable as 1 was
  short of it, so it sits between them at 45.
- The value you type into a drum is white while it is selected — orange on orange could not be read.

### v4.1.83 (2026-09-03)
- **The year drum shows a decade.** Ten years at a time, so plain scrolling turns within that decade and you
  can always see which ten you are in; ⌥ Option crosses into the next one, and the window follows. Option now
  moves slowly — the wheel's deltas are accumulated and spent a year at a time — instead of racing away with
  the trackpad's acceleration.
- **Double-click a drum and type the value.** Turning is for looking; typing is for when you already know, and
  2035 is faster said than found. Enter takes it, Escape drops it, and a year typed brings its decade with it,
  so you land where Option would have left you. Values outside a column's range stop at its ends rather than
  inventing one.

### v4.1.82 (2026-09-03)
- **A clock years away reads `≈4y 23:55.17`.** Nobody reads "0 days and 23 hours" about something four years
  off; what is wanted is roughly when, and whether it is still alive — so the days are dropped, the years are
  rounded, and `≈` says the number was rounded rather than pretending otherwise. Under a year it goes back to
  days, where days start to mean something again.
- **Rewriting the time by hand now moves the clock.** Setting 2029 from ▾ and then typing 2030 into the line
  left the clock still counting to 2029 — the text said one thing and the armed copy another. Only a change in
  what is *written* re-arms it, compared as text: recomputing would make a short form like `23:00` drift
  between today and tomorrow and never settle.
- **⌥ Option-scroll on the year runs past the end of the list**, a year per notch, in both directions. The
  short list is right for everyday use; what was missing was a way out of it, so the window moves instead of
  growing.

### v4.1.81 (2026-09-03)
- **One figure stays: the one the ⏰ button is showing.** That is the thing you actually want to know — which
  row the number on the button belongs to — and the other figures were only there to help say it, so they go
  after a few seconds and this one remains, still running, on a faint orange cushion. It is picked by the same
  value the button itself is drawn from, so the two can never point at different rows. Only one element is
  rewritten each second, which is what tooltips wanted anyway.

### v4.1.80 (2026-09-03)
- **The figures in the list run for a few seconds, then go.** Their job is to say which row the ⏰ button's
  number belongs to; once that is said there is no reason to keep moving, and the constant repainting was
  getting in the way of tooltips. They are **removed rather than frozen** — a frozen countdown would be a lie —
  which also hands the width back to the name. Opening the list, or doing anything in it, starts the few
  seconds again.
- **Any tag can be typed to narrow the list**, not only the ones on the bar; it filters as you type. A separate
  **＋** puts what you typed on the membrane the cursor is in, so narrowing and labelling are two buttons
  rather than one with two meanings.
- That box has in fact been invisible since v4.1.72: the list role hides every settings field, and the box was
  wearing the same class. It is exempted now.

### v4.1.79 (2026-09-03)
- **A tooltip in a popup list now appears beside the row you are pointing at.** It was never missing on the
  other rows — it was always drawn at the popup's top edge, which happens to be where the first row is, so
  every row's tip looked like the first row's. The comment above that code said the tip followed the item;
  the code took the popup's rectangle instead. It takes the hovered element's now. This mends every list in
  Me Dock, not only the clocks.

### v4.1.78 (2026-09-03)
- **A row in the clock list is the membrane's name.** The name looked cluttered because the date and time were
  eating the width; moving them into the tooltip hands the whole row to the name, which is the thing that says
  which membrane this is. The tooltip carries all of it — full name, the time it is set for, and how it repeats
  (`↺5m`), so you can see what kind of timer it is without opening anything.
- **A running clock shows its figure instead**, ticking, in the ⏰ colour — the same number the ⏰ button is
  showing, so the row it belongs to is obvious. This matters most in Tag & Go, where rows carry no highlight.
  The name stays beside it: the figure is short, and several clocks running at once should not become several
  anonymous numbers.
- Only the figure is rewritten each second, not the row, so nothing moves under a finger reaching for it.

### v4.1.77 (2026-09-03)
- **Dates on a clock carry their weekday** — `09/03(t)` — in the list, on the ⏰ line, and in the ▾ panel while
  you are choosing the start. A weekday is the thing a plan is actually remembered by.
- It is **worked out, not written**: the date is the truth and the day follows from it, so there is no second
  copy to fall out of step. On the line it is drawn beside the date rather than added to it, and if you type a
  day yourself it is read and then ignored, and not drawn twice. Letters are S-M-T-W-t-F-s, the spelling MeOS
  already uses in membrane names.

### v4.1.76 (2026-09-03)
- **Ticking a box in Tag & Go now shows the tick.** The clock really did start, but that room was built once,
  when its door was pressed, and nothing rebuilt it afterwards — so the mark never moved while the thing it
  marks did. Every hand that changes a clock now refreshes that room as well, from one function, so there is
  no place left to forget.
- **Names read the same in both places.** v4.1.75 gave the name a floor only inside Tag & Go; the list showing
  the same names had none. Both have it now, and tag chips stay in the room — the list is about times, so the
  whole width goes to the name, which is the shape from v4.1.28 with a floor added.

### v4.1.75 (2026-09-03)
- **Membrane names are readable in Tag & Go.** v4.1.74 only freed width when a tag was selected, which is not
  the state you are in when you walk into the room. Both ends of the name now have a floor they cannot be
  squeezed below, the ⏰ glyph is dropped there (that room is about membranes, not clocks) and the time is set
  smaller, so what is left goes to the name.

### v4.1.74 (2026-09-03)
- **A row in Tag & Go warped to the wrong membrane.** The rows were drawn from the tag search but the click
  looked the same position up in the clock list, so pressing the first row went to the first clock. Both now
  read the same list — the third time today that a mark and its action were drawn from two places.
- Names are readable again in that room: the tag you are filtering by is not repeated on every row, and a tag
  chip gives up its width to the membrane name rather than the other way round.

### v4.1.73 (2026-09-03)
- **Tag & Go.** The room behind the sixth row lists *membranes* carrying a tag — with a clock or without one.
  Click a row and you warp there. Tick the box and a clock already written on that membrane starts, after
  which it appears in the list by the one rule the list has always had: soonest first. Nothing is ever put
  into the list by hand, so there is still only one answer to "why is this here?".
- A membrane with no clock shows no time and no box to tick; click it, warp, and set one from ▾. Nothing is
  deleted from this room — it is where you look for something, not where you tidy up.
- The whole search runs only when the door is pressed, so no cursor movement pays for it.

### v4.1.72 (2026-09-02)
- **The list is back to the next five, with a sixth row as the door.** A list you read every day has to be
  short or it stops being read; gathering by tag is a different room, so it gets an entrance instead of being
  spread over the everyday view. The door sits where the sixth row would be, so the eye falls on it without
  being sent anywhere new, and it says how many are behind it. ⏰ always opens on the five.
- **`#tag0` puts a tag on the membrane the cursor is in, in one press** — and a second press takes it off, so
  the same button is both, and a mistake is undone by the hand that made it. It is the plainest way to begin:
  mark a few membranes and they gather.
- **Any tag can be typed** into the box beside it and entered the same way.

### v4.1.71 (2026-09-02)
- **A tag belongs to the membrane, not to the clock** — so it is read from the comment after the `//` on the
  opening line, which is where you are writing anyway. Being "the eyedrops membrane" is true whether a clock is
  set on it or not; hanging the label off the clock meant deleting the clock deleted the label too. Tags
  written on the ⏰ line by v4.1.70 are still read, but nothing is written there any more: one home, so the two
  can never disagree.
- The ▾ panel's **Tag** field writes into that comment, touching only the comment — never the membrane's name
  or its closing marks.

### v4.1.70 (2026-09-02)
- **Clocks can be tagged, and the bar under the list filters by tag.** A tag is written on the clock line
  itself — `#eyedrops` after the time — so it can be grepped, typed by hand, and travels with the file; nothing
  is kept on the side where the plan and its label could drift apart. A clock may carry as many as you like: a
  tag is a mark, not a box, so they are allowed to overlap.
- The bar shows only the tags actually in use, with `all` at its head. Pressing one narrows the list; pressing
  the same one again goes back to `all`, so there is no mode to remember, and a tag that stops being used stops
  being selected rather than leaving an empty list.
- Each row shows its tags, and the ▾ panel has a **Tag** field — opening it shows what the membrane already
  carries, and clearing it takes the tags off.

### v4.1.69 (2026-09-02)
- **Clicking the red warning dismisses it.** Waiting is only for before it has been read; once it has, the
  reader should be able to say so. The list stays open — only the card goes.

### v4.1.68 (2026-09-02)
- **Refusing to rest a locked clock now says so next to the list, in red, and stays there.** It used to be one
  line along the bottom edge of the window — the furthest point from the finger that had just clicked — and it
  was gone before the eye arrived. The card names the row it is about (red outline) and holds for nine seconds
  or until the next click. It also carries the way out: ⌥ Option-click the 🔐. A refusal that does not say what
  to do instead is only half an answer.

### v4.1.67 (2026-09-02)
- **A paused ⏸ is always red.** It used to be white where the line was orange and red elsewhere, which meant
  the same thing wore two colours depending on where you stood. Now that the ↺ and ↻ carry colour on the line,
  red is easy enough to find without the switch.
- **The list and the line no longer disagree about which way a clock runs.** A running clock kept the copy it
  was armed with, so editing ↻ to ↺ in the text left the list still saying ↻ — exactly the "hold two and one
  day they differ" this whole clock was built to avoid. The copy is now refreshed on every re-read; the time
  it rings at is not touched.
- **Clocks are re-read once typing settles**, on the same 400ms beat that already updates the 🐱 count and
  touches no text. Putting a sample inside a code fence now drops it there and then, instead of waiting for a
  save.
- **The ☐ itself is clickable.** It is a child of the button, so clicks on it were falling straight through —
  anywhere inside the visible box now counts, which is what a box is for.
- **The hour and minute open at the current time** rather than half an hour ahead.

### v4.1.66 (2026-09-02)
- **A sample inside a code fence became a real, locked clock again.** Two holes, both now shut. The fence
  guard only *counted* fence lines, so one unmatched ``` anywhere above turned every fence below it inside
  out; fences are now paired by marker and length the way CommonMark does it, and a ~~~ inside a ``` block is
  just text. And a clock, once armed, was never let go — catching the line for one instant while it was being
  pasted was enough to keep it alive forever. Re-arming now drops anything the text no longer states.
- Marks are no longer painted on clock lines inside a fence either: what is drawn and what is armed come from
  the same reading.
- **↺ is green and ↻ is cyan on the line itself** — which is where the colour was wanted. It is cut out of the
  orange first, as the ✓ and the ⏸ already were, so there is no contest over the character.
- The two mode buttons keep their rounded box when they are not checked — a box says a thing can be pressed,
  not that it is on — and the ☐ itself is about 1.4× larger.

### v4.1.65 (2026-09-02)
- **`☐ Repeat` is how a repeat is taken off.** The panel had no such state: an empty box meant "leave whatever
  is written alone", so there was nowhere to say "none". The panel now shows what the membrane already has when
  it opens — the repeat, its turns, and which way it runs — and Set writes back what you see. Changing the
  thing in front of you is the whole of it.
- **↺ is green and ↻ is cyan.** Orange belongs to the clock itself and blue to unlocking, so those were the
  free colours: green for a countdown (there is still time; the face turns orange then red when there isn't),
  cyan for a stopwatch, which only measures. The ↻ in the list is the same cyan — one thing, one colour. The
  two mode buttons went from 10px to 13px.
- **The lock lights the way Encrypt Me does**: orange 🔐 to lock, and once locked the shoulder 🔓 comes up in
  blue rather than staying grey.
- **A locked clock can be unlocked** — ⌥ Option-click the 🔐 in the list, which is where the lock is visible in
  the first place, and the tooltip there says so. Option is required so it cannot come off by a slip. Deleting
  the 🔐 from the line by hand works too; the clock lives in the text.

### v4.1.64 (2026-09-02)
- **The ⏰ ▾ panel now sets which way the clock runs.** `☐ ↺ countdown` is the default; press it and it becomes
  `☑ ↻ stopwatch`. Both ring at the same instants — only the figure is read the other way round.
- **What the columns set is the origin — the point the clock is counted from — and with a repeat it may be in
  the past.** "A time that has gone is a mistake" was only ever true of a one-off.
- **Repeat is typed, not picked**: `10m 3h 00 90m 1d` — `00` says the list ends there, so anything after it is
  kept but not used, which makes the box a place to leave a draft. Put `00` first to take the repeat off, so
  removing it needs no separate button. Units are s m h d w y, and a bare number means minutes. Leave the box
  empty and whatever is already written is left alone — setting a time and dropping a repeat are two different
  intentions. This replaces the one-tap 10 / 25 / 50 / 90 minutes.
- **The lock is now the same unit as Encrypt Me**: 🔐 with 🔓 on its shoulder, sitting beside the boxed
  `→ 2026-09-02 16:38`. Press whichever is lit — 🔐 to lock, the shoulder 🔓 to unlock — then Set.
- **On the line itself, only the locked state is written** (`⏰🔐`, the same character Encrypt Me uses; the old
  🔒 is still read). When it is not locked a dim 🔓 is *drawn* beside the ⏰ rather than written, since a mark
  you cannot press has no business becoming text you would then have to work out how to delete.

### v4.1.63 (2026-09-02)
- **The time written on a repeating clock is where it began, and it no longer moves.** It used to be rewritten
  at every bell, so after a few rounds there was nothing left to say when the thing had been started. It is
  now the origin of the series and stays put; each bell is worked out from it, which takes an arithmetic step
  and no stored state — so there is only ever one thing to be true, and no second copy to fall out of step
  with it. As a side effect a repeat no longer dirties the file every time it rings.
- **The order of an alternating repeat (`↺50/10`) is no longer rewritten either.** Which turn is next follows
  from the origin, so the numbers stay in the order they were written. One more thing that used to hold state
  now doesn't.
- Counting is done in constant time — whole rounds are skipped in one step — so a five-minute repeat begun a
  year ago is worked out without spinning through a hundred thousand turns.

### v4.1.62 (2026-09-02)
- **`Stop` pauses a clock; it does not end its round.** It used to move a repeat on to its next turn and set it
  going again, so the figure fell back to zero, the count carried on, and the bell still rang at the time that
  had supposedly been stopped. Stop now does what the ⏸ in the list has always done: the written time is left
  exactly as it was, ⏸ goes on the line, and the row unchecks. `Undo` simply checks it again — and if the time
  has gone by while it rested, it is worked out afresh onto the next turn. Nothing restarts on its own; only
  Undo restarts it. A clock locked with 🔒 refuses to rest, the same answer the list's ☐ gives.
- **A resting clock stays in the list.** It is a plan, not a memory, so it now sits with the running ones
  instead of being pushed out by them, and the list holds more rows (it scrolls, as it always did).
- **The ⏸ is white where the line is orange, and red everywhere else.** The distinction is the line's colour,
  not where the cursor happens to be — which is what "the rest is orange, so make it stand out" meant in the
  first place. And the white is no longer laid *over* the orange, where whichever was built first would win
  and the same line would come out white one moment and orange the next: the orange range now has that one
  character cut out of it, as was already done for the ✓.

### v4.1.61 (2026-09-02)
- **A resting clock's ⏸ is white while you are inside its membrane, and red once you leave.** Everything else
  on the line is orange, so the pause had nothing to distinguish it. White is enough while you are standing
  there — you have only just set it down. Red is for afterwards, when the thing you are apt to forget is that
  it is stopped at all.
- **Holding ⌥ Option puts `Stop` aside so the list can be opened.** The moment you most want to see what else
  is queued is the minute before a bell, which is exactly when the button had turned into `Stop` and the way
  in was painted over. Option stands the button down while it is held and gives it back the moment it is
  released — nothing is remembered, so there is no new mode. The click itself reads Option directly, so the
  press always matches the finger even if the redraw has not caught up.
- **A save that changes nothing no longer moves the update date.** Cmd+S writes the file whether or not it is
  dirty, and the date shown in Me Dock came from the file's timestamp, so pressing save twice moved it with
  nothing behind it. What that date is for is *when the content last changed*, so when the document is not
  dirty — which settles the question outright, with nothing to compare — the old timestamp is put back after
  the save.

### v4.1.60 (2026-09-02)
- **`↻` is a stopwatch now — the same clock, read the other way round.** `↻15` counts *up* from zero for
  fifteen minutes, goes back to zero, and measures again; `↺15` counts *down* to the same instant. The arrow
  says which way time is running, so there is nothing to memorise, and there is only one engine underneath:
  what is elapsed is simply the interval minus what is left. Nothing extra is stored — no lap number, no
  separate start — because a second thing to remember is a second thing that can disagree with the clock.
- **Neither kind stops on its own.** A countdown may be a weekly thing, and a wristwatch's stopwatch runs
  until you stop it, so both run until stopped: the × in the list, or `Stop` in the last minute.
- The status bar puts `↻` before the figure, since a membrane name is all the context it has; the list marks
  the row the same way. On the ⏰ line itself the figure is left bare — the `↻15` is right there beside it.
- Written by hand on the UFC line for now — put `↻15` at the end of the clock line, where `↺15` would go;
  the button that writes repeats is still to come.

### v4.1.59 (2026-09-02)
- **Stopping can be taken back.** For a minute afterwards the button reads `Undo`, and pressing it puts the
  clock back exactly as it was — so the two can be pressed back and forth as often as you like. Stopping a
  clock is not the sort of thing that should be unrecoverable; anyone can press the wrong button, which is why
  the × in the list stops a running clock instead of refusing. The offer expires after a minute, because
  undoing something from long ago means nothing.

### v4.1.58 (2026-09-02)
- **A repeat is written `↺` now — anticlockwise, because the count runs backwards.** The arrow says which way
  time is going, so there is nothing to memorise. `↻` is still read, so nothing already written breaks; the
  clockwise arrow is being kept for counting *up*.
- **Intervals take days, weeks and years**: `↺30d`, `↺2w`, `↺1y`. There is deliberately no month — a month is
  not a length, it is a rule about a calendar, and putting it in a column of lengths would make it a lie.
  Five weeks is `↺5w`; "the 15th of every month" belongs with the other calendar rules, later.
- **`Stop` no longer says something it will not do.** It appeared only while a sound was actually playing —
  so it vanished in the gaps of the countdown — and pressing it merely silenced the alarm while the clock went
  on to fire. It now appears for the whole of the last minute, with the time remaining beneath it, and pressing
  it ends that round: a one-off is marked done, a repeat moves on to its next turn.

### v4.1.57 (2026-08-31)
- **The whistle is a real whistle now** — three seconds of a high, steady tone. The system sounds are all single
  strikes, so no arrangement of them makes a sound that *holds*; MeOS builds the tone itself the first time it
  is needed and keeps it. Its ends are faded over a few hundredths of a second so it opens and closes instead of
  cracking. The count and the moment now differ in the shape of the sound, not only in its timing — short beats
  against one long note.

### v4.1.56 (2026-08-31)
- **The moment itself gets a whistle.** v4.1.55 had the ringing stop as the time arrived, but going quiet cannot
  say "now" — and with the view already there, nothing at all appeared to happen. The count is a sound that
  continues; the moment is a sound that ends. They should not be the same sound.
- **Being pulled back after the bell has moved you.** The report was that the screen sometimes flickers and stays
  where it was, which says the jump does happen and something undoes it afterwards — the view, not the caret,
  which is why watching the caret found nothing. The membrane is shown again once things have settled, and only
  if it has actually gone off screen. What the view was doing is recorded either way.

### v4.1.55 (2026-08-31)
- **The warning is now a countdown in three stages, the way it is called at an archery line.** Three seconds of
  sound a minute out, five seconds at thirty, and from ten seconds it does not stop until the time arrives.
  Near is louder than far, and the silences in between are what let each one land — a sound with nothing around
  it stops being heard within minutes. Stages closer together than the repeat itself are left out: a clock that
  comes round every minute has no "one minute to go".

### v4.1.54 (2026-08-31)
- **A repeating clock rings for a while and then goes quiet, instead of never stopping.** The warning starts
  thirty seconds ahead when the repeat is a minute or less, a minute ahead when it is longer, and the ringing
  ends when the time arrives. "Rings until you stop it" was decided for a bell that rings once; asked of a clock
  that returns every minute it becomes a chore, and a sound with no silence around it stops being a signal.
  A single, non-repeating clock keeps the old behaviour, warning ten seconds ahead.

### v4.1.53 (2026-08-31)
- **While the clock is ringing it shows what it is waiting for as well as how to stop it** — `Stop` above, the
  time until the next ring below. With a repeat, the ringing is exactly when you most want to know how long is
  left, and the face was giving that space to the word `Stop` alone. One control can say two things.
- **What the bell did is now always written to the MeOS Debug output channel**, whether or not the debug log is
  switched on. The notice that carried it disappears on its own, and a thing being chased must not vanish while
  you are looking at it. It still reaches the log file too, when a path is set.

### v4.1.52 (2026-08-31)
- **Setting a new time no longer wipes a repeat.** The panel wrote the time, the hold and the lock, and nothing
  else — so a `↻` typed onto the line disappeared the moment a time was set from the panel, and what looked like
  a one-minute repeat came back as whatever the panel had. Deciding a new time and giving up on repeating are
  two different intentions; one no longer drags the other along.
- **A ringing ⏰ stops leaning on the 🏠 beside it.** It swells with a transform, which costs no space, so it
  simply grew over its neighbour. The room it needs is now kept free from the start — nothing moves when it
  rings, and nothing is overlapped.
- The line the bell reports is shortened so it can be read without expanding the notice.

### v4.1.50 (2026-08-31)
- Groundwork for a report that the bell moves you to the membrane and then something moves you straight back:
  for six seconds after the bell has taken you somewhere, any move of the caret is recorded with how long after,
  which line, and — the part that settles it — whether a command did it or a hand did.

### v4.1.49 (2026-08-31)
- **The highlight button keeps its height whether or not it carries an underline.** Room for the line was being
  added only when a line was there, so the underlined face stood four pixels taller than its neighbours. The
  room is now always reserved and the growth cancelled, which leaves somewhere for the wave to be drawn without
  the button changing size. A control that changes size is a control that moves under your finger.

### v4.1.48 (2026-08-31)
- **The seconds stay, however far off the time is.** v4.1.47 dropped them past a year on the grounds that they
  carry no information at that distance — but the seconds are not there to say how many; they are there to say
  the thing is running. Take them away and a live countdown is indistinguishable from a frozen one, which is
  exactly the fault found earlier today. Larger units are added in front; nothing below is ever removed.

### v4.1.47 (2026-08-31)
- **A countdown longer than a day is counted in days, and one longer than a year in years.** Everything above an
  hour was being given in hours, so a month away read `720:00.00`. It now reads `30d 00:00.00`, and two years
  reads `2y 12d` — past a year, hours and seconds tell you nothing. The separators keep their jobs: a colon
  between hours and minutes, a full stop between minutes and seconds, and a space wherever a larger unit begins.

### v4.1.46 (2026-08-31)
- **The date wheels stay white until you choose a date, like the line beneath them.** v4.1.45 put today into the
  wheels and let the confirmed line say, in white, that no date had been chosen — but the wheels themselves went
  on showing today in orange. Orange had come to mean "chosen", so the same screen was using one colour for two
  things. The time columns are always orange, because a time is always used; only the date starts out white.

### v4.1.45 (2026-08-31)
- **The date wheels start on today, and Clear returns them to today.** They used to be left blank to say "no
  date chosen", which meant anyone wanting a date had nothing to adjust from — shifting by one day began with
  setting all three columns. Today is now sitting there as the ground to move from. Whether a date has actually
  been chosen is said by the line below instead: white until you touch it, orange once you have. One thing said
  in one place.
- This also closes a hole the day column opened: refilling it for a new month could clear the chosen day, and
  the confirmed line quietly fell back to a derived date. With today always selected, there is nothing to lose.

### v4.1.44 (2026-08-31)
- **⏰ rings ten seconds before it moves you.** The bell and the journey were the same instant, and a hand is
  still moving when a bell goes — mid-composition, with characters not yet committed. The view jumped, and what
  was being typed landed in the membrane it arrived at. Ringing first gives you the moment to stop; the move
  happens at the appointed time, as before. `laiMembrane.clockLeadSeconds` sets the warning (10 by default,
  0 for the old behaviour).

### v4.1.43 (2026-08-31)
- **The countdown on the membrane's line and the one on ⏰ now change in the same instant.** Each was counting a
  second at a time from whenever it happened to start, so the two crossed the second boundary at different
  moments and could be seen a second apart. Neither was wrong — each was right when it was drawn. They no longer
  count intervals at all: both are scheduled onto the moment the figure actually changes, worked out from the
  same target time, so they turn over together.

### v4.1.42 (2026-08-31)
- **The countdown on ⏰ keeps running once you leave the membrane it belongs to.** v4.1.37 moved *which* number
  is shown to the clock that rings next, but what decided whether to keep redrawing was still the membrane the
  caret sat in — so stepping out stopped the beat and the figure froze where it stood. Both now come from the
  same place: the number shown and the reason to keep showing it.

### v4.1.41 (2026-08-31)
- **After the × takes the line away, the caret steps up one line.** Removing a line pulls the one below it up
  under the caret — and that line is outside the membrane, where nothing shows you what just happened. A line
  higher puts you on the closing membrane or its badge comment, which unfolds where you stand and lists the
  spec lines that are left, so you can see for yourself that the ⏰ is no longer among them.

### v4.1.40 (2026-08-31)
- **The × removes a clock's line whether or not it is still running.** Deleting the line lived inside the branch
  that stops a running timer, so a clock whose time had passed lost its place in the list and kept its line —
  and the next time the file was opened, the line put it straight back. That is where "it came back after a
  restart" was coming from. The × means one thing, so it should not behave differently depending on state.
- One press is the whole of it: the line goes, and you are standing where it was. Want it back? Set a clock
  there again — that is what the jump is for.

### v4.1.39 (2026-08-31)
- **A clock written inside a code block is text, and MeOS now leaves it alone.** Quoting the notation in a
  fenced block — the way anyone documents it — was enough to arm a real clock, because the reader that finds
  clocks never looked for backticks. It went further and wrote the countdown into the sample line. The rule
  that a backtick makes what it holds into plain characters was settled in v4.0.58; this is the fourth place
  it had not reached. Without it, MeOS cannot be used to write about MeOS.

### v4.1.38 (2026-08-31)
- **Choosing a clock from the list takes you to the clock, not to the top of the membrane it belongs to.** A
  membrane can run to tens of thousands of lines, and arriving at its head told you nothing about where the
  clock line actually was — so a clock set somewhere by mistake had to be hunted for with a search. The list is
  about clocks; it now lands on the line the clock is written on, where you can read it, change it or delete it.
  Anyone can set one by accident, and finding it should not be a search.
- Being fetched by the bell still takes you to the head of the membrane: that journey is for reading what you
  left there, which is a different errand.

### v4.1.37 (2026-08-31)
- **A colon now only ever separates hours from minutes.** Past an hour the countdown read `18:26.07` — colon
  between hours and minutes, full stop between minutes and seconds — but under an hour it read `18:07`, putting
  a colon where the full stop belonged. The same mark meant two different things depending on how long the
  number happened to be, so a short one read as hours and minutes. Minutes and seconds are now always joined by
  a full stop: `18.07`. You can read it without counting the fields.
- **The number on ⏰ is the clock that rings next.** The button lit up whenever a clock was running anywhere,
  but the number beside it belonged to the membrane the caret happened to be in — one button answering from two
  different questions, which is how a clock nearly nineteen hours out came to be shown while a twenty-minute one
  was the one being waited on. Each membrane's own countdown was never lost: it sits on that membrane's closing
  line, where it has been since v4.0.451. The clock grows as that next one approaches, too.

### v4.1.36 (2026-08-31)
- **The orange ring on a running clock now goes round the whole control, not half of it.** It was drawn on the
  ⏰ face alone, so it stopped at the seam and left the ▾ standing outside — the outline of one piece broke in
  the middle. v4.1.18 had already settled this question for size: ⏰ and its ▾ are one piece, so what happens to
  the piece is applied to the piece. The ring simply never got moved across with it. Both faces now carry the
  same grey edge and read as a single white pill; only the ring speaks in colour.

### v4.1.35 (2026-08-30)
- **Unticking a clock set before v4.1.12 now sticks.** Resting a clock is recorded as a ⏸ on its line in the
  text — and a clock from the older scheme has no line, so the rest was recorded nowhere at all. It stopped for
  as long as the window stayed open, then the record in the file's mMETA membrane raised it again. Touching such
  a clock now moves that one clock into the text first, and from then on it behaves like any other. Nothing is
  written by merely opening a file: only the clock you actually press.
- **New command — MeOS: Sweep old ⏰ records out of mMETA.** It moves every remaining old record onto its own
  membrane in the text and clears the ones with nowhere to go, so the file ends up with a single place where a
  clock can live. It counts them for you first and waits for a yes; converting in bulk is a decision for a
  person to make, never something to do behind their back.

### v4.1.31 (2026-08-30)
- **Dropping a clock now clears every line that belongs to it, not just the first one found.** A membrane can
  end up carrying more than one clock line — inside a very large membrane, any clock line that is not directly
  under a closing membrane is taken as that membrane's — and the × was only ever removing the first.
- **The × now says what it actually removed**: the text line, the mMETA record, the list, and whether it is
  still running. A clock lives in three places, so seeing which one survived names the culprit instead of
  leaving it to guesswork.

### v4.1.30 (2026-08-30)
- **A clock on an older membrane no longer comes back after you drop it.** Clocks set before v4.1.12 live in the
  file's own mMETA membrane rather than on a line of text, and the × was only asking for that record to be
  written out "in a moment". Reload inside that moment and the request was gone, so the clock reappeared at the
  top of the list with nothing in the text to explain it. The × now writes straight away, and this window also
  remembers what you dropped, so a record that has not reached the disk yet cannot bring it back either.
- Because mMETA lives inside the file, dropping such a clock leaves the file unsaved — the × now says so.

### v4.1.29 (2026-08-30)
- **The × no longer closes the list.** Clearing something out is tidying, and you cannot finish tidying if the
  shelf disappears as you work. Choosing a row still closes the panel — that one means "take me there".
- **The day column now follows the month, leap years included.** February offers 28 days, or 29 in a leap year;
  the short months stop at 30. Nothing counts the days and no leap-year rule is written down — the date object
  already knows, and a rule copied here is a rule that drifts from the real one eventually. Pick the 31st and
  then move to February and the day settles onto the last one there is.
- Groundwork for a clock that landed seventy years in the future: every rewrite of a clock's line is now
  recorded, before and after, and a clock set more than five years out says so on the status bar as it happens.

### v4.1.28 (2026-08-30)
- **A clock's name is now shortened from the middle, never from the end.** Membranes copied with Mepy share a
  name and differ only in the minutes and seconds at the tail, so cutting the tail made every copy look
  identical. The last nine characters — hours, minutes, seconds and the zone, which is simply how a MeOS name
  is built — always survive; the head gives way first, then the tail if the panel is narrower still. No width
  is measured anywhere: one box shrinks, the other does not, and CSS settles it.
- **The scrolling columns stop at their ends, and the next stroke wraps around.** Reach 59 and it stays at 59;
  pause, stroke again, and it comes round to 00. The signal for "paused" was already there — the timer that
  settles the column onto a row — so nothing new had to be remembered.

### v4.1.27 (2026-08-30)
- **Edit a clock's time in the text, save, and the list now says so.** The timer was restarting correctly all
  along; the list simply never redrew. The guard that decides whether to redraw was built from five things —
  mode, time left, scope, inheritance, ringing — and the clock list was not one of them, so however much the
  list changed, an unchanged guard meant an unchanged panel. Worse, "time left" belongs to the membrane the
  caret is in, and a clock's line sits *below* its closing membrane, so editing one leaves that number at zero.
  What gets drawn is now part of deciding whether to draw.

### v4.1.26 (2026-08-30)
- **A finished clock in the list was showing the wrong time** — the moment the file happened to be opened,
  not the moment it rang, which is why every unticked row read the same time as every other. It now shows the
  time written on the membrane, so the list says when each one actually went off.

### v4.1.25 (2026-08-30)
- **Ticking a clock back on now starts it.** v4.1.24 answered "that time has passed" and stopped there, which
  was the wrong reply: someone who ticks the box has already decided to use it. The clock keeps the time of day
  it was given and moves to the next day that time comes round — the rule MeOS already had for a bare `18:30`,
  applied to a written date as well. The new date is written back into the line, so the page and the file agree.
  A repeating clock (`↻`) is left alone; it already knows how to find its next round.
- **A clock written on a membrane stays in the list even when it is not running.** Only finished and running
  clocks were being remembered, so a clock that was neither quietly slid out of the five-row window as the
  others refreshed — which is why unticking, then looking again, showed nothing to tick back on.
- **The clock that rings next is marked** — one row, a bar down its left edge and a faint wash. Only one, so
  there is a single place for the eye to land.

### v4.1.24 (2026-08-30)
- **A checkbox at the left of every clock in the list — which timers are in use.** Twenty years ago the same
  switch sat on a countdown timer written in BTRON's scripting language, and it is the piece the list was
  missing: a plan you are not running today is not a plan you want to throw away.
- **Resting is not deleting.** The × forgets a clock — the line goes, and it does not come back. A rest keeps
  the time exactly where it is written and simply stops it ringing, so one click brings it back at the same
  time. Skipping today's eye drops should not cost you the setting.
- The rest is written **in the text**, as `⏸` on the clock's own line, beside 🔒 and 👁. Keeping it anywhere
  else would mean the clock arms itself again the next time the file is opened.
- Ticking a clock back on **does not ask you for a time**: it uses the one already written. If that moment has
  gone, a repeating clock (`↻`) moves to its next round, and a one-off says so instead of guessing.
- The checkbox neither jumps nor closes the panel — it is there to pick several. 🔒 clocks cannot be rested,
  for the same reason they cannot be dropped.

### v4.1.23 (2026-08-30)
- **Repeating clocks.** `<!-- Mew!UFC ⏰ 2026-08-30 01:40 ↻05 -->` rings every five minutes. Several intervals
  alternate: `↻50/10` is fifty minutes, then ten, then fifty again. The order itself is the state — each time
  it rings, the first step moves to the back, so there is nothing else to keep track of.
- A repeating clock never gets a ✓; it is not finished. It keeps its time up to date and stays UFC.
- Away for a while? It skips the rounds you missed and sets the next one.
- **Seconds.** `09:30:15` as a time, and `↻30s` / `↻15s` as intervals — for the calls that come in the last
  minute. Written back only when there are seconds to write.

### v4.1.22 (2026-08-30)
- **The ✓ blinks in time with the button now.** It was drawn once a second, so a blink took two — while the
  button breathes in 0.8. The redraw runs faster while a clock is ringing, and goes back to its usual pace
  when the ringing stops.

### v4.1.21 (2026-08-30)
- **Fixed: folded comments that would not open again.** Click the membrane header and its comments should
  unfold. They did not, because the pass that folds them in bulk never told MeOS it had folded them — so MeOS
  went on believing they were open and never opened them. Only the editor’s own fold arrow could recover.

### v4.1.20 (2026-08-30)
- **The time left stands inside the comment**, just before the `-->`, the way the clock has always stood
  inside the comment field of a membrane line.
- **While a clock is ringing, its ✓ blinks** in step with the button — no new timer, just the beat that is
  already there.

### v4.1.19 (2026-08-30)
- **The ✓ is white — by making room for it, not by painting over it.** Two builds tried to win the colour
  fight; both lost, because whoever wins depends on which decoration was created first. The orange now skips
  that one character instead.
- **A spent clock folds away as it should.** Turning it back into an FC was not enough: the membrane still
  ended at its badge, so the comments below reached past it and a crossing pair of folds cannot fold. The
  membrane now ends where the folding comments end — and UFC, which never folds, stays outside.

### v4.1.18 (2026-08-29)
- **A clock that has rung becomes an FC again, and folds away.** UFC while it still has to be seen, FC once it
  is spent — the name carries the state. Clear the ✓, give it a new time, save: it starts again and takes its
  UFC back.
- The ✓ is white even on an orange line now. The orange was painted with `!important`, so white had to be too.
- **Dropping a clock from the history really drops it.** The line, the old entry in the file’s meta, and the
  remembered list — all three. One of them used to survive and put the clock back every time the file opened.
- The ⏰ and its ▾ grow together when a clock is ringing.

### v4.1.17 (2026-08-29)
- **UFC — a comment that does not fold.** `FC` is a Folding Comment; `UFC` is an Unfolding one. A clock is
  written as `<!-- Mew!UFC ⏰ 2026-09-01 20:05 -->` now, and the name itself says why it stays visible. It is
  a kind, not an exception for the clock: anything that has to stay in sight can wear it.
- Both are read. Clocks written by earlier builds as `Mew!FC ⏰` keep working, and keep staying open.

### v4.1.16 (2026-08-29)
- **The time left shows on the clock line itself.** A schedule earns its keep by being visible, so the ⏰ line
  is now one MeOS never folds — which is also what stops it from crossing the membrane fold that made the
  membrane collapse on its own. Folding hides the comments; the clock stays.
- Copying or duplicating a membrane still carries its clock along. What gets folded and what gets carried are
  two different questions, and they now have two different answers.

### v4.1.15 (2026-08-29)
- **Fixed: a membrane with a clock folded itself when you left it.** Its fold and the fold of the comments
  beneath it had come to overlap without nesting, and an overlap sends the fold outwards — onto the membrane.
  The clock line now belongs to the membrane, so the two nest again. It also means the clock travels with the
  membrane when you copy it.
- **One clock face, on the membrane header.** The time left was showing twice; and folding hides everything
  except the header, so the header is the one place that is always there.
- The ✓ turns white only while the cursor is in that membrane — where the line is showing raw in orange.

### v4.1.14 (2026-08-29)
- **The countdown now shows on the clock line as well.** Fold a membrane and its closing line goes with it,
  taking the time left along. The ⏰ line stays behind, so the clock now wears its face there too.
- **Past an hour, the time reads as hours.** `7:30.00` instead of `450:30` — a number you can picture.
- The ✓ on a clock that has rung is drawn in white, so it stands out on a line of orange raw text.

### v4.1.13 (2026-08-29)
- **The ⏰ button now writes the clock into the text.** Setting one leaves `<!-- Mew!FC ⏰ 2026-09-01 20:05 -->`
  under the membrane, where you can see it, search it and edit it by hand. The button writes an absolute time —
  "in 50 minutes" cannot survive being read back tomorrow. Written by hand, the short `23:00` still works.
- When it rings, a ✓ is written where the clock was. Dropping a clock removes the line.
- **Fixed: a clock was not attached to its membrane** when anything sat between them — a badge comment, for
  instance. Instructions stack under a block, so the search now steps over them to find the membrane.

### v4.1.12 (2026-08-29)
- **A clock can be written as text now.** `<!-- Mew!FC ⏰ 23:00 -->` under a membrane sets a clock on it —
  no Me Dock, no buttons. Write it in any editor, on any device, and MeOS picks it up when you open or save
  the file. Add 🔒 to lock it; a ✓ marks one that has already rung.
- Until now a clock lived inside the meta membrane, where you could neither see it nor search for it. In the
  text, it is visible where it applies, and `Mew!FC ⏰` finds every one you have set.
- Reading is generous, writing stays narrow: the line belongs to the membrane that closes just above it, but a
  clock written inside a membrane is understood too. Buttons still write to the old place for now.

### v4.1.11 (2026-08-29)
- **Both clock panels line up with the clock, by definition.** Their right edge is now declared to be the
  right edge of the ⏰▾ key itself, rather than worked out in arithmetic that depended on when it was measured.
  Nothing is computed, so nothing can drift — the history and the settings panel land in the same place.

### v4.1.10 (2026-08-29)
- **The history opens under the clock, not off to the left.** It was lining up with the ⏰ half rather than the
  whole key, and it was measured the instant it opened — before its contents were in it. It now lines up with
  the pair, and places itself again on the next frame, once it knows its real size.

### v4.1.9 (2026-08-29)
- **The clock now measures up to the sisters it stands with.** Their height comes from one shared rule that the
  clock was missing from, and their ▾ is a button — which does not inherit a font — while the clock's was a
  span, so the same character came out smaller. Both are fixed at the source rather than patched with numbers.
- **The hairline between a button and its ▾ is back.** It is the main button's own right edge, and the clock
  had been covering it — invisible while the fill was orange, and sorely missed once both halves went white.

### v4.1.8 (2026-08-29)
- **White under the clock.** A red ⏰ on an orange fill loses the very mark it is made of. The button is white
  now, like the reference group, and a running clock is said by the ring around it rather than by the fill.
- **The three ▾ menus are cut from one rule.** Same white, same glyph, same target — and the buttons they hang
  off share a height, so a ▾ can no longer come out smaller than its sisters'.

### v4.1.7 (2026-08-29)
- **The clock is no longer drawn faint.** Faint used to mean "no clock on the membrane you are standing in" —
  a leftover from when ⏰ was a mode tool. It is a doorway to your clocks now, and worth the same from
  anywhere. It lights up whenever a clock is running, wherever it was set.
- **It is shaped like its neighbours.** Same corners, size and fill as the four sisters it now stands with,
  in the clock's own orange.

### v4.1.6 (2026-08-29)
- **The clock moved into Hyper IDX, right of 🏠.** A clock is no longer a way to hold Pseudo👁 — it is a place
  you decided to come back to, which is what the four sisters are. ⏰ goes there, ▾ sets one, and the countdown
  travels with them.
- **A clock that has rung stays in the file.** It used to be deleted, so the list depended entirely on storage
  kept beside the app. Now the file remembers its last few, the way it already remembered the ones still
  running — open the file and the history comes back, whatever happened to the app.

### v4.1.5 (2026-08-28)
- **Any clock can be dropped — including one that is running.** Starting the wrong clock happens to everyone.
  × stops it first, then forgets it, and it takes you to the membrane before either.
- **A lock, for when you do mean a test paper.** 🔓/🔒 next to Set. Locked clocks cannot be dropped until the
  time is up, and their row shows 🔒 instead of ×. The choice applies to the clock you set next and goes back
  to off every time the panel opens, so a lock can never be left lying across your day.
- The × is drawn as a button now, not a faint mark.

### v4.1.4 (2026-08-28)
- **The clock history survives a restart.** It was kept in memory only, so closing the window — or installing
  the next build — emptied it. A list that dies is a state, not a history. It is stored with you now, not in
  the file: the file only carries a clock that has yet to ring.
- **× on a row forgets it — after taking you there.** You land on the membrane first, so if you did not mean
  it you are already standing where you can set it again. Running clocks have no ×: what you would want to
  drop there is the clock, not the memory of it, and a clock in progress has no way out by design.

### v4.1.3 (2026-08-28)
- **The date starts empty again, and clear works.** Drawing the summary line must not move the wheels: a big
  orange number on a wheel means *you chose this*, so putting the worked-out day there told a lie — and it
  overwrote clear the instant you pressed it.
- **The time is always orange.** A time is always used, so there is no unset state for it. Only the date can
  be empty, so only the date turns grey.
- Wider clock panel, so a selected year is not clipped. clear now looks like a button.

### v4.1.2 (2026-08-28)
- **One line at the bottom of the clock, instead of three places showing the same thing.** The date box, the
  time box and the echo line all carried the same value. Now a single line says what happens when you press
  Set — and you click that line to type it in, so the place you read is the place you write.
- **Orange is what you set, grey is what MeOS worked out.** Leave the date alone and it shows the day your
  time actually lands on — today, or tomorrow if that time has gone by — in grey. Touch a wheel and that
  half turns orange. (The old grey date was a sample string baked into the box, not a real date.)

### v4.1.1 (2026-08-28)
- **Going to a membrane opens it in the editor, not beside Me Dock.** Without naming a column, VS Code opens a
  document wherever you pressed — and you pressed inside the dock, which lives in the column next to the text.
  The column is not something to search for: the document is already open in one, or Me Dock is already watching
  one; failing both, the first.
- **⏰ shows the history, ▾ sets a clock.** They were opening the same panel, which left ▾ with nothing of its
  own to do. Now each has one job — and each gets the width its job needs (236 for names you can read, 172 for
  the wheels).
- **The panel stands away from Me Dock.** Its background was the dock's own dark, so the edge was invisible; it
  is lifted a step now, with a stronger border. Everything that is not the orange of a clock reads in the
  editor's own foreground instead of a faint grey, and the Date / Time headings take aqua — a different job from
  the clock values, so a different colour.

### v4.1.0 (2026-08-28)
- **⏰ opens inside Me Dock now, and it opens onto a list.** Up to five clocks you have set — the running ones
  first, in orange, then the rest in the order you set them. Click one and you are at that membrane. A clock you
  set marks a place you decided to come back to, so it keeps its worth after it has rung: what was there before
  was a *status*, this is a *history*.
- **The list says the time, not what is left of it.** A plan is remembered as "18:30"; the remaining time is a
  subtraction you do on the spot, and subtractions do not line up next to each other. The date appears only when
  it is not today — a date you already know adds nothing to read. (The face and the status bar keep counting
  down; those answer a different question — how long until I am wanted.)
- The panel is narrower: 190px instead of 236. What set the old width was the four digits of the year.


## v4.0 era — highlights (2026-08 →)

### v4.0.474 (2026-08-28)
- One more description of the superseded form removed from the feature list: MeOS reads its settings from a
  folding comment on the line below, not from the end of the line.

### v4.0.473 (2026-08-28)
- **The wheel follows your fingers again, and only lands when you let go.** The click-to-click feel came from
  snap points, which pulled every movement onto a row and left no in-between — so the picture disagreed with the
  hand. The snapping is gone; the numbers now move by pixels, the enlarged figure keeps up as they pass, and the
  nearest row is taken **when you lift your fingers**. Since the value is settled on release, the journey is free
  to be analogue.
- **The alarm can ring without a gap** — `laiMembrane.clockRepeatSeconds` takes decimals now, so 0.6 is
  effectively continuous. 0 still means one chime.
- The README's opening example gives a plain bullet its own folding comment too, so each line's instruction sits
  under it and says only what that line is.

### v4.0.472 (2026-08-28)
- **A careful stroke moves one row, not two.** The step threshold is raised — and raising it does not slow a fast
  sweep, because the operating system enlarges each scroll message *only* when your fingers move quickly. One
  threshold therefore gives both: crawl and it takes several messages to cross, sweep and every message crosses
  on its own. The same acceleration that caused the trouble in v4.0.467 is doing the work here.

### v4.0.471 (2026-08-28)
- **The clock rings loud enough to wake you.** Glass is a courtesy; an alarm has a job. The default is Sosumi now,
  and `laiMembrane.clockVolume` amplifies it past the file's own level (Basso, Funk and Submarine also carry;
  Ping and Tink stay gentle).
- **The README's opening example was teaching the superseded form.** It showed the instruction at the end of the
  line, which v4.0 moved *below* the line as a folding comment — the whole point being that a sentence keeps its
  own line and the page reads clean. The example and the sentence above it now show what MeOS actually writes.
- The two newest entries in the feature list carry the same `(v4.0)` mark as the rest of what is new.

### v4.0.470 (2026-08-28)
- **Lift your fingers and the number settles into the window by itself.** Until now the wheel repainted which row
  was chosen but never corrected where it sat, so the enlarged figure could come to rest half-way across the
  frame. It now glides into place, which is what makes "it landed" visible.
- The positions were being worked out from a hard-coded row height, so a border or a box-sizing difference of a
  pixel or two accumulated into exactly that drift. **Rows are counted by index now**, and each is placed from
  its own measured position, so any height of column centres correctly.
- The threshold for a step is lower, so a slow, careful stroke moves the wheel instead of feeling stuck.

### v4.0.469 (2026-08-28)
- **⏰ keeps ringing until you stop it**, the way an alarm clock does. A single chime can be missed and leaves
  nobody any the wiser; a sound that stops only when someone stops it *is* the proof that someone noticed. Press
  ⏰ — while it is ringing that is what the button does, and it does not open the menu, because what you want at
  that moment is quiet. The status bar entry stops it too. It gives up on its own after five minutes, so a
  machine left alone does not ring forever, and `laiMembrane.clockRepeatSeconds: 0` goes back to one chime.

### v4.0.468 (2026-08-28)
- **There were more than two paths that fold.** v4.0.466 fixed the two that the log caught in the act; counting
  every caller turned up a third that runs on the scroll signal — which is exactly what a click in the editor
  produces, and therefore the likeliest cause of the case reported as "just clicking in the editor". It now
  consults the same shared note, and writes to it before folding, like the other two. The hand-invoked "fold the
  spec lines" command was given the same courtesy, so pressing it twice cannot fold a membrane.

### v4.0.467 (2026-08-28)
- **One notch of the wheel moves one row, every time.** The same flick used to travel six rows or twenty-nine,
  because macOS inflates the size of each scroll message the faster your fingers move. Taking one row per message
  removes that entirely: acceleration swells what each message *says*, but not how many messages arrive, so
  distance now follows how far your fingers travelled rather than how fast. Sweeping from 00 to 59 in a couple of
  passes still works — a longer sweep simply sends more messages.

### v4.0.466 (2026-08-28)
- **The jump to the top of a membrane is fixed, and this time it was measured rather than guessed.** The log
  caught it: two folding paths folded the same block 2 ms apart. The first fold was correct; the second landed on
  a block that was already folded, and folding an already-folded block folds the **enclosing membrane** instead —
  which is why the view leapt three thousand lines to its head.
- The reason both ran is that **the guard only faced one way**: the batch path stood down while the per-caret
  path was working, but not the other way round. It faces both ways now.
- And the older guard — "only fold what is visible and actually open" — could not help here, because
  `visibleRanges` is still stale two milliseconds after a fold. Checking with your eyes cannot beat two
  milliseconds. So both paths now consult **a shared note of what was just folded**, written before folding
  rather than after; whichever path arrives second already knows.

### v4.0.465 (2026-08-28)
- **⏰ makes a sound.** Every other signal it had — the jump, the notice, the status bar — only reaches someone who
  is looking, and the whole reason to set a clock is that you are doing something else until it rings. MeOS
  borrows the operating system's own sound rather than shipping one (`laiMembrane.clockSound`: a name from
  /System/Library/Sounds on macOS, a beep on Windows; empty for silence).
- **The wheels stop when you touch them.** Snap points only take effect once scrolling has stopped, so a flick
  used to sail past them, and a click could not halt it because the momentum belongs to the OS, not to the page.
  Now each item is a hard stop, so a flick moves one step at a time — and touching a column writes its own
  position back, which cuts the momentum dead. Touch it and it stops.

### v4.0.464 (2026-08-28)
- **While the ⏰ panel is open, no tooltip appears at all.** The panel labels itself, so an explanation laid over
  it is only in the way. The JavaScript tips were already held back; the CSS ones fire on `:hover` alone and
  needed their own stop — a single marker on the document while the panel is open turns every one of them off,
  so nothing has to be listed button by button and a button added later is covered without thinking about it.

### v4.0.463 (2026-08-28)
- **⏰ and its ▾ are one piece again** — adjoining corners squared off, one line between them, like every other
  split button.
- **Two things that appeared miles from where they belonged now appear where they belong.** The view-mode tip and
  the clock panel were both being placed by measuring coordinates in JavaScript, and Me Dock lives under the
  host's CSS zoom, where those measurements do not line up. The house had already solved this once: **do not
  measure — let the thing be a child of the button and let CSS put it there.** The panel is now a child of ▾, and
  the mode tip joins the same `::after` family as ⚠️ and TOP. No coordinate arithmetic is left in either path.
- **The pickers are wheels now**: three rows, the middle one twice the size, and it is the middle row that is
  selected — so the frame you look at never moves and only the numbers travel under it. Scroll-snap does the
  work, so there is no inertia to tune, and a blank row above and below lets the first and last values reach the
  middle too.

### v4.0.462 (2026-08-28)
- **⏰ has a ▾ of its own**: a date on top (year · month · day), a time below (hour · minute), each a scrolling
  column **and** a box you can type into. The columns and the box read the same value, so choosing in one writes
  the other — there is never a second version of the truth. Leave the date empty and the time means today, or
  tomorrow if it has passed, which is the everyday case. `clear` empties it again. The four common durations
  stay one press away.
- It opens, positions and closes exactly like the table ▾ — the same furniture, not a new invention — but it
  keeps its own outside-click guard rather than riding on the other menu's state.

### v4.0.461 (2026-08-28)
- **The diagnostic log is off by default, and no longer carries a hard-coded path.** Two absolute paths from the
  author's own machine had been shipping inside the extension, so every install was firing failed file writes at
  a folder that does not exist on it. On the author's machine, where the path *does* exist, it was writing
  thousands of lines a week to a disk with 9 GiB free and keeping every one of them in the extension host's
  memory — the instrument was adding to the very slowness it was measuring. Set `laiMembrane.debugLogPath` to a
  file when you are chasing something; leave it empty and MeOS writes nothing and keeps nothing.

### v4.0.460 (2026-08-28)
- **A clock now survives a restart** — it is kept in the file's own mMETA membrane, beside the view modes, so it
  travels with the file and is still waiting on another machine. Until now it lived only in memory: closing the
  editor lost it, which meant it could not really be used as a plan.
- **What happens to a clock that ran out while you were away**: if it passed within the last five minutes it
  simply rings, as it would have. Older than that and it is quietly wound down — nothing stays held — and MeOS
  tells you which ones you missed. Nobody wants to be marched off to a membrane because of an alarm that went
  off three hours ago.

### v4.0.459 (2026-08-28)
- **⏰ grows as its time approaches.** The remaining time was already in three places, and all three had to be
  *read*. Size does not have to be read — it arrives on its own. Under five minutes the clock swells; under one
  minute it swells further and breathes. It grows with `transform`, so its **box never changes size** and the
  buttons beside it do not shift — a control that moves is a control you cannot hit.
- Nearness is measured in **actual time left**, not as a fraction: five minutes before the end is five minutes,
  whether the plan was ten minutes or next month.
- In the last minute the **status bar entry turns warning-coloured**, using VS Code's own colour — visible even
  with Me Dock closed.
- Fixed: the countdown was still gated on Pseudo-WYSIWYG, so **a plain bell showed no numbers at all** — left
  over from when ⏰ could be set from any view.

### v4.0.458 (2026-08-28)
- **⏰ takes a date as well as a time.** `18:30` · `9/1 18:30` · `2026-09-01 18:30` — and **how precisely you
  write it says what kind of plan it is**: a time alone means today, or tomorrow if it has passed; adding a day
  and month means this year; writing the year means that one day. So MeOS never has to ask whether you meant
  "every day" or "just once" — you already said. A date with no time means that day's 00:00, and a date that has
  already gone by is reported as a mistake rather than quietly moved to next year.
- A far-off plan is announced by **the date it points at**, not as mm:ss, which nobody can read.
- Long waits are armed in chunks: `setTimeout` overflows at about 24.8 days and fires **immediately**, which
  would have made every plan more than a month away go off at once.

### v4.0.457 (2026-08-28)
- **⏰ lists every clock you have running, and takes you to any of them.** A clock you set is a plan, and a plan
  you cannot see a list of is not a schedule — one is easy to hold in your head, three are not. The list sits at
  the top of the menu ⏰ already opened, soonest first, saying for each whether it is holding that membrane or
  only ringing; pick one and you are there, opening the file if it was closed. The ⏰ in the status bar opens the
  same menu, so there are two doors and one room.
- Choosing a membrane yourself does **not** put up the ↩ Back marker — that is reserved for when the bell moved
  you. When you went on purpose, you know where you came from, and the ◀ line history is already there.

### v4.0.456 (2026-08-28)
- **⏰ is its own button now**, standing beside 👁🥩 to the right of ⚠️. A 15px badge on a button's shoulder stays
  a 15px badge however you paint it — v4.0.448 made it white and it still sank. As a piece in its own right it
  is built like its neighbour ⚠️: grey while nothing is running, lit orange while it is.
- Splitting it settled something else: **one piece says one thing.** The face now reports only the view mode;
  the remaining time lives in ⏰, where it belongs. Until now the mode button carried both.

### v4.0.455 (2026-08-28)
- **The view-mode button and its ⏰ have moved to Navigate Me!, immediately right of ⚠️.** In Format Me every
  other control writes something — `==`, 👻, `A²`, `##`, ▦, 🐱 all put characters in the file — and this one
  writes nothing at all; that was the misfit. Next to ⚠️ it joins the row that reports **what the membrane you
  are in is like**: ⚠️ says it is broken, 🥩 says it is showing its raw data. The ⏰ travels with it, because the
  view you set it from is what decides whether it locks or merely rings — a link you can only read while the two
  stand together.

### v4.0.454 (2026-08-27)
- **MeOS carried you off, so MeOS hands you the way back.** After the bell takes you to a membrane, the status
  bar slot that was counting down turns into **↩ Back**, naming the membrane you were in. One press returns you
  to the exact line — reopening the file if you closed the tab. It stays until you press it, because "you can go
  back" stays true until you do. (The line history ◀ still works; it was simply never in front of your eyes at
  the moment you needed it.)

### v4.0.453 (2026-08-27)
- **The clock stops being only a lock and becomes a bell.** When the time comes, MeOS now takes you to the
  membrane. Write the next job inside a membrane, set a time on it, and it comes and finds you — the schedule
  lives in the place it is about, the way a 👻 note does, so there is nothing to remember about where you put it.
  Whatever you then write there is the record; no separate log is needed.
- **A clock time works as well as a duration** — "18:30", for the end of a period or a hand-over. A time already
  past means tomorrow.
- **What the clock does is decided by the view you set it from**: from Pseudo-WYSIWYG it holds the membrane (the
  test paper — no way out, then back to Normal when it rings); from anywhere else it is only a bell and touches
  nothing. So ⏰ is available in every view again — v4.0.449 hid it outside Pseudo, and this use outgrew that.
- Your position is pushed to the line history before the jump, so ◀ takes you back to what you were doing.

### v4.0.452 (2026-08-27)
- **A setting on an outer membrane already reaches everything inside it** — that is what lexical scope means, and
  setting the ground outside every membrane reproduces the old whole-file behaviour. **But the button was not
  saying so**: it read only a membrane's *own* setting, so standing inside a child that was showing Raw by
  inheritance it announced "Normal". The face now shows the mode that is actually in force, and clicking cycles
  from there.
- That raised the question the old face hid: **can a child be Normal inside a Raw parent?** It can now. The rule
  generalises "don't write the default" — **write only when it differs from what encloses it**. Choose the value
  you would have inherited and the entry is removed (back to following); choose a different one and it is
  written. So a membrane can opt out of its parent in either direction, and the file keeps no redundant entries.
- The tip says when a mode was handed down from outside.

### v4.0.451 (2026-08-27)
- **The countdown stands inside the closing comment**, right after the `//`: `▲name // ⏰ 0:33 comment2`. The
  space to the right of `//` is the part a person types into and rarely fills on a closing membrane — so the
  clock borrows it rather than claiming a place of its own, and lands in the same column whether that comment is
  long, short, or absent. v4.0.450 put it just left of the `//`, which was still outside the comment.

### v4.0.450 (2026-08-27)
- **The countdown now sits immediately after the membrane's name**, before its closing comment rather than after
  it. Put on the right, the clock drifts far out on a membrane with a long comment and sits close in on one with
  a short comment — its position tells you about the comment instead of about the timer. After the name it lands
  in the same place on every membrane.

### v4.0.449 (2026-08-27)
- **The remaining time now sits on the membrane's own closing line.** One status bar entry could not say *which*
  membrane it belonged to, and a second timer pushed the first one off. A membrane's things belong on the
  membrane — and the closing line is exactly where someone who has finished the questions arrives. The line is
  looked up by name each tick, so it follows the membrane as the file is edited. The status bar stays as the
  summary and now says how many other timers are running.
- **⏰ only appears while you are in a Pseudo-WYSIWYG membrane.** The timer belongs to that view; a button that
  cannot mean anything where it is standing should not be standing there.
- **When the time is up the membrane goes to Normal**, not back to whatever it was. With ⏰ living in Pseudo, "what
  it was" is always Pseudo — so the answers would never come back. The bell rings, and the answers show.
- **Clicking the `⋯` of a folded spec block in a Pseudo membrane re-folds immediately** instead of after a second.
  That `⋯` is VS Code's own "this is folded" marker and clicking it means unfold, so the flash cannot be removed
  entirely — but the wait was ours, and it is gone.

### v4.0.448 (2026-08-27)
- **The colour that was supposed to tell you the mode had never once appeared.** An old `#raw-toggle` id rule sat
  further down the stylesheet painting the button the same tan whatever mode it was in, and an id beats three
  classes — so v4.0.440's "the colour says which view you are in" was dead on arrival. CSS resolves by strength,
  not by order. The id rule is gone; the face is decided by one class rule, and Raw takes the tan that has meant
  Raw in MeOS all along.
- **When the time is up, the membrane goes back on its own.** Pressing ⏰ chooses *a fifty-minute test*, not
  *being in Pseudo-WYSIWYG* — the view was the timer's, not yours. So the timer now restores whatever the
  membrane was before it started, and there is no button left to forget. If you had deliberately set that
  membrane to Pseudo yourself, that is what it returns to.
- **The remaining time is visible from anywhere** — a status bar entry, not just the button face, which only
  showed while the caret sat inside that membrane. Click it to open the timer menu.
- The timer badge is ⏰ on white; a small emoji on a dark disc simply sinks.

### v4.0.447 (2026-08-27)
- **Raw draws nothing — including the membrane lanes.** The vertical membrane bars kept showing inside a Raw
  membrane. Raw promises that MeOS puts nothing on the page; the old whole-file Raw cleared the lanes with
  everything else, and when Raw became per-membrane this one path was left behind. A Raw line now yields its lane
  for exactly the reason the caret line already does: nothing decorative goes where the raw data is showing.
- **When the timer ends, the notice carries the way out.** Time running out unlocks the exit but deliberately
  does not change the view — which is right, except the notice was a piece of paper that vanishes: once you
  dismissed it, nothing on screen said you were still in Pseudo-WYSIWYG or how to see the answers. The notice now
  offers **Show the answers**, which returns that one membrane to Normal. What a person switched on, a person
  still switches off — this just hands them the handle.
- The timer glyph is now ⏳ instead of ⏱.

### v4.0.446 (2026-08-27)
- **The saved/unsaved dot now reacts to MeOS's own edits.** Setting a view mode writes to the mMETA membrane, so
  the file becomes dirty — but the dot stayed on the green × as if nothing had happened, and nothing prompted a
  ⌘S. The dot was being posted from below the gate that suppresses redraws during MeOS's own batch edits, so
  every edit MeOS made on its own left the mark behind. Whether a file is saved is a **fact**, not a redraw; it
  now goes out ahead of that gate, from a single place, no matter who did the writing.

### v4.0.445 (2026-08-27)
- **A membrane's view mode is saved in the file, in its mMETA membrane** — the same place Format colours and
  reference settings already live, so it travels with the file through Git and does not evaporate when you switch
  machines. Yesterday's test paper is still a test paper tomorrow.
- Calling Raw "temporary" was the wrong split. Anything temporary needs *someone* to decide when it ends, and a
  machine deciding that means you can never tell when it went back. **What a person switched on, a person switches
  off** — then what the button shows and what is remembered always agree. Only membranes you actually set are
  written; a membrane left on Normal writes nothing at all.
- **The tip now names both destinations.** Click and Option-click already went forward and backward round the
  three modes — so from Raw, one Option-click returns you to Normal — but the tip only said "goes round the other
  way", which does not tell you what you will get. It now reads `Click → Raw view Raw🥩` /
  `⌥ Opt-click → Normal view 👁🥩`, for the membrane you are in.

### v4.0.444 (2026-08-27)
- **A view mode is a property of a membrane, not a state of the editor.** Until now one session held a single
  "current mode" and worked out the range from where the caret happened to be — so the setting followed the caret
  around and one file could never say *this part is a test paper, this part is a draft*. Now each membrane keeps
  its own setting, and the rule is one line: **use this membrane's setting; if it has none, the membrane outside
  it; failing that, normal.** Lexical scope, so nesting is right for free — an inner membrane that says nothing
  inherits, and an inner membrane that speaks wins.
- **The button means one thing**: set the mode of the membrane the caret is in. Move to another membrane and the
  face shows *that* membrane's setting. Scroll all you like — nothing else changes.
- **The timer is per membrane too**, which is what makes the test paper work: hold one membrane in
  Pseudo-WYSIWYG for fifty minutes while the rest of the file stays perfectly writable.
- Internally this removed the last of the special cases. The two folding paths no longer track "what is open"
  in a sentinel that grows a new value per mode; they state the desired shape in full every time and apply only
  the difference. Zero branches on mode, so the class of bug behind v4.0.441–443 cannot recur.
- A file with no membrane set to anything builds no map at all — identical behaviour and cost to before.

### v4.0.443 (2026-08-27)
- **Three reported bugs, one hole.** When Raw became per-membrane in v4.0.441, only the place that answers
  *which lines show their raw data* learned the new meaning. The two paths that **fold and unfold the FC lines**
  were left speaking the old language — "if Raw, the whole file". So entering Raw threw every FC block in the
  file open (looked like other membranes had gone raw), the screen moved, the batch folder woke up and shut them
  again one at a time, and each fold that landed on an already-folded block folded the **membrane** instead and
  jumped to its head. Opening scope now follows the band, and the batch path asks the same single question.
- **No bare `fold(everything)` is left.** Folding a block that is already folded is what warps the caret to the
  top of a membrane (known since v4.0.188); every fold now goes through the "visible and actually open" guard.
- **Pressing the button now finishes the job on the spot.** Fold and unfold only work on the focused editor, so
  while focus sat in Me Dock the fold half of a mode change quietly did nothing and only happened on your next
  click. Switching a mode now returns focus to the editor first. (Not stealing focus is a rule about *startup* —
  when a person presses a button themselves, the whole result should happen at once.)

### v4.0.442 (2026-08-27)
- **A timer for Pseudo-WYSIWYG — the file becomes a test paper.** Hold the view for 10 / 25 / 50 / 90 minutes
  (or your own number) and there is no way out until the time is up. The answers are already in the file, hidden
  in 👻, so the moment it ends you mark your own work — and the same file can be sat again tomorrow, or used as a
  memory sheet. A ghost is an invisible sheet of scrap paper that never leaves the spot it was written on: unlike
  a separate notes pane, you cannot lose track of where an answer lives.
- **The time closes the exit, not the view.** When it ends, nothing switches on your behalf — the way out simply
  comes back, and checking your answers starts with your own click.
- **There is a way to stop it early, but not by accident**: ⏱ → pick → confirm. A lock its own owner cannot
  release is a promise the software cannot keep anyway.
- The remaining time is counted in the panel and shown on the button face (`Pseudo👁 49:12`), so nothing has to be
  opened to see it, and there is no per-second traffic.

### v4.0.441 (2026-08-27)
- **One button, three faces.** The two separate toggles turn out to have been a single three-way switch all along:
  👁🥩 Normal, Raw🥩, Pseudo👁. Normal is not "neither" — it is one of the three, so it gets a mark of its own.
  One axis runs through all three: *how much raw data you are shown* — a whole membrane, one line, or none.
  Click steps along it; Option-click steps back. Three clicks always bring you home.
- **Raw is now per-membrane, not per-file.** It used to flip the entire document, which was both wasteful and a
  second code path that bypassed the twelve per-line decorators. Raw is now a *band* added to the one place that
  already answers "which lines show their raw data" — so all twelve follow at once, and the whole-file shortcut
  (and the "remember to clear this decoration too" contract that came with it) is gone.
- **Pseudo-WYSIWYG hides plain strikethrough too**, the way 👻 already did. A strikethrough says "I removed this,
  and I am showing you that I removed it" — a writer's working mark. A reader has no use for it. `~~not` is left
  alone: it never claimed to be a strikethrough, it only carries a colour.

### v4.0.440 (2026-08-27)
- **Option-click on this button swaps which button it is, and nothing more.** Unlike the format buttons, this one is
  already a toggle in its own right — pressing enters a view, pressing again leaves it — so asking Option to also
  mean enter/leave made the gesture say two things at once. Plain click works the face that is showing; Option-click
  changes which face that is, stepping out of whatever view is on rather than jumping across to the other one.
- **The colour says which view you are in**: pale when neither, brown for Raw, blue for Reading.
- **Pasting in Reading view no longer reveals a folding comment.** v4.0.438 left the folding path entirely in
  reading view, so a comment arriving with pasted text had nobody to close it. Reading view now skips only the
  opening; the closing still runs.

### v4.0.439 (2026-08-27)
- **In Reading view, Option shows 👁 Raw again.** The face was decided by "reading *or* Option held", so once
  reading was on there was nothing left for Option to say. The other face is whatever the current one is not, so it
  is decided by one or the other, never both — and pressing the button now does exactly what its face says, in all
  four combinations.

### v4.0.438 (2026-08-27)
- **Reading view** — the finished text and nothing else. The caret stops opening the raw data as it moves, the
  folding comments stay closed, and anything commented out with 👻 stays gone. A draft can be read the way a reader
  will meet it, with the edits taken out of sight rather than out of the file.
- It is the other face of `👁 Raw`, reached with ⌥ Opt: Raw shows everything, Reading shows nothing. The two are
  opposites, so they cannot both be on.
- Also on the command palette as **MeOS: Toggle Reading View**, for anyone who wants it on a key.

### v4.0.437 (2026-08-27)
- **The `□ ~~` tip opens upward again** — below, it covered the panel it belongs to.
- **It is no longer see-through.** The tip was never transparent: an unchecked box is dimmed with `opacity`, and a
  pseudo-element cannot escape its parent's opacity. Only the label is dimmed now, so the tip is drawn at full
  strength while the box looks exactly as it did.

### v4.0.436 (2026-08-27)
- **Tips inside the ▾ panel appear at once.** The `□ ~~` was not in the family whose tips are drawn in CSS, so it
  fell back to the shared tooltip that has to be placed by arithmetic and takes a moment to arrive. It sits in the
  family now, and opens downward — it lives at the top of the panel, where there is no room above.

### v4.0.435 (2026-08-27)
- **The 👻 button wears the colour it will write.** It was appearing and disappearing because two different hands
  painted that button and one of them was wiping it clean — the same split fixed in v4.0.421, in a second place.
  Both now paint the same value, so it no longer matters which runs last. The glyph is an emoji and keeps its own
  colours, but the background is the one that was chosen.

### v4.0.434 (2026-08-27)
- **A ghost keeps its colour.** Deleting the 👻 from the folding comment now leaves a finished, coloured
  strikethrough — one edit, nothing to choose again. v4.0.416 dropped the colour on the grounds that something
  invisible has no use for one, which only considered the time it spends invisible.

### v4.0.433 (2026-08-27)
- **The explanation moved out of the ▾ panel and onto the `□ ~~` itself.** Wording that is always on screen stops
  being help and becomes part of the furniture — and it was running off the left edge besides. It is there when
  someone hovers the thing they are wondering about.
- The 👻 on the button is about a third larger, the same way 🚫 is.

### v4.0.432 (2026-08-27)
- **Strikethrough now hides by default.** The button is 👻; a `□ ~~` in its ▾ menu brings the classic behaviour
  back, and Option still gives whichever one you are not set to. Same shape as the highlight button's `□ 🔗`.
- Text struck out in a diary is text you have finished with — crossing it out keeps showing you what you are done
  looking at. Hidden is the better default; the file keeps every character, and outside MeOS it is a strikethrough
  as before.
- The ▾ is where someone meeting 👻 for the first time finds out what it is: `□ ~~` sitting beside it says which
  family it belongs to.

### v4.0.431 (2026-08-27)
- The ⚠️ on the button is about a third larger; the count keeps its size, so the pill stays the height it was.

### v4.0.430 (2026-08-27)
- **Two tips at once, for the third time — fixed as a rule instead of a list.** Twice before, a button whose tip is
  drawn in CSS was added to a list of names the JavaScript tooltip skips; every new button reopened the hole. The
  JavaScript now looks at the button in front of it: if CSS is already showing the same words, it stays quiet. No
  list to keep, and buttons added later are covered without anyone remembering to.

### v4.0.429 (2026-08-27)
- **The ⚠️ tip appears where the button is.** It had fallen back to the shared tooltip that is positioned by
  arithmetic, and landed a panel away. It now uses the same CSS the buttons beside it use, drawn as a child of the
  button itself — nothing to calculate, nothing to get wrong.
- The count is white.
- **The gutter ⚠️ is yellow, like the button.** Two marks for the same thing should be the same colour; red already
  has a job here — it is the bar showing how far the broken membrane reaches. Extent in red, mark in yellow.

### v4.0.428 (2026-08-27)
- **⚠️ carries its count** as a raised number, the way 🐱 does — shown from two upward, since one needs no counting.
- **A ⚠️ appears in the gutter** on the end that still exists, so the place to fix it is marked, not just tallied.
  The membrane lane yields that one line, the way it already does for a bookmark: the glyph margin holds one icon.
- The button is a wider, rounder pill, matching the pieces beside it.

### v4.0.427 (2026-08-26)
- **⚠️ moves next to Warp** in Navigate Me!. It is a way of getting somewhere, so it belongs among the things that
  move you, not beside the field that renames what you are standing in.

### v4.0.426 (2026-08-26)
- **A ⚠️ button next to Edit Me.** Live only when a membrane in this file is broken; each press walks to the next of
  its two ends. The hover added in v4.0.425 could never have worked — decoration hovers answer over the text, and
  the red bar people point at lives in the gutter, so the answer was parked where the question is not asked.
- **Both ends are always shown, even when only one is real.** A membrane with no closing half runs to the end of the
  file, one with no opening half runs back to the start; being taken there says how far the red bar reaches better
  than the word "missing" does.
- The warning cache is now written by the renderer that actually draws the bar, which is why v4.0.425 found nothing.

### v4.0.425 (2026-08-26)
- **The red warning bar now answers when you hover it.** A membrane missing its other half draws a thick red line
  down the gutter, but finding the break in a 150,000-line file was another matter. Hovering any line the red bar
  reaches names the membrane, gives the line number of the end that exists as a link to jump to, and says plainly
  that the other end is missing.
- **A notice you cannot read is no notice at all.** The depth-mismatch message announced itself and vanished before
  it could be read; it now stays until dismissed.

### v4.0.424 (2026-08-26)
- **The tip's first line says what the button currently is.** It was hard-wired to announce a heading, so a
  bullet-only preset was introduced as "Heading (H3)" while showing a dash. It now reads from the same three cases
  the face does: heading, heading with a bullet, or bullet alone.

### v4.0.423 (2026-08-26)
- **A bullet-only preset gains a heading under Option** — H2, the level most used. What it lacks is a heading, so
  that is its other answer.
- Option can only carry one answer, and a moment ago that looked like a reason to do nothing here. It is not: the
  instruction lives in the folding comment, so a different level is one edit away. Change the H2 there for H1 or H3.

### v4.0.422 (2026-08-26)
- **Option is always the other answer.** No bullet on the preset, and it adds one; a bullet already there, and it
  takes it away and writes the heading alone. One rule instead of two.
- **A bullet-only preset does not transform.** Take its bullet away and nothing is left, so there is no other answer
  to offer — and offering a heading instead would mean choosing H1, H2 or H3, which Option cannot say. A button that
  has nothing to switch to stays as it is.

### v4.0.421 (2026-08-26)
- **The tip belongs to the face.** A button that has changed into something else was still explaining its old self.
  Now the second face brings its own tip and hands the first one back on release — one function owning both, for the
  heading and for strikethrough.
- **The heading button keeps its colour.** Changing face cleared the button's colours and nothing put them back,
  because drawing the face and painting the colours were two different hands. Coming back now includes the repaint.

### v4.0.420 (2026-08-26)
- **A bullet keeps its space.** Pressing Opt-# on an empty line left `-` with nothing after it, so the first thing
  typed stuck to the dash. In Markdown the mark is `- `, space included — the space was never trailing whitespace to
  be tidied away. Fixed where it was being dropped rather than added back afterwards, and in both places that make
  the same decision.
- **The face shows the colour it will apply**: `- A`, with A wearing the preset's text and background colour. If the
  colour turns out not to be wanted, deleting the folding comment is the whole undo.

### v4.0.419 (2026-08-26)
- **Hold Option and the heading button becomes a bullet.** `#` offers `-`, `##` offers `1.`, `###` is held in
  reserve and does not transform — an empty promise is worse than none. Heading and bullet were already the two axes
  of this button, so this is the axis it already had, reached the quick way instead of through the menu.
- Option here is a one-shot: the preset stays a heading, which is what it is used for.
- Every Format button now has a second face under Option.

### v4.0.418 (2026-08-26)
- Shorter tip on the strikethrough button.

### v4.0.417 (2026-08-26)
- **Hold Option and the strikethrough button turns into 👻.** Option showing a button's other face is already the
  rule — the highlight button takes on a link, the superscript button becomes subscript. v4.0.416 taught the button
  the new job but not the new face, so what it would do was invisible until it was done. One watcher still, shared by
  every button.

### v4.0.416 (2026-08-26)
- **👻 Comment out.** Opt-click the strikethrough button and the text stays in the file but is not shown at all —
  for the passage you are not using today and will use tomorrow. Strikethrough crosses something out and still shows
  it; this is the other half of that choice.
- It rides the notation already there: the text is plain `~~…~~` and the folding comment below says `👻`. The symbol
  carries, the instruction decides — the same rule `not` follows. Outside MeOS it renders as a strikethrough, which
  is the honest reading of *set aside for now*.
- Two ways back: put the caret on the line and the raw text appears as written, and the `<!-- Mew!FC ~~👻 -->` line
  underneath stays visible, so nothing is hidden without a trace. `~~#3👻` names the third one on the line.

### v4.0.415 (2026-08-26)
- **The raw line carries no colour and no background.** v4.0.412 through v4.0.414 kept moving toward painting the
  mark; the line under the caret is there to show the data as written, and decoration does not belong on it. Killing
  the theme's two-tone treatment of `***` needs one thing only: paint the whole mark — markers and content alike — in
  the editor's own foreground. Not adding a colour, but removing the difference the theme added.
- Keeping a specified colour out of the raw line also keeps it readable: black text with its background taken away
  disappears into a dark editor.

### v4.0.414 (2026-08-26)
- **The background hugs the content; only the colour reaches the markers.** Painting the whole mark on the raw line
  stretched the highlight box past the text it highlights. A background says *this is lit up*, so it belongs to the
  content. The markers needed one thing only — to stop being split into two colours by the theme — and that is the
  colour, not the background.

### v4.0.413 (2026-08-26)
- **On the raw line the whole mark is painted, markers included.** The markers had never been given a colour because
  they are normally hidden — there was nothing to colour. Once the caret's line stopped hiding them, the theme's own
  split (outer `*` as italic punctuation, inner `**` as bold) showed through. The mark is one thing, so it is painted
  as one thing. Where the markers are hidden, painting the content alone is still enough.
- The older bracketed forms are widened the same way.

### v4.0.412 (2026-08-26)
- **A mark is painted in one colour on the raw line.** The odd white asterisk was not a gap left unpainted — the
  theme colours the two halves of `***` differently (the outer `*` is italic punctuation, the inner `**` is bold
  punctuation). Resetting the space between marks simply left that split exposed. Now the only thing the caret's
  line does differently is *show the symbols*; the colour comes from the same single path as everywhere else.
- **The second path added in v4.0.410 is gone.** With the ordinary pass now covering the caret's line, resetting the
  space between marks needs no separate route.
- **The boundary is the inside of the markers, on both ends.** Standing on either `***` counts as outside, so plain
  text and the orange pair meet back to back without a character of overlap.

### v4.0.411 (2026-08-26)
- **Outside a mark, nothing turns orange.** The orange says *these two belong together*, so it must not glow where no
  pair exists. In a paragraph the caret used to fall back to lighting the whole body line and the whole FC group —
  the same thing as turning an entire table orange because the caret sits in one cell. A table's unit really is the
  whole row; a paragraph's unit is one mark, and that is where the two differ.
- **The boundary now ends before the closing marker.** Being just past a highlight counted as being inside it. Inside
  runs from the head of the opening marker to the end of its content: you enter at the door and leave when the
  content ends, which is the direction the line is read in.

### v4.0.410 (2026-08-26)
- **The gap between two marks is plain on the raw line as well.** v4.0.409 wrote it back to plain only where MeOS
  renders; the line under the caret shows raw data and is skipped whole, so `、そして` stayed blue exactly where it
  was being looked at. MeOS already paints the orange pair on that line, so it is already a place where MeOS speaks
  about colour — the clean-up belongs there too. Only the gaps are touched; the marks themselves, brackets included,
  are left as written.
- **The reset does not shout.** Carrying `!important` on the colour would have made it fight the orange pair, which
  is the stronger signal — it says which two things belong together. A decoration already beats the theme's own
  colouring without it, so the reset now uses the editor's foreground plainly and yields to anything MeOS said on
  purpose.

### v4.0.409 (2026-08-26)
- **The deeper yellow is the old one again.** What was liked all along was the classic `rgba(255,230,0,.65)` as it
  composites over a dark editor — (176,160,10). The replacement, (161,133,2), carried more red (R/G 1.22 against the
  original 1.10) and read as ochre. That exact colour is now painted opaque, so it looks the same whatever it sits on,
  and the check watches the R/G ratio so a future tweak cannot drift back toward brown.
- **Text between two marks is written back to plain.** In `***A***、そして***B***` the words in the middle came out
  blue and italic. MeOS reads the marks correctly — measured, both spans exact — but VS Code's own Markdown grammar
  pairs asterisk runs loosely and takes the gap for emphasis. While the `***` are visible a reader can blame the
  grammar; once MeOS hides them it looks like MeOS got it wrong, so MeOS cleans up after it: the stretch between two
  marks belongs to no mark, and is reset to normal weight, normal style and the editor's own colour. A colour MeOS
  itself specified still wins.

### v4.0.408 (2026-08-26)
- **Only `(白/黄)` deepens now — the shade is decided where the colour is decided.** v4.0.406/407 looked for yellow
  backgrounds that overlapped a white foreground range, but a `***not (白/黄)` span is not painted through the
  highlight background layer at all: bold and italic have their own writer, `pushStyle`, with its own decoration
  types. Searching for an overlap there found nothing, so the deeper yellow never appeared. There are two writers,
  so there is now one function they both ask, called at the moment fg and bg are settled rather than after the fact.

### v4.0.407 (2026-08-26)
- **The highlighter yellow is actually yellow now, and the two yellows are told apart.** At 0.65 alpha the yellow
  composited over a dark editor to (176,160,10) — olive, not a highlighter. And the deeper yellow added in v4.0.406
  landed at (172,143,4), near enough to the first that moving a span between them changed nothing on screen: the
  routing worked, the colours did not. Both are now painted near-opaque and set far apart — black on (244,222,40) at
  15.3:1, white on (161,133,2) at 3.6:1, with the two backgrounds 2.9× apart in luminance. The check computes those
  numbers from the values themselves, so a future tweak that makes them converge again fails the test.

### v4.0.406 (2026-08-26)
- **A bare `==…==` finally gets its black text.** The auto-contrast rule — light background, black text — was written
  in the `=={…}==` branch and again in the branch that finds a spec comment, but a `==…==` carrying no spec at all
  left through a third path where the foreground was never decided, so the theme's own colour (white, in a dark theme)
  stayed on the yellow. The rule now sits once, after the branch, where every path must pass it.
- **Yellow deepens when white text sits on it.** With a `(白/黄)` preset the bright yellow is too close to the text;
  with `(黒/黄)` it should stay bright. The shade is chosen while reading, not written into the file — the raw data
  stays `(白/黄)` and nobody can spell the deeper yellow, because it has no name. The move happens once, just before
  the decorations are handed over, rather than at the eleven places a highlight background is collected.

### v4.0.405 (2026-08-26)
- **Backspace is only intercepted at the start of a line, Delete only at the end.** v4.0.400 gated the three keys on
  whether an FC line, membrane, table or list was near, but reading the handlers shows they are far narrower than
  that: `meosJoinSpecsOnBackspace` returns immediately unless the caret is at column 0, and the Delete handler only
  acts at a line end. So backspace in the middle of a paragraph that happens to carry an FC line still paid two round
  trips to do nothing — the one or two seconds that remained. Columns cannot be written in a `when` clause, so two
  more context keys carry them, with one column of slack because `setContext` is asynchronous and a key that flips
  exactly at column 0 would drop the first press.

### v4.0.404 (2026-08-26)
- **A plain highlight is now the full negation of bold-and-italic: `***…***` with `***not`.** "Plain" is only fully
  stated when both axes are denied — `**not` denies bold and says nothing about italic, so the declaration was half
  written. This reverses v4.0.263, which chose `**` because it is the mark one writes most often and reads as emphasis
  outside MeOS; the cost of the change is that outside MeOS the span now reads as bold *and* italic. It also separates
  three kinds that used to share two: a highlight and a real bold were both `**`, drawing from the same queue when a
  spec is matched to a mark; now highlight is `***`, bold is `**` and strike is `~~`, each with its own line. Both
  writers were changed (v4.0.246's lesson), and `**not` written before today still reads exactly as it did.

### v4.0.403 (2026-08-26)
- **In a paragraph the whole FC group belongs to the one body line.** "Row i pairs with FC line i" is the table's
  rule, where the two counts match; a paragraph is one body line against N FC lines, so looking for the i-th found
  only the first — the second box onward never turned orange. With the caret on undecorated text, or anywhere in the
  group, the body line and every FC line now light together. Tables still pair row to row.
- **The orange wins the colour again.** The 1:1 pairing was computing the right span all along, but the body's own
  mark is painted `color: … !important` (v4.0.137), and the orange carried no `!important`, so from inside an FC box
  the body text kept its own colour. It only looked right with the caret on the body line, because that line renders
  raw and nothing was competing. Same hole for the fifth time — v4.0.15, v4.0.135, v4.0.137, v4.0.239 — whenever two
  decorations set the same CSS property, the one applied later needs `!important`.

### v4.0.402 (2026-08-26)
- **A paragraph's FC group is one box per line.** The same idea as the table, one step finer: a table row is a row,
  and in a paragraph one decoration is the row. Boxes packed onto a single line can wrap out of sight at a narrower
  width, the pairing has to be counted rather than seen, and editing one of them means picking it out of a crowded
  line. More lines fold away, and all three problems go. The reader already took FC lines "as long as they continue"
  in document order, so splitting changes nothing about what the file means. Tables keep their row on one line.
- **The orange pair repaints the moment the caret moves.** It was painted only from `refresh`, which by design does
  not run on a plain cursor move, so the pairing sat stale until something else happened — the three or four seconds.
  It is now painted from the selection handler as well; measured at 0.002–0.010 ms on the 190,380-line diary, since it
  only ever looks around the caret.

### v4.0.401 (2026-08-26)
- **In a paragraph the orange pairing is per decoration, not per line.** A table pairs a row with its FC line and that
  reads well; a wrapped paragraph turned the whole line orange, so with three marks and three FC lines nothing said
  which went with which. Put the caret in one highlight and only that `**…**` and its one FC box turn orange — and
  from inside an FC box, only its own mark in the body. Undecorated text stays its normal colour, which is what makes
  the pair legible. The pairing is decided the same way the writer decides it — the next box of the same kind — so the
  colour cannot disagree with what the file means, and `not` placeholders are skipped because nothing points at them.
  Tables keep pairing row to row, and a caret on undecorated text still falls back to the whole-line orange that says
  "these two lines are showing raw data".

### v4.0.400 (2026-08-26)
- **Backspace, Enter and Delete are only intercepted where MeOS has something to do.** Those three keys are exactly
  the three MeOS binds, and their conditions named no language and no place, so every press anywhere went renderer →
  extension host → MeOS's check → back to the renderer for `deleteLeft`: **two round trips before the character moves**,
  which is why a single press hurt more than a repeat (a repeat gets coalesced). A `meos.fcKeys` context key now gates
  all three; on an ordinary prose line with no FC line, membrane line, table or list within two lines, the key never
  reaches the extension at all. The predicate is deliberately generous — two lines of radius, and true whenever it
  cannot tell — because `setContext` is asynchronous and a value that flips on a single cursor move would drop the
  first keystroke.
- Measured on the real 190,380-line diary with the extension activated: the synchronous path is 0.0–0.8 ms per key
  (key intercept, document change, cursor), and `refresh` is 21–28 ms — the earlier "refresh is innocent" reading came
  from a harness that never called `activate`, so most decorations were never built.
- The decoration signature cache stays off. Re-enabling it for everything but the membrane lane was tried and
  withdrawn the same hour: `check_fold.js` caught that decorations cleared outside the cache — Raw mode,
  `clearMembraneVisualDecorations`, a re-render — never come back, which is the very reason v0.9.636 switched it off.
  Re-enabling requires routing every clearing site through the cache first.

### v4.0.399 (2026-08-26)
- **One missing null-check stopped the whole extension from starting.** Headings stayed as `##`, the spells did
  nothing, and Backspace and Enter reported `command 'laiMembrane.backspaceJoinSpecLines' not found`. All three were
  the same event: `activate` calls `refresh`, `applyPrettyLabels` threw, and every command registered after that point
  never existed — 44 of 64. The extension host log named it exactly: `TypeError: Cannot read properties of null
  (reading '1') at applyPrettyLabels`. `mP` comes from a regex that requires a non-space character, so it is null on a
  blank line, while `dir` can arrive from the FC line *below*; a blank body line under an FC line declaring a heading
  or a bullet reached the null. The line eight below already guarded `mP` — the guard was missing in exactly one spot.
- **A decoration failure can no longer take the extension down with it.** `refresh` now catches, records the stack in
  the profile log and a status-bar note, and returns; everything else keeps working. Reproduced against the previous
  build (44 commands, both reported commands absent) and verified on this one (64, both present), by `check_activate.js`.
- **The structure shift builds one object per membrane, not one per membrane per keystroke.** v4.0.394 rebuilt the
  arrays once per accumulated shift: measured on the real diary (1,787 membranes) a 300-shift burst created 536,100
  objects in a single call. The line numbers are now summed as numbers and wrapped once — 1,787.

### v4.0.398 (2026-08-24)
- **Decorating a table row now writes the whole FC group, placeholders and all.** Highlighting a cell on the third
  row produced a single FC line, so the group no longer matched the table row for row and the orange pairing went
  quiet. Testing on the first row hides this — index 0 lines up with the first FC line by accident. The cause: when
  v4.0.210 moved highlight, strike, bold/italic and links onto the no-intermediate-state writer, that writer did not
  know about blocks and emitted one line, while the older push-out path already had `meosSpecGroupPerLine` to split
  a group across the rows of a block. One job was written twice. The writer now builds the merged form and hands it
  to that same function, which fills in the `not` placeholders for rows with no marks. Placeholders are stripped
  before the insertion index is applied — they are boxes too, and counting them shifted every later spec by one.

### v4.0.397 (2026-08-23)
- **No tooltip while the ΔChar settings panel is open.** Moving onto the panel brought a tooltip across it. The table
  menu already had this guard, but it lets tooltips show inside itself because its items need explaining; this panel
  is three buttons and a field, so there is nothing to read and the tooltip is only in the way — it is suppressed
  inside and outside alike, before the tooltip is even assembled.

### v4.0.396 (2026-08-23)
- **Typing does not schedule the bulk fold at all — deferring it was the wrong answer.** Backspace and forward-delete
  create no FC blocks, so there was never a reason to tie folding to a keystroke. v4.0.395 only postponed the work,
  and postponed work lands **in the gap between two key repeats** — which is what "backspace repeat, then forward
  delete, then backspace again, and it stops for a second or two" was. The request is now dropped rather than
  re-armed, in three places: the guard inside the function, the scroll signal (a visible range that moved because
  lines shifted is not scrolling), and the selection signal, which now fires only for a file whose first fold has not
  happened yet — the one case v4.0.141 added it for. A block created while typing still folds when the caret leaves
  it, through the per-cursor path that already exists.

### v4.0.395 (2026-08-23)
- **The bulk FC fold no longer runs on the keystroke path.** v4.0.329 put a "not while typing" guard on the scroll
  trigger, but `onDidChangeTextEditorSelection` called `meosAutoFoldSpecLines` directly with no guard — and a keystroke
  moves the caret, so every key ran it. It walks the whole document (`meosDefBlocks`), then awaits up to three 150 ms
  rounds and a fold command. Keys 2..n of a burst are turned away by the in-progress flag, so **only the first key of
  a burst pays for all of it** — which is why backspace repeat felt clean but starting a new repeat right after it
  stalled for about half a second. The guard now lives inside the function, so it holds for every caller, and instead
  of dropping the request it comes back on its own once typing settles.

### v4.0.394 (2026-08-23)
- **A keystroke no longer throws away the membrane structure.** The cache was keyed on `document.version`, so every
  key killed it and the next "which membrane am I in?" walked all 183,000 lines — which is exactly why this delay came
  back each time a new feature asked that question. Editing a membrane's *comment* changes no opening line, no closing
  line and no name, so the structure is identical; only line numbers move. Two one-line tests decide it: an edit that
  keeps the line count carries over when that line's signature (open/close + name) is unchanged, and an edit that
  adds or removes lines carries over when no membrane line sits in the moved range. The previous structure is then
  shifted, which costs the number of membranes, not the length of the file. Measured against a from-scratch rescan
  over 300 random edits including edits on membrane lines: **identical every time, 0.16 ms instead of 14.7 ms.**
- **Nothing synchronous is left on the keystroke path.** v4.0.393 still ran the cursor-follow work inline whenever
  120 ms had passed, so pausing mid-burst and resuming paid it on the next key — the 0.2 s hitch. While the document
  is being edited it is now always deferred; a plain caret move still updates immediately.

### v4.0.393 (2026-08-23)
- **Typing no longer pays for a full-document scan on every key.** Measured on the real 182,940-line diary, per
  keystroke: the eleven follow handlers cost 0.03–1.0 ms, `refresh` 1.3–7.3 ms, and re-slicing the line array 0.0 ms —
  all innocent. The selection handler cost **16–50 ms**, and it alone walked all 183,000 lines. A keystroke moves the
  caret too, so `updateMeDockMode`, `updateMembraneStatusBar` and `recordMeCursor` each asked "which membrane am I in?"
  on every key. Those three now collapse a burst into one run (a lone caret move still updates immediately).
  The deeper cause is recorded here for the next person: the membrane-structure cache is keyed on `document.version`,
  so **one keystroke always kills it** — which is why this delay comes back whenever a new feature asks that question.
  The next version removes the question's cost instead of its callers.

### v4.0.392 (2026-08-23)
- **The exception list is gone; only "no base" remains.** Stopping the arrow after punctuation or an opening bracket
  was a list I had counted up, and a list has to be memorised before the notation can be used — `not` already says
  "do not read this mark as such" for `H2not`, `***not` and `↑not`, so it says it here too. What stays is not an
  exception: a superscript rides on the character before it, and after a space or at the start of a line there is
  nothing to ride on. That is the rule MeOS already set — a superscript is a relation, so it requires a base; allowing
  it to stand alone puts appearance above structure. The whole rule is now one sentence: **a superscript rides the
  character before it; with no character there, nothing happens; to stop it, say `not`.**

### v4.0.391 (2026-08-23)
- **Anything can carry a superscript now — the allow-list is gone.** `^` in ordinary maths notation puts no condition
  on what it attaches to, and MeOS had been growing a list of permitted base characters one kind at a time
  (alphanumerics, then closing brackets, then big operators); counting characters guarantees the next one is always
  missing. What the list actually protected was an arrow written as an arrow. Measured on the real 182,940-line diary,
  outside code spans and fences, dropping the restriction newly raises 138 spots — and the 29 that genuinely hurt all
  share one shape: the arrow follows a space, a line start, or a punctuation mark, i.e. **there is no base under it**.
  So the rule is inverted: only characters that cannot be a base are listed. `🐱↑3` works; `- ↑OK` stays an arrow.

### v4.0.390 (2026-08-23)
- **🐱 converts old notation all the way to FC form, in one press.** v4.0.192 settled that MeOS writes only FC, and
  the format buttons have gone through `meosFormatWritesFC()` ever since — but the 🐱 legacy conversion still wrote a
  trailing comment, the shape it had back in v4.0.62–93. So one press produced a line that was "new form" by signature
  yet a different shape from what a button writes, and a second press moved only headings out (v4.0.293 limited that
  step to headings), leaving highlights and bold inline forever while 🐱 fell silent. The judgement of whether a line's
  specs can go out to an FC line now lives in one place, `meosFcSplitForLine`, and the legacy conversion, the heading
  extraction and the 💡 quick fix all read it. Lines that cannot take an FC line — table rows, a line whose next line is
  already a spec line — keep their trailing comment exactly as before.

### v4.0.389 (2026-08-23)
- **Create stamps the moment you press it.** The timestamp names when the membrane was born, not when the default
  name happened to appear in the box. Leave the cursor still for a while and the box keeps an old time, which then
  got written into the membrane. Create now refreshes the trailing timestamp at the instant it runs — the part a
  person wrote is untouched, and a name carrying no timestamp does not grow one (that only happens when copying).
- **The selected name is readable on a bright membrane colour.** The selection background follows the membrane's
  colour and the text was always white, so a yellow membrane left white letters on near-white. The text colour is
  now chosen from the background's luminance, the same way the submarine depth badge already did it.

### v4.0.388 (2026-08-23)
- **What you see in the name box is the tint layer, not the input.** v4.0.367 made the input text transparent and
  painted a coloured copy underneath, but the copy was only repainted when a person typed, on Reset, and at startup —
  never when the cursor changed the value. v4.0.386 made the value follow the cursor, so the disagreement became
  visible: a fresh default name selected in yellow with the tail of the old copy sticking out, a stale membrane name
  after stepping outside, and nothing picked up after a restart. All three were this one gap. The value is now written
  in a single place that always repaints the copy, and a late reply that no longer matches the value is dropped.
- **The cursor lands on the opener line after Create.** The opener's line number was guessed as `+1`, but the block
  gains a leading blank line only sometimes, so the cursor fell one line *inside* the membrane and Edit Me correctly
  reported New Me — with a default name nobody asked for. `findNewMembraneOpenerLineAfterInsert`, written for exactly
  this in v0.9.391 and never once called, now decides it, for all three sites that were counting on their own.

### v4.0.387 (2026-08-23)
- **One range, not a new judgment.** v4.0.381 added a dedicated function that walked up from an FC badge line to
  find its parent membrane. That was a second kind of judgment, and it was unnecessary: what makes a line a membrane
  line has always been `mCN`, never the badge — the badge is just trailing text, and FC form only moved it to the
  next line. The range is now the single span `▼ … meosPairBlockEnd`, and "is this line in this membrane?" stays the
  plain `start <= line <= end` it always was. The end is only recomputed when the cursor actually sits on a badge
  line, so the typing path still ends at one line test.

### v4.0.386 (2026-08-23)
- **The name field follows the cursor again.** "Is the person typing right now?" was measured with
  `document.activeElement` alone, but that keeps pointing at the last focused element even after the document
  loses focus. Create sends focus into the name box (v0.9.391), so from then on the panel believed the user was
  still in the box and stopped mirroring the membrane under the cursor — walking into another membrane showed the
  old name. The question now needs two answers: this document has focus, and the box is the focused element inside
  it. One helper, used by both the name field and the line field. Typed text is still guarded by `draftDirty`.

### v4.0.385 (2026-08-23)
- **🐱 now catches old-form membranes and moves their badge to an FC line.** Read-both means MeOS never rewrites the
  past on its own — it does not mean the past cannot be fixed. A person presses the button, so only the membrane on
  screen moves. The badge leaves the `▼` line and lands one line under `▲`, written by the same
  `meosPairBadgeLineText` that creates a new membrane, so a converted membrane and a fresh one are identical.
  It stays out of ambiguous cases: plain `mCN` membranes only, never a membrane that already has an FC badge line,
  never an unpaired membrane line, and never a line another fix is already touching this round.

### v4.0.384 (2026-08-23)
- **No timestamp, or an incomplete one, gets a full-spec one — but only in the copy.** A timestamp is not decoration;
  it is what makes the name a proper noun, so "it has none, therefore leave it" was backwards. Copy Me, Copy My contents
  and Duplicate Me now restamp every membrane name in the block: a name with no timestamp gains a full one, and an old
  partial form (`_143052.J07`, or a date with no time) is replaced by `YYYYMMDD<weekday>HHMMSS<TZ>`. The original
  document is never touched — past membranes nobody reads stay exactly as they are.

### v4.0.383 (2026-08-23)
- **A copy is a different membrane, so it gets a fresh timestamp.** A membrane name is an address you warp to;
  two identical names and nothing can decide where the jump lands. Finder asks "keep both or rename?" — MeOS can
  answer without asking, because the machine-written half of the name is exactly the part that may change. Copy Me,
  Copy My contents and Duplicate Me now restamp every membrane name in the block: the human-written stem is untouched,
  open and close lines get the same new name, nested membranes are restamped too, and colliding names step one second
  apart. Names that carry no timestamp are left alone — there is nothing to restamp, and MeOS does not grow one.

### v4.0.382 (2026-08-23)
- **Copy Me, Duplicate Me and Shed Me now reach the FC badge line too.** The badge belongs to the membrane, so
  carrying the membrane without it drops depth, colour and fold state at the paste site — and shedding the shell
  without it leaves a spec line whose owner is gone. All three read `meosPairBlockEnd`, the same ruler folding and
  Edit Me use. Copy My contents / Select My contents are unchanged: the badge is shell, not contents.

### v4.0.381 (2026-08-23)
- **A membrane's FC badge line belongs to that membrane.** Since v4.0.330 the fold range has run
  `▼ … ▲` plus the trailing FC badge line(s), but the pair range used by every "am I in this membrane?"
  question still stopped at `▲`. Sitting on the badge line therefore lost the membrane: Edit Me fell back to
  New Me and showed a fresh default name instead of the name to re-set. The block end is now decided in one
  place (`meosPairBlockEnd`), and folding, `isCursorOnMembraneLine`, `currentMembranePairForRename` and the depth
  meter all read it. Old-form membranes (badge on the `▼` line) are untouched.

### v4.0.380 (2026-08-23)
- **A colour code inside backticks gets no swatch, so it is no longer counted.** Code spans are "the characters
  themselves" — VS Code does not read them as colours, and MeOS has held the same rule since v4.0.58 so that tables
  explaining notation do not collapse. The width-stripping honoured it; the counting added today did not.

### v4.0.379 (2026-08-23)
- **The colour swatch counts as two characters, not one.** Measured against the real editor: the square plus the
  space around it takes about two half-widths, so one was never going to close the gap.

### v4.0.378 (2026-08-23)
- **Table alignment now counts VS Code's colour swatches.** Writing `#dc2626` makes the editor draw a small colour
  square before it — nothing in the file, but real width on screen, the same species as the ▼ glyph that cost a day
  earlier. Table formatting measures *visible* width (v4.0.74), so it has always subtracted the markers MeOS hides;
  it simply never added the things the editor draws. Now it does: one square per colour code, 3/4/6/8 hex digits,
  and nothing counted when `editor.colorDecorators` is off.
- A residual 0.35-character offset on rows with many CJK characters is not this, and is not fixable by padding: CJK
  is measured at 1.67 (a real measurement for the font pairing), and a fraction of a character cannot be filled with
  whole spaces. `laiMembrane.tableCjkWidth` exists for anyone whose font wants a different ratio.

### v4.0.377 (2026-08-22)
- **One colour table instead of two.** Measured, the dock's copy sat one Tailwind step off the membrane colours —
  O by 32, P by 42, N by 27, W by 79 in RGB distance. Close enough to look right, far enough that grepping one value
  never finds the other, which is the real cost: *"if the values are the same, they're easy to search."* The dock's
  table is gone; the membrane colours are converted to hex and handed to it, so changing a membrane colour in one
  place moves the ball, the letter and the colour menu together.

### v4.0.376 (2026-08-22)
- **Mepy's own ball is yellow when it says (Y).** The seventh definition of yellow — `colorHex()` in the dock, where
  `Y` was `#d97706` (amber-600), an orange. What I fixed last round was the colour *menu*; this is the colour the
  membrane itself is shown in. Notably R, G and B in that table already match the membrane colours exactly — only O
  and Y drifted, which is the signature of one side being edited alone. Y is aligned now; O still differs.

### v4.0.375 (2026-08-22)
- **A colour name is shown in its colour.** In an FC comment, `(白/黄)` means "text colour / background colour", so
  the first is drawn as text in that colour and the second as a patch of it — the specification looks like what it
  specifies. Only lines carrying the `Mew!` signature are examined, and a word that is not a colour name is left
  alone rather than being rounded to yellow.
- **Mepy's palette now agrees with the membrane it paints.** The colour you pick and the colour that gets drawn were
  two separate values (a sixth definition of yellow); yellow is now shared. The remaining colours still differ —
  unifying the two lists is v4.1 work.

### v4.0.374 (2026-08-22)
- **The highlight button and the highlight are the same yellow now.** The editor's yellow goes from 55% to 65% opacity
  — enough to read as yellow, still under the point where white text on it stops being legible (#b3a40c, luminance
  0.593) — and the button drops from a fully opaque `#ffe600`, which was too bright to read white text on, to that
  same resolved colour. A button is a preview of a result; showing a brighter colour than the result was a false
  preview. (A fifth definition of "yellow" lived in the webview's palette; it is the one that changed.)

### v4.0.373 (2026-08-22)
- **Yellow looks yellow.** "Yellow" was defined in four places with four different values, and two of them were not
  yellow: the membrane/badge `Y` was `#CA8A04` — an orange — and the text/heading yellow was an olive `(180,150,0)`.
  Both are now a colour a person would call yellow, and the text and heading share one value instead of two.
- Worth recording why the highlight button looks brighter than the highlight does: that yellow is 55% opaque, so on
  Monokai's background it resolves to `(158,144,15)`. Same value, different ground, different colour. Left alone for
  now — white text is written on top of it in existing notes, and raising the opacity would make those unreadable.

### v4.0.372 (2026-08-22)
- **The colour letter is a chip, so every colour reads equally.** Painting the glyph itself meant dark colours sank
  into a dark background — the one thing you are trying to show is the colour, and it was the colour that decided
  whether you could see it. The letter now sits on a patch of its own colour with black or white ink chosen by
  luminance. Yellow reads as clearly as red.

### v4.0.371 (2026-08-22)
- **A colour code is drawn in the colour it names.** The badge's interior splits into three — state+count, depth, and
  the colour letter — the first two joining the tile cycle, and the letter shown *in that colour*. `Y` appears yellow,
  so the notation and what you see agree; you no longer read a letter and translate it.
- **"Copied" is green again.** It was losing to the tooltip background defined later in the stylesheet — same
  specificity, so the last one wins. Fixed by stacking a class rather than reordering.

### v4.0.370 (2026-08-22)
- **The badge's contents are yours too.** I had filed the open-count under "MeOS counts this, editing it is
  meaningless" — wrong: writing `∞` stops the counting, so the number is a specification like the rest. State, count,
  depth and colour all belong to you; only the brackets and the 📊 are notation. Which leaves one rule for the whole
  line: **orange means don't touch, everything else is yours** — the user's own phrasing, widened from the membrane
  name to every character.

### v4.0.369 (2026-08-22)
- **"Copied" appears in the tooltip itself.** Clicking the timestamp happens while the tooltip is open showing exactly
  what will be copied, so the tooltip is where the confirmation belongs — *that* is what was copied. The separate
  badge beside it is gone: two signals for one act is two mouths.

### v4.0.368 (2026-08-22)
- **Orange now means "don't touch this", and the line says which parts you may.** With the caret on a membrane line,
  the raw source is split by role: the shell (`<!-- {* ▼mCN=`, `//`, `*} -->`) stays orange, the **name** you gave it
  is shown in the plain foreground, the **comment** in its own colour, and the timestamp stays tiled. The user's own
  framing, and the reason it is possible now: the name only became safe to edit in v4.0.351, when the closing
  membrane started following it. The behaviour changed first; the colour follows.
- One place decides the split, so the orange, the tiles, the name and the comment can never disagree about where a
  boundary is — and every character of the line belongs to exactly one role (asserted in the tests).
- **Copy feedback appears where you pressed.** "Copied" flashes next to the timestamp instead of only in the status
  bar at the bottom edge of the window.

### v4.0.367 (2026-08-22)
- **The tiles survive the orange line — by not fighting for it.** Two decorations were painting the same characters
  and `!important` was not settling it reliably. The orange (which marks "this line is showing raw source") now paints
  *around* the timestamp instead. A date is read as a date before it is read as raw source, and the orange's message
  is about the line, not each character.
- **Tooltips show the content, not a description.** The file name and the update time are set in small type, so their
  tooltips now repeat them at a readable size — a tooltip as a magnifier, not a caption.
- **Click the update time to copy** "filename + UD…" to the clipboard. A CSS `::after` tooltip cannot hold a button
  (a pseudo-element is not clickable), so the thing you press is the text itself.
- **Edit Me's name field is tiled inside the box.** An `<input>`'s value is a string and cannot hold per-character
  colour — `::selection` looks like an exception but is a browser-drawn state, not an addressable range. So the input's
  own glyphs are made transparent and the same string is laid underneath in colour, copying the field's font, padding
  and horizontal scroll. Selecting text still reveals it normally. The splitting is done in the one place that already
  does it; the webview does not get a second copy of the rule.

### v4.0.366 (2026-08-22)
- **The colour tiles now survive the orange raw-source line.** Measuring showed the ranges were being produced all
  along (16 either way) — what failed was the colour contest against the full-line orange. The colour is now poured
  through both taps: the ordinary `color` and an `!important` one on `textDecoration`.
- **Readable timestamps get tiled too.** `H2_2026.08.22(s)pm07:07.59JST` is not packed, but a date is read the same
  way wherever it appears, so it is painted the same way — separators left alone, only the units you actually read.
  Consistency is what teaches the eye that a tiled thing is a date.
- **The Me Dock header is two rows.** The top row was getting crowded enough to make the panel hard to resize, so the
  file name and update time moved down one line, indented to the version number and set on a tight line-height — the
  header grows by one small row, no more. That timestamp is tiled as well, so the same lesson is visible in the place
  you look most often. The colours come from the single list in the extension; the webview is not given its own copy.

### v4.0.365 (2026-08-22)
- **The saved marker was the wrong way round.** Now **● orange = unsaved** (danger — same direction as VS Code's own
  tab marker, which is already in your hands) and **× green = saved** (safe — nothing left to write).
- **One tooltip, not two.** Elements drawn with the CSS `::after` tooltip must be excluded from the JavaScript one —
  the rule set for `.big-action` back in v3.1.32. I added the CSS half and left the JS half firing, so both appeared.
  Two tooltips means two mouths.
- The tooltip sits closer to what it labels, and opens from the left edge instead of the right.

### v4.0.364 (2026-08-22)
- **The UD tooltip no longer covers the timestamp it describes.** MeOS shows tooltips with `data-tip` + a CSS
  `::after` that opens *above* the element — the house solution since v3.1.32, precisely to avoid this. I used a
  plain `title` instead, so the OS tooltip landed on top of the date. It now rides the existing tooltip, and says
  **"Last updated"** to match the `UD` it labels — "Last written to disk" was my wording, not the user's.

### v4.0.363 (2026-08-22)
- **Membrane-name timestamps are colour-tiled so you can read them.** `_20260822s174435JST` is packed tight because
  *writing* wants it short, but *reading* wants a date and a time. Adding separators would throw away the compactness,
  so the separation is shown in colour instead: year / month / day / weekday / hour / minute / second / zone each take
  the next colour in a three-colour cycle, so neighbouring fields never share one. Variable precision is handled
  (`Kt_19580126S08JST` splits into five), and a name without the weekday letter is not treated as a timestamp at all —
  the same guard that keeps `table_143052` from reading as "year 1430, month 52". The colours are applied with
  `!important` so they survive on top of the orange raw-source rendering, which is where they matter most.
- **The file menu says whether the file is saved, and when it last was.** `[Kt_1958…▾] ● UD2026.08.22(s)pm05:58.01JST`
  — a green ● for saved, an orange × the moment you type, and UD = the file's mtime, i.e. the last time it actually
  reached the disk. The timestamp comes from the same single formatter the headings and membrane names use.

### v4.0.362 (2026-08-22)
- **Press ▼ twice in a row.** Clicking the glyph put the caret on that line, and "the line under the caret shows raw
  source" (v4.0.345) turned the mark into plain characters — so the second press had nothing to aim at. The result of
  pressing was erasing the thing you press next. Clicking a button is not "I came here to edit this line", so the
  click no longer counts as landing on the membrane: it reuses the existing landing-suppression (`setRefNoRaw`,
  v1.0.11), which holds only while the caret stays on that line. The mark stays visible and takes press after press,
  exactly like Me Dock's ▼⇄▼▲ — and moving away and coming back still shows the raw source for editing.

### v4.0.361 (2026-08-22)
- **A folded membrane's tip says `Toggle ▼▲-Button!`.** The mark changes when you fold, so the words change with it.
  More to the point, the glyph is now decided in **one function** that both the rendering and the tip read, with both
  asking the same `isPairFolded` — the split between "what is drawn" and "what is described" is exactly the kind of
  gap that produced today's earlier mismatches.

### v4.0.360 (2026-08-22)
- **The tip now names the thing you press.** "Toggle Me!" is an imperative, so it reads as the press target — and
  tips cannot be pressed. It now says **"Toggle ▼-Button!"** (and "▲" on a closing line), pointing at the mark that
  actually responds. The mark's own hit area was widened in v4.0.359; the wording was the other half of the problem.
- **Removed a tip that described a feature that no longer exists.** Hovering a membrane name promised "double-click
  to jump between the opening and closing membrane" — that route became the raw-view toggle back in v0.9.584. An
  explanation that is not true is worth deleting, not rewording.
- **Body double-click no longer enters raw view.** It entered in complete silence, which read as "the membrane got
  stuck as a comment" with no way back. Raw view keeps its one deliberate entrance: Me Dock's 👁Raw. Single-click
  jump (open ⇄ close) is untouched.

### v4.0.359 (2026-08-22)
- **The ▼ is clickable again — the target was one column wide.** Six logged clicks landed on columns 9, 11, 12, 15,
  16 and 20; the hit test accepted only column 13. Worse, the column *moves with the rendering*: while decorated, the
  ▼ is a decoration and the click lands on `idStart`; while the line shows raw source, the ▼ is a real character
  several columns to the left. Same mark, same apparent place, different target. The hit area is now **the ▼ through
  to just before the membrane name**, which is the mark's territory under either rendering. The name and comment to
  its right keep belonging to jump, unchanged.
- **Reverted a mistake of mine from v4.0.354.** `showFoldingControls: "never"` in the workspace is not leftover
  debris — it is the user's own choice, written by Me Dock's `Standards > v` toggle, and MeOS restoring it at startup
  is correct behaviour. I misread it, deleted the line from their settings, and added a notice offering to turn the
  arrows back on. The notice is gone. The answer to "I can't fold from the gutter" is to make MeOS's own ▼ clickable,
  not to switch on chevrons someone deliberately turned off.
- **Raw view says when it turns on, and how to leave.** Double-clicking a membrane name toggles raw view; it used to
  do so in complete silence, so it read as breakage with no way back. It now says so, and names the way out.

### v4.0.358 (2026-08-22)
- **Focus returns to the editor after a restore — this time for real.** v4.0.357 *awaited* `showTextDocument`, and
  while focus sits in a webview that promise can simply not come back, taking the `refresh()` behind it with it. The
  log proved it: `[sel] activeEditor was empty` still firing 1.7s after the restore finished. Refresh now runs first
  and focus is handed back without waiting, followed by an explicit focus-editor-group command.
- **The tip and the click now agree.** Hovering accepted two columns (`idStart` and `idStart - 1`) while the toggle
  accepted only one — so part of the area that says "Toggle Me!" did nothing when clicked. Both now ask the same
  function.
- The `[arrow]` log records the text under the click, and startup records the effective `showFoldingControls` /
  `folding` / `foldingStrategy` — if the gutter arrows are off, that line says so before anyone blames the membranes.

### v4.0.357 (2026-08-22)
- **"The gutter menu still does nothing" was MeOS being asleep, not the membrane machinery.** The instrumentation
  added in v4.0.356 logged the ▼ click **zero times**, and the screenshot showed a membrane line rendering as raw
  source with no caret on it — decorations had never run either. Cause: right after a restart the focus sits in Me
  Dock (a webview), so `vscode.window.activeTextEditor` is `undefined`; `refresh()` with no argument then burns that
  `undefined` in, and every selection event is dropped by the `e.textEditor !== activeEditor` guard on line one.
  Startup now works from the *visible* editor, and a selection event from a visible editor is adopted when the
  remembered one is empty.
- **The editor gets focus back after a restore**, as requested — you are handed the restored position ready to type.
- **Fixed the "did the fold take?" measurement.** It asked whether the membrane's body *overlaps* the viewport, so a
  60,000-line membrane answered "still open" no matter what — visible in the log as `fold=142 rounds=1
  stillOpenOnScreen=142`. It now asks whether the line after the opening line is hidden, the same yardstick the ▼▲
  glyph uses, and does not chase membranes it cannot see.

### v4.0.356 (2026-08-22)
- **Instrumenting the ▼ click.** "The tip appears but clicking does nothing" — and five guesses in a row failed to
  explain it, so clicking a membrane line with the mouse now records the three things that decide the outcome: the
  column the caret landed on, the column the ▼ occupies, and whether a suppression window swallowed the event. If
  `caretCh` and `idStart` differ, the click is not landing on the glyph; if `suppressed=true`, something ate it.
  Only fires on membrane lines touched by the mouse, so it costs nothing on the typing path.

### v4.0.355 (2026-08-22)
- **The restart lands on your line again.** v4.0.353 made the restore actually fold — and folding *shortens the
  document above you*, so the scroll position VS Code restored was pointing somewhere else entirely. The caret was on
  the right line the whole time; only the view was wrong. The restore now re-centres on the caret **after** the folds
  land, instead of trusting a position decided before them.
- **The Line box responds even when you are already on that line.** It used to return silently when the target
  equalled the current line — which is exactly the case above: right line, wrong view, and pressing Enter appeared to
  do nothing. Naming a line is a request to *see* it, so it now reveals regardless.

### v4.0.354 (2026-08-22)
- **The real cause of folded membranes re-opening after a restart: MeOS was rewriting its own `⊖` back to `⊕`.**
  The badge moved to the FC line after ▲ in v4.0.330, but `isPairFolded` still read the *opening* line only — so a
  membrane marked `⊖` looked badge-less and fell through to the default "open". From there it is one road: restore
  folds it (that path reads the new location), refresh asks "is it folded?", hears *no*, and writes `⊖` → `⊕` — and
  because the badge sits inside the fold, that write makes VS Code recompute folding and open it (v0.9.906). The
  caret was never involved. Both readers now ask the same one place, `meosPairBadgeAt`.
- **The missing folding arrows in the gutter were a leftover setting, not FC.** A workspace `.vscode/settings.json`
  still carried `"editor.showFoldingControls": "never"` from when MeOS used to write it; a workspace value overrides
  the user's `"mouseover"`, so the arrows vanish in that folder only. The old cleanup only ever inspected the *global*
  value, so it could not reach it. MeOS now says so once, with a button that turns them back on — it does not rewrite
  the setting behind your back.

### v4.0.353 (2026-08-22)
- **Folded membranes stay folded across a restart.** A month-old complaint, and the reporter's own aside pointed
  straight at it: *"when the jump back to the original line fails, it stays folded."* VS Code always reveals the line
  the caret is on — so when the restored caret landed inside a membrane, folding it immediately un-folded it again.
  When the jump failed, the caret never landed inside, and the fold survived. This is the same hole v0.9.905 closed
  for the toggle path; the restore path never got the patch.
- Restore now (1) **unfolds first, then folds** — it was the other way round, so re-opening a child `⊕` re-opened the
  `⊖` parent that had just been folded (Me All has said "unfold first" since v0.9.345); (2) **moves the caret out of
  every range about to be folded**, to the *outermost* opening line — and re-checks each round, because VS Code's own
  caret restore can arrive after ours; (3) **keeps trying until the fold takes** (up to 6s), since on a 140k-line file
  the folding provider is not ready 250ms in and a single `editor.fold` silently does nothing.
- The restore writes one line to the debug log — how many were folded, how many rounds it took, how many were still
  open on screen at the end.

### v4.0.352 (2026-08-22)
- **A measurement, not a fix.** A membrane folded right after being created once showed decorated text with the caret
  on it, where raw source was due — and it did not reproduce. Rather than guess, folding now writes one line to the
  MeOS Debug log (and `meos-debug.log`): which line was folded, where the caret ended up, and whether that line was
  counted as a raw-source line. If the two disagree, the next occurrence will say so instead of us re-deriving it.
  Folding is a rare action, so the line costs nothing on the typing path.

### v4.0.351 (2026-08-22)
- **Rename a membrane by just typing over its name.** No Edit Me needed: type the new name on the opening line, and
  when you leave that line MeOS carries it to the closing line in **one** edit (one undo). Renaming used to break the
  pair, because pairs are matched *by name* — so the moment you changed it, the closing line was orphaned. The fix is
  to note the old name and the closing line's number **on entry**, while the pair is still intact.
- Only the line you left is touched, and only if the closing line still holds the noted name — if something else
  already changed it, MeOS keeps its hands off. If the membrane was folded, it is folded back after the edit
  (writing inside a fold makes VS Code recompute folding and pop it open — v0.9.906).
- **The FC echo is blue now.** It is a picture, not text: the real FC line lives after ▲, inside the fold, so no
  arrow key reaches it. Orange means "these characters are yours to edit"; the echo is aqua to say the opposite
  before you try.

### v4.0.350 (2026-08-22)
- **Put the caret in a folded membrane and it no longer looks open.** The opening line shows raw source while the
  caret sits on it (v4.0.345), and raw source carries a single ▼ — so a folded membrane read as an open one. Two
  marks are now *added* on top of the raw line, hiding nothing: a **▼▲** at the head, and an echo of the **FC
  comment** at the end of the line.
- The echo is needed because the FC line lives after ▲ — inside the fold — so while a membrane is folded its badge is
  invisible. Now the folded look and the caret-on-it look say the same thing. The echo is italic: it is a copy, not
  the editable line (open the fold to edit it).

### v4.0.349 (2026-08-22)
- **A folded membrane's head now reads ▼▲, whoever folded it.** MeOS only ever remembered the folds *it* made, so a
  membrane collapsed from the gutter arrow stayed marked ▼ — open. (This membrane's badge lives on the FC line after
  ▲, inside the fold, so the mSTAT fallback that reads the opening line never saw it either.) The rendered mark and
  the toggle button now come from one answer: what the screen can actually prove.
- Only *proof* is used. A gap between two visible ranges happens when — and only when — something is folded, so
  "the next line is hidden" means folded and "the next line is visible" means open. The last visible line stays
  **unknown** (it may just be the bottom of the window) and falls back to memory/badge as before. v0.9.216's rule —
  the viewport must not decide membrane state — was about reading *offscreen* as folded; that cannot happen here.
- The raw file is left alone: the ⊕/⊖ badge is still written only for folds MeOS itself performs. A badge write
  inside a folded range would make VS Code recompute folding and pop the membrane open again (v0.9.906).
- `check_fold.js` (dev only) drives the real `applyPrettyLabels` with a gapped visible range and asserts the glyph.

### v4.0.348 (2026-08-22)
- **A spec group folds again when you leave it.** v4.0.343 stopped folding from the caret path to break a chain of
  misbehaviour — but that was blunt first aid: the real cause was hidden bytes sitting under the caret, and v4.0.344/345
  removed that exception entirely. So the behaviour comes back.
  What was actually being seen in between is worth recording: a group left open only closed when you entered *another*
  heading, because opening the new one shifted the visible range, which woke the bulk fold pass, which folded every
  visible open group except the cursor's. It was closing by a different route, late and in batches.
- Folding still waits for the caret to settle (700ms) while opening happens sooner (260ms), so passing through a group
  costs nothing — a held arrow key keeps resetting the timer and never changes the fold state at all.

### v4.0.347 (2026-08-22)
- **Highlight and super/subscript step aside for the caret too.** Only strikethrough started working in v4.0.346
  because "which lines show raw source" was written out separately in **eight** places — the main decoration pass plus
  table fit / merge / calc / row-lines, MeTeX, note links, highlight and function membranes — and only the first was
  changed. All eight now ask the same function. Which one worked and which did not was itself the clue.
- **Every decoration pass is now timed.** They had no measurement at all, while refresh, folding ranges and document
  links did — so a slow one could never show up in the log. Anything over 300ms writes a line naming the pass.
- The harness now fails if any pass goes back to counting cursor lines for itself, or loses its timer.

### v4.0.346 (2026-08-22)
- **Standing on a spec line really does show its heading, highlight and strikethrough as raw now.** v4.0.338 claimed
  this and did not deliver: the six places switched to the new measure were the ones that pre-mask the text, while the
  six that actually decide whether to draw the decoration still asked "is this the caret's line". Both sets now go
  through one judgment, and a multi-line highlight or strikethrough steps aside if any line it covers is raw.
- **The test that let it through has been replaced by one that counts the users.** v4.0.338's check only proved the
  pair mapping was right; it never looked at who consumed the answer, so it passed while nothing changed on screen.
  The harness now fails if any decoration gate is left on the old measure.

### v4.0.345 (2026-08-22)
- **The whole membrane goes raw together.** With the caret on the opening line, the closing line and the badge stay
  decorated — but those three lines are one thing, so all three now show raw source. Selecting a membrane name to
  copy it is ordinary text selection again.
- **The way back is closed** (at the user's request). Everything built to walk the caret over hidden bytes is gone:
  the guard's membrane branch, five keybindings, four context keys, and the constant that could have restored the old
  look. None of it was solving a problem that existed on its own — it was all paying for one exception to the rule
  that the line under the caret shows raw source.

### v4.0.344 (2026-08-22)
- **A membrane line now shows raw source when the caret is on it, like everything else.** This was the one place that
  did not follow MeOS's oldest promise — headings, highlights, strikethrough, tables and folding comments all step
  aside for the caret; membrane lines kept their decoration on. That is why hidden bytes existed *under* the caret at
  all, and why a guard, five keybindings and four context keys had to exist to walk over them. Removing the exception
  removes the need for all of it, and arrow keys are plain VS Code again.
  The guard and the keys are still in the source, switched off by one constant, so the old look can be restored.
- The original reason appears to have been wanting the membrane to look tidy while the caret sat on it — which was
  never a reason to outrank the promise.

### v4.0.343 (2026-08-22)
- **Moving the caret no longer changes how the document is folded.** That was the reason plain arrowing kept finding
  new ways to misbehave: folding and unfolding are commands to VS Code that take hundreds of milliseconds on a
  178,000-line file, and while they run the view, the caret and the selection all move. An ordinary editor feels
  simple because moving the caret changes nothing; MeOS was touching the fold state on every crossing. Closing the
  patches one at a time (v4.0.336–342) never removed the cause.
  A spec group still **opens** when the caret settles in it — that is the promise that the line under the caret shows
  raw source — but it is never folded shut again from the caret path, because the default shape only needs making
  once, when the file is read. Re-fold by hand with **MeOS: Fold the spec lines (Mew!FC)**; leaving raw mode still
  restores the folded shape as before.
- Opening waits for the caret to stop, so a held arrow key changes nothing at all on the way through.
- When MeOS moves the caret itself, it now records one line in the debug log saying which key did it and from where.

### v4.0.342 (2026-08-22)
- **Held arrow keys move straight through a membrane line.** A keybinding's `when` clause reads a context value MeOS
  sets from the *previous* selection change, and key repeat is faster than that round trip — so during a held key the
  edge commands were firing from positions that were no longer edges, which is what sent the caret two lines on or
  back. Each command now checks the real caret position itself and hands the key to plain `cursorLeft` / `cursorRight`
  / `cursorHome` / `cursorEnd` when the precondition does not hold, so a stale context can only ever produce ordinary
  movement. The context is a hint; correctness lives in the command.
- No timers are involved in caret movement any more, in either the keys or the guard.

### v4.0.341 (2026-08-22)
- **Entering a membrane line from above is direct too.** v4.0.340 fixed leaving but not arriving, so `→` from the end
  of the line above still touched down left of `▼` before being moved. Leaving and arriving land in the same place,
  so they are now the same command, and it reads the visible left edge from the same function `Cmd+←` uses.
- **No more pause on the way out.** Stepping off a block was folding its spec group immediately, and the first
  `editor.fold` on a 178,000-line file takes a few hundred milliseconds while VS Code rebuilds its folding ranges —
  which is exactly why the pause disappeared after a few tries. Opening still happens at once, because "the line under
  the cursor shows raw source" cannot wait; closing now waits for the cursor to settle, because passing through is not
  leaving. Walking `▼` → body → `▲` used to cost two folds and now costs none.

### v4.0.340 (2026-08-21)
- **Leaving a membrane line is direct too.** From the visible left edge, `←` goes straight to the end of the line
  above; from the visible right edge, `→` goes straight to the start of the line below. Neither touches down in the
  hidden bytes on the way. That completes the set: arriving at each edge, and leaving from each edge, all four now
  pick their destination up front — the guard is left to catch arrow-up/down and anything a key cannot decide.
- All four destinations are computed from the same two functions the guard uses, so a key and the guard can never
  disagree about where an edge is.

### v4.0.339 (2026-08-21)
- **Both edges of a membrane line now have a destination, not just the right one.** `Cmd+←` lands on the head of the
  name, and arrowing left back from the line below lands on the visible right edge instead of touching down past the
  hidden tail first. A membrane line has two visible edges; v4.0.338 gave a destination to one of them.
- The left and right edges come out of the same pair of functions the guard uses, so the key and the guard can never
  disagree about where the edge is.

### v4.0.338 (2026-08-21)
- **Standing on a spec line shows the line it describes as raw again.** Which lines turn orange and which lines show
  raw source were being decided by two different measures: orange had moved to the pair (body line *i* ↔ spec line
  *i*), while raw was still just "the line the caret is on". So editing a heading's spec left the heading itself
  decorated — you could not see the thing you were changing. Both now come from the same judgment, which is what the
  colour was announcing all along: **an orange line is a line showing raw source**. A table still shows only the pair,
  never the whole block.
- **Right-arrow off the closing line enters the badge comment**, the same place down-arrow lands. v4.0.336 stepped
  over the folded group to stop the caret bouncing across `▲`, but the bouncing was the fold restore fixed in
  v4.0.337, so stepping over is no longer needed — and one destination should not depend on which key you pressed.
- **Cmd+→ on a membrane line goes straight to the visible edge.** It used to land past the hidden tail and get moved
  back, which is visible as a flicker whenever the extension host is busy. Anything that corrects after the fact is
  visible at least once, so that key now picks the right destination up front, the same way table cell movement
  already does. The general guard stays as the catch-all for arrow-up/down.

### v4.0.337 (2026-08-21)
- **The caret stops being dragged back after a fold.** v4.0.326 narrowed the "put the caret back" window to a single
  fold command, but on a 178,000-line file one such command takes hundreds of milliseconds — long enough for several
  arrow presses, all of which were then undone. Folding only moves the caret when the caret was *inside* what got
  folded, and then it lands on the block's first line, so that is now the only case restored. Any other difference is
  someone moving the caret on purpose, and it is left alone.
- **The seven invisible characters at the end of a membrane line are no longer a place to stand.** They are ` *} -->`
  — the count was exactly right. Arrow-up/down in VS Code preserves the column, so coming from a longer line lands the
  caret inside that hidden tail, which reads as landing a couple of characters past the comment. v4.0.336 closed the
  head of the line but not the tail; both ends are now handled the same way. Pressing right *past* the edge still
  moves to the next line as before.

### v4.0.336 (2026-08-21)
- **Holding the right arrow on a membrane line behaves again.** Three things were stacked here.
  - The caret guard, which repositions the caret out of the hidden `<!-- {* ▼mCN=` zone, has to ignore the selection
    change **it itself** causes — and it did that by ignoring everything for 25–35ms. Key repeat is faster than that,
    so held keys slipped through the window, walked into the hidden zone unguarded, and left the "which way did we
    come from" record lying, which is what sent the caret backwards. It now remembers the exact position it set and
    ignores only that, so repeat cannot slip past.
  - Past the closing line's right edge, the caret was being put on the **next** line — which is now the folded badge
    line. Landing in a folded region makes VS Code open it and MeOS fold it again: the bouncing across `▲`. The badge
    group is now stepped over.
  - The hidden zone was guarded only on its inside, so the caret could still rest at the line head, left of `▼` —
    where a selection picks up `<!-- {* ▼mCN=…` as raw text. The whole zone is now one place the caret is moved out
    of, and arrowing left from the name goes straight to the previous line's visible edge.
- Shift-arrow was never affected because the guard deliberately never touches a non-empty selection — that is why
  selecting felt natural while plain arrowing did not.

### v4.0.335 (2026-08-21)
- **Membrane colour follows the badge to its new home.** v4.0.330 moved the badge but left the drawing and the colour
  writer reading the opening line, so a new-form membrane had no colour code there, fell back to colour-by-depth, and
  came out purple — and setting a colour from Mepy wrote it to a line nothing reads. Every place that asks for a
  membrane's colour now asks by the **opening line's number**, through one entry point that knows the badge may live
  under the close; the writer edits whichever line actually holds it. Old-form membranes read from the opening line
  exactly as before.

### v4.0.334 (2026-08-21)
- **Wrapping membranes in another membrane corrects the depths inside.** That is the case where a depth actually goes
  stale, and it is the one moment where correcting it costs nothing: wrapping makes everything inside exactly one
  level deeper, so there is no counting to do and the range is precisely the selection — never the whole file. The
  gauge stays right without the typing path ever paying for it.
- **Except when the new membrane becomes the file's envelope.** A single membrane wrapping the whole file is already
  depth-transparent (v0.9.874), so its chapters stay at 0 — wrap everything and nothing inside moves.

### v4.0.333 (2026-08-21)
- **Depth is a declaration, not a derived value.** Recomputing it from the nesting would mean walking 178,000 lines,
  which is the very thing that makes backspace stutter — so MeOS does not recompute. What is written is what the
  writer meant ("I know there is a membrane outside me"), and MeOS's job is to **check** it, not to overwrite it.
  A check runs once a day in the background, and on demand via **MeOS: Check membrane depths against the nesting**;
  mismatches are reported with the option to jump to the first or fix them all. Nothing is rewritten silently.
- **Measurement for the backspace stutter.** The log already showed `[host-blocked] 700–2000ms` with no MeOS timing at
  the same moment and the heap swinging up to 3GB, which points at garbage collection rather than MeOS's own work.
  The largest thing MeOS allocates is the split of the whole document into lines; the typing path is supposed to patch
  that array in place instead. It now counts how often it re-splits anyway, with the memory figures, so the next log
  says plainly whether that is the source.

### v4.0.332 (2026-08-21)
- **The opening line, the closing line and the badge are one thing.** Put the cursor on any of the three and all three
  turn orange and the badge opens. The body is deliberately not part of it — a membrane's block is its two structure
  lines, the way a table's block is its rows.
- **The badge line no longer repeats the membrane name.** `<!-- Mew!FC mCN (📊⊕0+0D-2Y) -->` — `mCN` only names what
  kind of thing this is. The name is already on the closing line right above it, and writing it twice would mean a
  rename has to fix both, which is a way for them to disagree. Old `mCN=name` badges are still read.

### v4.0.331 (2026-08-21)
- **Create Me now writes the badge line too.** There are four ways to make a membrane — Add Membrane, Create Me, the
  first membrane in a new .md, and wrapping a table — and v4.0.330 only taught one of them. The fix is not to teach
  the other three: **the closing line and its badge now come out of one function together**, because as long as they
  can be written separately, sooner or later one caller writes only half. The opening line also stopped defaulting to
  a badge of its own, which was quietly reviving the old form.

### v4.0.330 (2026-08-21)
- **A membrane is a block, so its badge goes under it.** Tables and lists already put their spec on the line after the
  block; a membrane is a block too, so its mSTAT badge moves from the opening line to a folding comment on the line
  after the close:

  ```
  // {▼mCN=3129_20260821 // work log}
  body…
  // {▲mCN=3129_20260821 //}
  <!-- Mew!FC mCN=3129_20260821 (⊖9+1D-1W) -->
  ```

  The placement is not a new decision — it falls out of a rule that was already there, so there is no exception to
  remember. Directly *under* the opening line would not work: an FC fold range starts at the body line above the
  comment, so two ranges would start on the very same line and `editor.fold` would have to choose between them. After
  the close, the two nest cleanly — the membrane's range now runs `[▼ .. ▲+n]` and contains the FC's `[▲ .. ▲+n]` —
  which also means folding the membrane hides the badge, and copying a folded membrane carries the badge with it.
- **Old files are not touched.** The badge is read from wherever it is, through one entry point; only new membranes
  are written the new way, and `📊0` is no longer written at all — hiding is the fold's job now, not a setting's.
- The badge line is deliberately *not* a line spec, so v4.0.325's "delete the body, delete its spec" leaves it alone.
- Groundwork only: the rendering side (colour, `N0`/`N1`, alias, stealth) still reads the opening line, so `📊0/📊1`
  stays supported until that is joined up.

### v4.0.329 (2026-08-21)
- **Clicking the tab you are already on adds the file back — for real this time.** Recording it and showing it are two
  different jobs, and v4.0.326 only fixed the first: the list is sent to the Me Dock only when the file changes, so
  returning to the same tab recorded the file and never sent the list. It looked fixed with two files open because the
  file happened to differ. Recording now always sends.
- **The bulk fold stays off the typing path.** Backspacing shifts lines, which moves the visible range, which was
  ringing the signal added in v4.0.327 — and the block list is rebuilt whenever the document version changes, so every
  keystroke could re-scan the file. It now waits for typing to stop, using the same quiet-period measure as the
  per-cursor pass rather than a second one of its own.

### v4.0.328 (2026-08-21)
- **The spec no longer folds itself away a second after you reach it.** The signal added in v4.0.327 was being rung by
  the thing it then undid: the cursor enters a block, the per-cursor pass opens its specs (the standing promise that
  the line under the cursor shows raw data), opening changes what is on screen, that fires "visible range changed",
  and 320ms later the bulk pass folded the group that had just been opened for you. **The bulk pass now leaves the
  cursor's own block alone**, and stands aside entirely while the per-cursor pass is working.

### v4.0.327 (2026-08-21)
- **No more jump to the top of the membrane after a fresh install.** `editor.fold` folds the *innermost* range at a
  line — and when that range is already folded, there is no inner one left, so it folds the next one out: the membrane.
  v4.0.188 named this and put a guard on the per-cursor path, but the bulk pass never got one, and a fresh install is
  exactly when it bites: VS Code remembers fold state per file, so the first pass meets a document full of
  already-folded blocks. The bulk pass now folds **only blocks that are on screen and actually open** — nothing
  off screen is touched, so nothing can scroll — and blocks fold as you scroll them into view.
- **The menu hint is a tip again.** A line that is always there stops being a hint and becomes something else to read;
  the value of a tip is that it answers only when asked. It now appears on hover of `📌` or `×` — and appears *below*
  the menu, outside it, so it still covers nothing. The `▾` has its tip back too, placed directly above the button,
  where the menu hanging below it can never reach.

### v4.0.326 (2026-08-21)
- **The caret stops being yanked back.** The fold sync remembered where the caret was **when it started**, then put it
  back afterwards — so anything you did during the wait (fold and unfold are slow in a 160k-line file) was mistaken for
  the fold's doing and undone. That is why it happened sometimes and not always: only when the wait ran long. It now
  takes its snapshot **immediately before each fold command** and restores only what changed during that one command.
  On the way out it puts back the scroll position and nothing else — the caret is yours.
- **A pinned row's `●` stays a `●`.** The rule that makes a dirty dot turn into `×` on hover sat *after* the rule for
  the un-pressable dot, and at equal specificity the later rule wins, so the dot turned into a close button you could
  not press. The un-pressable rule now comes last.
- **The hint moved out of the tooltip and into the menu.** Both a MeOS tip and a native `title` pop up under the
  pointer, which is what was covering the `▾` and the `×` — swapping one for the other in v4.0.325 changed the styling,
  not the position. A small line at the foot of the menu says what `📌` and `×` do and covers nothing.
- **Clicking the tab you are already on adds the file back to the list.** Adding was tied to "a different file
  appeared", so re-choosing the current tab was silent. It now also listens for the editor becoming active, which is
  what actually fires when you click back from the Me Dock.

### v4.0.325 (2026-08-21)
- **Orange marks the pair again — the line and the spec that belongs to it.** Body line *i* pairs with spec line *i*,
  in a table, in a list, or on a single heading; the rule reads the same from either side. One line alone could not
  show a pair, which is half of what the colour is for (the other half being "these two are showing you raw data").
- **Delete the body and its spec goes with it; delete the spec and the body stays, plain.** The rule is not symmetric
  on purpose: the spec belongs to the line, not the other way round. In a table or a list, removing one row takes out
  **one** spec line, not the group; and removing a spec line puts a `not` placeholder back so the count still lines up
  row for row.
- **This actually fires now.** v4.0.324 only watched for "a whole line vanished in one edit", but the ordinary way to
  delete a line is two edits — clear the characters, then backspace the blank line — and neither one matched. A body
  line going empty now counts as deleted.
- **`×` in the file menu no longer closes the tab.** The list is a set of bookmarks; throwing one away is no reason to
  close the file. The tab's own `×` still closes. Removing a file and then clicking its tab puts it back in the list.
- **The `▾` tip no longer covers the menu button** it describes.

### v4.0.324 (2026-08-21)
- **Delete the line, and its spec goes with it.** An FC group belongs to the body line above it. Remove that line and
  the specs were left behind — and, because each one looks at the line directly below itself, they silently re-attached
  to whatever line had moved up into the gap: colours and tips appearing on text that never asked for them. Now, when
  whole lines are removed and an FC line is sitting at the spot, the run of specs starting there goes too.
  **Tables and lists are the exception**: the group belongs to the whole block, so deleting one row leaves the owner
  standing.
- **Orange means "this line is showing you raw data", and only the cursor's line is orange.** It used to paint the
  body line and its FC lines together, which said "these two are a pair" — true, but not the thing worth saying every
  time. What the colour is actually marking is the one line MeOS has stopped rendering so you can edit it. In a table,
  every other row keeps its proper rendering, which is exactly why the rule reads the same there.
- **The file menu can be emptied.** Re-posting the Me Dock state no longer re-adds the current file; a file joins the
  list when you click its tab. Removing the last entry now leaves it empty instead of pulling one back in.
- **The `▾` tip no longer covers the menu button** it was describing.

### v4.0.323 (2026-08-21)
- **Backspace responds again** — the orange pairing added in v4.0.301 asked for the FC blocks on every redraw, and
  that answer comes from scanning the whole file; the cache is keyed by document version, so every keystroke rebuilt
  it. Same hole as v4.0.320, in a different place: fixing one caller is not the same as checking them all. The pair is
  the body line (or its whole table/list) plus the FC lines under it — a few steps either way. 29ms per keystroke → 0.
- **One rule decides the pin: if the menu holds a single entry, that entry is it.** The first file, the last one left,
  and one re-added after emptying the list all pin for the same reason instead of each needing its own condition.
  Releasing a pin still sticks, because pressing 📌 no longer re-records the file.

### v4.0.322 (2026-08-21)
- **`×` removes the file from the menu** — it used to only close the tab, so the list never shrank and "the last one
  left" could never happen. The list is meant to grow and shrink with what you are working on, so `×` takes the entry
  out (closing the tab too, if it is open) and appears on every row rather than only the open ones.
- **When one entry remains it becomes the pin**, as with the first file. Releasing a pin still sticks, so unpin then
  `×` empties the menu — the flow does not dead-end.

### v4.0.321 (2026-08-21)
- **A pin can be removed again** — v4.0.320's auto-pin fired whenever nothing was pinned, so releasing one instantly
  pinned it back and the last remaining file could never be closed. Auto-pinning is a starting value, not a rule: it
  happens once, and after that the pin is whatever you last decided.
- Moving the pin stays a single click on the other row. Having decided there is only one pin, choosing a different one
  should not take two steps, and releasing is still there when you want it.

### v4.0.320 (2026-08-21)
- **The heading button is instant again** — last night's check-time watcher asked for the FC block on every cursor
  move, and that answer is computed by scanning the whole file. The cache is keyed by document version, so every
  keystroke threw it away: 28ms per scan, paid over and over (169ms across five moves in a 140k-line test). The block
  is the body line plus the FC lines under it, which is a few steps up and down — no full scan needed. Measured at 0ms.
- **The first file you open is pinned for you** — and since a pin never falls out of the list, the last one left is
  the pinned one. Neither end needs pinning by hand. To close the last one, unpin it first, then `×`.

### v4.0.319 (2026-08-21)
- **The check time lands when you leave, not while you type** — v4.0.318 stamped on the first keystroke, which with
  an IME means the first *kana*: typing 済 produced `[す 2026…]`. Waiting for Cmd+S was too late and nobody remembers
  it; stamping per keystroke is too early. The right moment was already MeOS's own rule — **raw under the cursor,
  settled once you leave** — so the time goes in when the cursor leaves the block. Moving between the heading and its
  FC line is still inside, and the box is re-checked before writing, in case you typed a time yourself on the way out.

### v4.0.318 (2026-08-21)
- **Checking a box stamps the time immediately** — it used to wait for Cmd+S, which is correct behaviour nobody can
  be expected to remember; the author had forgotten it himself. Write anything into `//[…]tip=` and the time goes in
  as you type, like the other instructions that make the text follow. The save-time pass stays for anything that
  arrives by paste or bulk edit, and it is idempotent, so nothing is written twice.
- **The tip drops the word "Checked"** — the ✅ already says it. `✅ 2026.08.21(F)am01:10.56JST [済]`.

### v4.0.317 (2026-08-21)
- **Checked is written in the same format as Created** — `2026.08.21(F)am00:55.41JST` rather than the old
  `2026-08-21 00:55`. The two sit on the same FC line, so they should read the same way. Records already written in
  the old format are still read, and are not rewritten. One expression decides what counts as a recorded time, and
  both the hover and the injector ask it.

### v4.0.316 (2026-08-21)
- **`✅` is display only, everywhere** — it is drawn in the hover and written nowhere. That was already true of the
  v4.0 form, but the legacy shell path still stamped a literal `✅` into the raw text on save (and removed it again
  when unchecked), quietly editing lines written long ago. v4.0 never writes shells, so the only files it could touch
  were old ones — the worst thing to change silently. Both paths now record the time and nothing else. A `✅`
  already written stays where it is.

### v4.0.315 (2026-08-21)
- **Checking a box records the time again** — write anything into `//[…]tip=` and saving injects the timestamp, so the
  hover reads `✅ Checked: 2026-08-21 00:34`, matching H-TOC's Checked. Nothing about this feature had changed: it
  looks inside the old shells (`##[…]##`, `=={…}==`, `~~{…}~~`), and when v4.0 dropped the shells, headings written
  the new way stopped matching any of them. The reading half never broke — only the writing half was left behind.
- On the v4.0 form only the timestamp is injected. The `✅` that used to be prepended to the body stays out of it:
  the body is plain Markdown and gets nothing added, so the whole record lives in the comment.

### v4.0.314 (2026-08-21)
- **The heading timestamp is Created, and Created is written once** — it is the day the writer made this heading, the
  same thing H-TOC calls Created, and Bird-EV ToDo needs it. Pressing the heading button again now keeps the original
  time instead of stamping today's.
- **One line-level instruction per line** — pressing again used to leave the old directive in place and append a new
  one, so a single heading ended up carrying `H2_2020…` and `H3_2026…` side by side. The new one replaces the old, and
  the old one's Created is carried across first, so replacing loses nothing.
- v4.0.313 called the timestamp "just a label for grep". That was wrong. Being forgiving about its *shape* is still
  right — a bad stamp must not kill a heading — but its *content* is data and is never rewritten on its own.

### v4.0.313 (2026-08-21)
- **A malformed timestamp no longer kills the heading** — v4.0.312 matched it against an exact pattern, so deleting one
  bracket from the weekday left the whole instruction unreadable and the heading lost its colour. But the timestamp is
  not something MeOS reads: it is a label for `grep`. Anything up to the next space (or `//`) is accepted now, and only
  a trailing `not` is handed back to the parser. Same question as the unclosed code fence in v4.0.106 — can it stay
  standing on broken input?
- The strict pattern stays where it belongs: stripping an old timestamp out of body text, where matching only the real
  thing is the point. The same value can deserve different strictness when read and when deleted.

### v4.0.312 (2026-08-20)
- **A heading's timestamp moves into the instruction** — `## Heading` stays plain Markdown and the time is written as
  `H2_2026.08.20(t)pm11:29.35JST` in the FC line. It was put in the body back when there was no FC line and a comment
  really would have hidden it; now the comment opens under the cursor, so the reason is gone — and "not a millimetre"
  should mean it. One word, so `grep H2_2026.08.20` finds it. It is not placed after `//`, where the tip runs to the
  end of the line and the date would surface as a tooltip.
- The stamp's shape is defined once and used by both the parser and the stripper. Written generically first, it broke
  on the `(t)` in the weekday — the directive stopped at the bracket and the remainder was read as a colour. Measured,
  then fixed at the source.

### v4.0.311 (2026-08-20)
- **Selecting text no longer gets yanked away** — folding an FC group takes real time on a 140k-line file, and if you
  began selecting during that wait, MeOS put the cursor back where it had been, assuming the fold had moved it. It
  cannot tell the two apart by watching the cursor, but it can by looking at what is there: **a selection is always
  something a person made** — folding only collapses to a point, it never creates one. So a selection is now left
  alone, the fold/unfold bails out the moment one appears, and the bulk folder honours the same rule.
- The pinned row's `●` was drawn larger because it was a different element: buttons do not inherit fonts, so the same
  14px produced a different glyph. Both are the same component now, the pinned one simply disabled.

### v4.0.310 (2026-08-20)
- **A pinned file has no close button** — pinning says "keep this one", so a `×` sitting next to it contradicts the
  gesture. Only the unsaved `●` remains, and on a pinned row it is a plain marker: it does not turn into a `×` and
  cannot be clicked.
- **The startup jump says so** — the status bar reports the line for three seconds, because landing on the line you
  were already looking at is indistinguishable from not moving at all. Still no popup: startup should not startle.

### v4.0.309 (2026-08-20)
- **Returning to your last line actually works now** — the recorder was running before the restorer and overwriting
  the very number it was meant to preserve: a cursor event fires as the editor opens, MeOS wrote down line 0, and two
  seconds later the restore read a 0 and quietly did nothing. When one value is both remembered and restored, order
  matters: nothing is recorded until the restore has had its turn (with a 20-second backstop).
- **Pin one file in the ▾ menu** — 📌 keeps it at the top and out of reach of the five-file cutoff. One pin only, so
  there is nothing to choose: pinning another moves it, pinning the same one releases it.

### v4.0.308 (2026-08-20)
- **The last exception is gone: tables and lists write in one edit too** — they used to put the instruction at the end
  of the line and move it afterwards, because that is how the mover learned what had just been added: it read it back
  out of the document. It is now handed the line instead, so body and FC group are written together and the halfway
  form never reaches the file. Every format button now measures one edit in the fake editor.
- The fake editor had a bug of its own: every document it made was called `rig.md` at version 1, so the line cache
  handed back the *previous* test's document. Each one gets its own name now — and its cases are serialised, because
  the "one click, one action" guard is measured in milliseconds and a rig fires faster than a person can.

### v4.0.307 (2026-08-20)
- **The heading button no longer flashes a line-end comment** — v4.0.210 abolished writing the instruction at the end
  of the line and moving it afterwards, and v4.0.235 rebuilt the other buttons around a single edit, but the heading
  and bullet paths were never converted. They are now: the finished line is assembled in memory and body plus FC line
  are written together, so the document never holds the halfway form. Verified in the fake editor — one edit, and the
  only snapshot is the final shape.

### v4.0.306 (2026-08-20)
- **The file name is a control, and looks like one** — it sits in a rounded box with the ▾, the whole box opens the
  menu, and the box hides itself when there is no file. The name stays small because the header has no room to spare.
- **The menu itself is set larger** — a list you read deserves readable type, and it has room to be generous where
  the header does not.

### v4.0.305 (2026-08-20)
- **Picking a file from ▾ goes back to where that file already lives** — MeOS looks up its tab and reuses that
  editor group instead of opening a second copy somewhere else. Tab groups are consulted rather than visible editors,
  so a file sitting behind another tab is still found.
- **No more tooltips over the menu** — the native `title` popups sat right on top of the list they were describing.
  Gone; the rows say what they are, and the ▾ uses MeOS's own tip, which is dismissed when the menu opens.
- **Startup returns you to the line you were last on** — instead of pressing Ⓣ for you. It works in any file, needs no
  date parsing, and opens whatever membrane that line is inside, which is what the Ⓣ trick was really for. One line
  number per file, written out only once the cursor has been still. The Ⓣ button itself is unchanged.

### v4.0.304 (2026-08-20)
- **The recent-files menu behaves like tabs** — an open file carries a `×` to close it, and an unsaved one shows `●`
  instead, turning back into `×` when you point at it. Files that are not open carry no glyph, because there is
  nothing to close. The file you are in is the bold one.
- Open/unsaved state is counted **when the ▾ is opened**, not tracked continuously — the menu asks for a fresh answer
  on each open, so nothing extra runs on the paths that fire while you type.

### v4.0.303 (2026-08-20)
- **The file name lives in Me Dock, next to the version** — editor tabs get buried under every other tool's panes,
  so the one thing you need to know (which file am I in?) now sits somewhere permanently visible. A ▾ beside it lists
  the last five files you worked in; pick one to open it.
- **Orange bars mean "you are in the FC line"** — sitting on a body row tints its text but leaves the `|` alone, so
  the two cases are told apart at a glance. And the bar tint actually renders now: `color` only accepts a colour, and
  the `!important` glued onto it made the whole decoration type silently do nothing.

### v4.0.302 (2026-08-20)
- **Change the symbol in the FC line and the text follows** — turn a `==` box into `**` and `==apple==` becomes
  `**apple**` in the row above. Instructions live in the comment, so the comment is what you edit. It finds the change
  without knowing what it used to be: line up the row's marks against that FC line's boxes and act only when exactly
  one pair disagrees. Half-typed states simply do not match, so nothing happens until the symbol is whole.
- **The pair is always orange together** — sit on a row and both that row and its FC line are tinted; sit on the FC
  line and it stays tinted while the row it belongs to gets its `|` bars tinted instead. The row keeps its own
  colours: the cursor line is raw text and safe to paint, a decorated row is not, so it is marked without being
  overwritten.

### v4.0.301 (2026-08-20)
- **Any line of the block opens the group** — the FC group belongs to the whole table or list, so put the cursor on
  any row and it opens, with only that row showing its raw text. Previously only the last row triggered it, which was
  the one line nobody thinks to click. The *folding* range is unchanged, so the table itself is never folded away.
- **The matching FC line is coloured** — sit on the *n*-th row and the *n*-th line below is tinted, so "they line up"
  is something you see rather than something you count.
- **A spec line is never a body line** — with multi-line FC groups each FC line suddenly had another FC line beneath
  it, so the "read the spec below" path picked up its own neighbour and drew a list number on the comment. One guard
  fixes it. (What looked like "the last comment is missing its `1.`" was the other three wrongly having one.)
- **Enter inside a block-formed list adds the item inside the block** — the new item lands right under the current
  one and a matching FC line is inserted at its position in the group, instead of both being appended after the whole
  group. Ending the list on an empty item drops just that item and its one line.

### v4.0.300 (2026-08-20)
- **The FC group mirrors the shape of the block** — one FC line per table row, one per list item, so the *n*-th line
  below matches the *n*-th line above. You do not count boxes any more; you line the two up and read. Lines with
  nothing to say get a spacer, `<!-- Mew!FC not -->` — the same `not` already used by `H2not`, `***not` and `↑not`,
  raised one level to mean "nothing to declare about this line". No new word was added to the notation.
- Reading needed no change at all: FC lines have been read "as far as they continue" since v4.0.147, and matching has
  always been by document order, so the multi-line form already resolved correctly — measured before writing any code.
  The single-line form keeps working and is only rewritten when you touch that block.
- The table writer keeps every bit of its ordering machinery (v4.0.205–208); the new layout is a final, pure step that
  splits the finished single line into per-row lines. Making it and splitting it stay separate jobs.

### v4.0.299 (2026-08-20)
- **A list is one block, like a table** — put a single FC line under the whole list and its instructions are dealt
  out to the items in order, so `-1.` / `-1.1` / `-1a` finally produce `1.` / `1.1` / `1a` instead of a column of
  `1.`s. One comment below the list also keeps the list *one list* in external renderers, which a comment between
  items does not. Writing follows the same rule: a line-level instruction lands in the block's FC line at the item's
  position, padding the others with the form they already have.
- Instructions are dealt out **only when the number of boxes equals the number of items**. Anything else is left
  alone, so documents written the old way (an FC line under each item — which now counts correctly too) keep working
  byte for byte, and the writer can open the FC line and simply count.
- The block is measured **once**, not once per item: walking up and down for every item cost 41ms on a 140k-line
  document with 5-item lists and 1.2s with 500-item ones — on the pass that visits every line. It is flat now.

### v4.0.298 (2026-08-20)
- **The underline remembers what you chose** — ⌥Option+Click now writes the last underline style you actually
  decided on. It learns from two places, because both are the same act: correcting the `(N)` by hand in an FC line,
  and setting it in ▾ on a preset that declares `□ Link`. One value, one store, and the button face previews it, so
  what you see before pressing is what gets written. A preset that declares the link still wins for its own clicks —
  the rule from v4.0.297 is unchanged, only the fallback got a memory.

### v4.0.297 (2026-08-20)
- **The underline belongs to the preset that asked for it** — a preset with `□ Link` unchecked is not in the link
  business, so the underline value still sitting in it is just an old setting. ⌥Option+Click now writes `(0)`, a plain
  underline, and you change the digit inline if you want another. Want a fixed style instead? Tick `□ Link` and pick
  it in ▾ — that path already existed, so the rule stays single: *the preset's value when it declares the link,
  otherwise the default.* The button face previews the underline that will actually be written.
- **The limits follow the lean** — now that `∫` is slanted, the stacked upper limit sits ~1.5px further right and the
  lower one ~2.5px further left, matching where the head and the foot of the sign have moved. Measured in the
  script's own `ch`, not pixels, so it holds at any zoom.

### v4.0.296 (2026-08-20)
- **The target comes from the clipboard** — copy a URL, select the words, ⌥Option+Click, done. MeOS writes the
  target into the FC line for you and tells you what it wrote in the status bar. It only does this when the
  clipboard content is *verifiable*: an http(s) URL, or a membrane name that actually exists in this document
  (checked against the same name set the renderer uses). Anything else — prose, multiple lines, unbalanced
  brackets — is left alone and you get the empty `()` with the cursor waiting in it, exactly as before. Writing an
  unverified target would leave a dead link the writer never noticed, which is the worst way for this to break.

### v4.0.295 (2026-08-20)
- **Option is the button's other face — now a rule, not a one-off** — ⌥Option+Click on the highlight button adds a
  link this once, flipping the preset's `□ Link` without changing the preset. Beginners tick `□ Link` in the ▾ panel;
  once it is muscle memory, leave all three presets link-free and reach for Option instead. The button shows the
  underline *before* you press, so you always know which one you are getting.
- The Option watcher is now **one** shared piece (`fmtAltWatch`) used by both the highlight and the super/subscript
  buttons; each button only remembers whether the pointer is over it. Two watchers would eventually disagree about
  what the face is promising.

### v4.0.294 (2026-08-20)
- **Integrals lean — for real this time** — `font-style: italic` never moved the `∫`, and measuring said why:
  Menlo-Italic's integral is the *same glyph* as Menlo-Regular's (symbols are not slanted in an italic face), while
  `f` and `A` genuinely differ. Asking the font was the wrong move, so MeOS now slants it itself with `skewX(-12°)`
  about the glyph's centre — head to the right, foot to the left, matching where the two limits sit. `transform`
  changes no layout at all, so widths, columns and hit-testing are untouched.

### v4.0.293 (2026-08-20)
- **Integrals lean** — an `∫` that carries limits (either `∫↑(5)↓(0)` or the `👒` form) is now rendered
  slanted, the way maths is set. A bare `∫` in prose is untouched: the base character declares whether it is a
  formula. The stacked lower limit also shifts slightly left, since a slanted sign puts its foot to the left of its head.
- **The height follows the direction** — flip `↑` to `↓` in an FC line and the `{N%}` is rewritten to that
  direction's configured default. 150% ("top of the base character") and 50% ("on the baseline") are one-way words;
  carrying one across the flip always looked wrong.
- **Swap the limits with one arrow** — a big operator's two limits must point opposite ways. Make them match and the
  other one moves to the free slot, so fixing an upside-down `Σ` is a single-character edit.
- **🐱 finds headings that are not FC** — a heading whose spec still sits at the end of the line wraps, and a
  wrapped line breaks the membrane's vertical rule. The cat now marks those lines and moves the spec down to a folded
  FC line, leaving plain Markdown on the heading itself.

### v4.0.239 (2026-08-16)
- **Accents, with the recipe** — `a↑<(..)>` + superscript button → the real letter `ä`. Names draw the shape
  (`<(..)>` `<(.)>` `<(--)>` `<(^)>` `<(o)>` `<(v)>` `<(~)>` `<(')>`), and the recipe stays in the comment
  so you can redo it later. Prime `a↑'`, degree `x↑o`, negative exponents `10↑-3` remain ordinary superscripts.
- **Highlight rides on `***`** — the button now writes `***text***` + `***not (white/yellow)`. Inside MeOS a
  highlight, outside bold+italic. `==` is still read but no longer written; it was the last mark that leaked
  out of MeOS, because CommonMark and GFM have no highlight.
- **`not` across the family** — `*not` `**not` `***not` (and `↑not` as before): *do not let this mark claim its
  usual meaning*. Turns bold into plain without touching the text.
- Old-notation membrane names are Cmd+Click targets again (a trailing `.608` was mistaken for a file extension).
- Superscript instructions are written in **one edit** — the line-end comment never appears in the document,
  and one undo takes it back.
- 🚫 removes **only the instruction**; the characters you typed stay.

- **斜体は `*` で書く（v4.0.169）.** Markdownの `_斜体_` は**語中で閉じられない** —— CommonMarkの規則で、
  閉じの `_` の後ろが文字だと斜体にならない。日本語は助詞が続くので `_イタリック_の後に…` は
  **MeOSの外で `_` が字のまま見えていた**。`*` にその制限は無いので、これからは `*斜体*` と書く ——
  **MeOSの中でも外でも本物の斜体**。`_斜体_` はこれまでどおり読み続ける（**すでに書かれたものは救わない／そのまま描く**）。
  指定行では `<!-- Mew!FC * (白/黄) -->` と名乗る。
- **長いものは行の外へ出し、外へ出したものは畳む.** 行末のコメントは隠れていても**桁は食う**ので、
  指定を書くほど自分の文が次の画面行へ追い出される。so指定は**真下の行**へ出す —
  `<!-- Mew!FC … -->`。**FC = Folding Comment** で、MeOSは既定でその行を畳む。
  **カーソルを置けば開き、Rawなら全部開く。** 行番号が飛ぶのは、行が消えたからではなく畳まれているから —
  **飛んだ番号は、ファイルが手つかずである証拠**。
- **同期させるものが無い.** 命令が名乗るのは**種類**であって実物ではない —
  `A↑1(白/緑)` は「上付きが1つ」という意味で、`-1.` が「番号付きの項目」を意味するのと同じ。
  同じ種類が並んだら**出現順**で結ぶ。so**本文を書き換えても命令は壊れない**し、
  ファイルは**腐りうるラベルも番号も持たない**。2つめを指したい時だけ `A↑1#2(…)` と書く。
  どちらの形で書くかは **Me Dock の「Format ▼」→ `□ Folding Comment(FC) below`** の1つのチェックで決まる。
  チェックが決めるのは**これから書くもの**だけで、**すでに書かれたものはそのまま**。
  過去を救うのは🐱(旧記法→新記法の移行)の役目so、**移行の道は1本しか作らない**(v4.0.164)。
  指定行は**ただのテキスト**so、並べ替えや一部削除は**その行で直接**できる。
  指定行は**その行が持つもの全部**を受けられる —— 見出しも、上付きも、そして**文の途中にいる**
  ハイライトや取消線も。**1つの命令につき1つのコメント**なので、
  **箱の数がそのまま命令の数**になる —— `<!-- Mew!FC ~~(赤/) --><!-- Mew!FC ==(白/黄) -->`。
  **文の途中のものほど値打ちがある**。行末と違って、そこから後ろの文字が全部ずれるからだ。
  行き来はパレットの2つで自由 —— **外へ出す**／**行末に戻す**。並べ替えや一部削除をしたい時は
  一旦戻して、済んだらまた外へ出せばいい。**戻す方は自己検証つき**で、
  戻した結果をもう一度FC化して元と一致しなければ**実行しない**（行が壊れない）。
- **上付きが散文に不意打ちしない.** `x↑2` や `(a+b)↑2` は上付きになるが、`、↑2` や `🐱↑3` は**ただの字**のまま。
  上付きは「載る相手」があってのものだから。それでも上付きにしたければ、真下の行で名乗る —
  `<!-- Mew!FC A↑1(白/緑) -->`。
  逆に、本物の上付きの隣に**素の矢印**を置きたい時は **`not`** と言う —
  `<!-- Mew!FC A↑1(白/緑) ↑↓not -->` で「1つめは緑、2つめは素のまま」。順番に効くので番号は要らない。
  MeOSの他と同じ規則（**素はただの字・命令はコメントに書く**）なので、**エスケープ文字は要らない**。

### v4.0.110 → 4.0.123 — 階層番号・表の収まり・速度

- **番号付きリストの階層.** `-1.` = 第1階層、`-1.1` = 第2階層（数字）、`-1a` = 第2階層（英字＝「図1a・図1b」の形）。
  同じ階層の行には**常に同じ命令**を書く。数えるのは MeOS なので、番号はファイルのどこにも書かれず、腐らない。
  インデントも MeOS が描くので、生データは平らな `1. ` のまま。区切りは**空行だけ**（間に文が挟まってもリストは続く）。
- **命令に行頭マーカーを追従させる（v5.0へ見送り）.** コメントの `-1.` を `-` に書き換えたら行頭の `1. ` も直す、という自動書き換えは作ったが封印した。**編集イベントを受けて自分で編集する**仕掛けは、条件次第で編集のループになりうる（8/10の固着バグを追う過程で危険が見えた）。v5.0で真因から作り直す。
- **広い表をペインに収める（v5.0へ見送り）.** 収まらない表を列ごとに小さく描く機能は作ったが、**スクロールしただけで字が縮む**のは「整形はボタンを押した時だけ」という MeOS の約束に反するので封印した。
  そもそも縮めても折り返しは止められない（折り返しはモデルの桁数で決まり、装飾は描画にしか効かない）。v5.0で、テーブルボタンを押した時に効く形として作り直す。
- **速度（14万行の日記で計測）.** 膜の縦線を描く処理が全行×全膜の総当たりになっていたのを掃引に変え、
  可視範囲の外は作らないようにした（**747ms → 9ms**、生成する装飾 149,696個 → 301個）。
  あわせて 11MB の全文を1描画で何度も作り直していたのをやめ、文書の版ごとに1回だけに（GC が秒単位で止める原因）。
- **🐱 の取りこぼし修正.** Me Dock のボタンは押した瞬間フォーカスが webview に移るため、
  対象エディタを取り違えて何も起きないことがあった（変換・数え直し・印の消去）。
- **コードスパンを飲み込まない.** `- ` の直後にコードスパンがある箇条書きで、行頭マーカーの判定が
  コードスパンまで巻き込んで隠していたのを修正。

### v4.0 — Plain Markdown, plus a comment (記法の大転換)
- **Everything you write is real Markdown.** Headings, ordered/unordered lists, bold, italic, highlight,
  strikethrough and links are plain Markdown; MeOS keeps its colours, tips and instructions in an HTML
  comment at the **end of the line**. A MeOS document renders correctly with or without MeOS.
- **Warp anywhere.** `[label]()` plus `<!-- Mew! [](target) -->` turns any word into a jump — to a membrane
  by name, or to a URL. The destination never sits between your words, so the sentence keeps flowing.
  Markdown reference links (`[label][ref]`) are supported too, for long URLs.
- **Mew! 🐱 — a signature, and a way home.** Every MeOS comment starts with `Mew!`, so one `grep` finds them all.
  Old notation is marked with a cat in the gutter; **↻** shows the marks for five seconds, **🐱** converts what is
  on screen — one click, one undo. Nothing is ever converted behind your back.
- **Numbers that never rot.** Ordered lists are stored as `1.` on every line; MeOS numbers them on screen.
  Insert a line anywhere and the file does not change.
- **Membrane timestamps in full.** New membranes are named `name_YYYYMMDD<weekday>HHMMSS<TZ>` — sortable,
  grep-able, and honest about where you were when you wrote it.
- **GitHub token, watched.** The days left on your access token sit at the right edge of the GitHub push row —
  visible **even when the panel is folded**. MeOS warns before it runs out, and turns the disconnect button
  into a one-press fix when it expires.

## v3.1 era — highlights (2026-08 →)

### v3.1 — Spreadsheet totals without cell addresses (座標からの解放)
- **Table math with no cell addresses.** Sum and product by direction, not coordinates: `<!--Σ↑-->` sums the column above, `<!--Π←2-->` multiplies the two cells to the left. No `SUM`, no `B2:B4`. Insert a column and nothing breaks — the markers follow.
- **Calc membrane `Σ→…Σ←`.** Sum across a row by wrapping it between an opening wall and a result; the wall auto-excludes the row-number cell.
- **Function membrane / calculator.** Define `name(a,b) = expr` once in a membrane, then call it anywhere — in a table or in prose — as `<!--f(←1,←2)_TS-->`, with arrows for arguments instead of addresses. Your formulas become a personal library, in plain Markdown.
- **Auto / Manual calc modes.** Auto (default): totals update live on screen as you type, and are baked into the file on save (Cmd+S). Manual: totals show the last baked value and recompute on ▦ (Excel manual calc + F9). Either way, **changed cells flash green**, and **Re-calculate all** bakes every table in a membrane at once.
- **Numbers stay plain text.** The formula hides in an HTML comment; the result is plain text in the cell — readable on GitHub, in any Markdown preview, with `grep`. The cell count never changes: still valid GFM.
- **Vertical-merge row rules.** A thin row rule under every cell, dropped under merged cells, so a value spanning two rows reads as one — matching how `Σ` counts it once.
- **Merge membrane `→…←` / `↓…↑`.** Merge by wrapping the range between start/end markers — no count to write; it grows and shrinks as you insert rows or columns.
- Plus **MeTeX** superscript / subscript, **Me Dock zoom**, and a hardened **Octopush (🐙)** GitHub backup (loud, actionable errors when a token expires, and a token check the moment you arm it).

## v3.0 era — highlights (2026-07 →)

### v3.0 — Tables that never touch your data (Phase 3)
- **Cell merge, without touching the file.** GFM has no `colspan` / `rowspan`; MeOS adds them with one HTML comment — `<!--🤝→2-->` (merge right) / `<!--🤝↓2-->` (merge down). The cell count never changes, so the file stays valid GFM and the marker is **invisible on GitHub and every Markdown preview**. MeOS shows the merge in the **main editor** — not a preview pane. Put the cursor on the row and the raw marker reappears for inline editing.
- **Format Table, CJK & emoji aware.** One press of the ▦ button aligns the columns. MeOS knows the editor's default font draws a full-width character at ~1.67× the ASCII width (not 2×) and pads with a carry method, so Japanese tables actually line up; `laiMembrane.tableCjkWidth = 2` gives a pixel-perfect grid on a duospaced font.
- **Cell navigation** (Tab / ⌘→ / ⌘← / ↑ ↓), **duplicate & delete row / column** (merge-aware), and a **table membrane** to wrap a long table so Current Me can jump to its tail.

### v3.0.3–3.0.4 — Wrapping a table is your call now
- **A table never wraps itself in a membrane.** The old rule ("tables of 8+ rows wrap automatically on format") is gone — no more membrane comments appearing around a table you only wanted aligned.
- **One checkable menu item instead of two.** The ▾ menu shows **✓ Membrane this table**: a green check when the table the cursor is in is wrapped, empty when it isn't. Click to toggle wrap ⇄ unwrap.
- Opening the ▾ menu no longer leaves a tooltip covering it.

### v3.0.1–3.0.2 — Sharper column alignment
- **CJK columns line up tighter.** Padding is computed from each row's running position instead of rounding every cell on its own, so the drift that used to build up toward the right edge is gone. Set `laiMembrane.tableCjkWidth = 2` for a perfectly even grid in a fixed-width font.
- **A merged cell's overflow is shared across the columns it spans**, so no single column balloons while its neighbours stay narrow.

### v3.0.0 — Tables (phased release · Phase 3)
- **Markdown tables you can actually work in.** The grid button in Me Dock formats the table under your cursor; **Tab / Shift+Tab** and **↑ / ↓** walk cell to cell instead of dropping you into raw pipes.
- **Merged cells that survive as plain Markdown.** A merge is recorded in a comment, so the file stays valid GFM everywhere else — the merge is drawn in the editor, never baked into the text.
- **Duplicate or delete a whole row or column** in one command, merges included.
- Third of the weekly phased-release unlocks: everything ships in one build, and each week opens one more feature at the door.

## v2.0 era — highlights (2026-07 →)

_Curated, user-facing highlights. Exhaustive per-version notes live in the source header._

### v2.0.73 — The diary title rule, made visible
- **Say how your entries are named, and watch the rule work.** The Ⓝ panel takes a template — `W` a weekday letter (S-M-T-W-t-F-s), `MM` / `DD` exactly two zero-padded digits, `M` / `D` one or two, and a trailing **`?`** to make *just the element before it* optional (`✴️?` the mark may be missing, `W?` the weekday may be missing).
- **Brackets are literal.** `(W)` means a weekday *in brackets*, as in `7/20(M)` — the way dates are actually written, and the way MeOS writes its own heading timestamps.
- **The panel counts what your rule really finds** — this month (exactly what Ⓣday will list) and in the whole file — *before* you save it. Tighten a rule and watch the number: the drop is how many entries break your own convention, which makes it the fastest way to find your own typos.

### v2.0.60–63 — One button, one job
- **🔓 rides on 🔐's shoulder** — the unlock badge lights blue only on an encrypted membrane.
- **EOF folded into TOP** as a circled **E** on its hip: the circle is the O of EOF, E is for End, and it sits low because that is where the end of a file is.

### v2.0.46 — Pasted folds stay folded
- Copy a folded membrane, paste it, and it stays folded — the fold state travels in the text (the `⊖` in the badge), not in the editor.

### v2.0 — Lifelong Diary · the [Ⓣ|Ⓣday] gate (Hyper IDX)
- **One button drives a whole-life diary kept in a single Markdown file.** Left **Ⓣ** jumps straight back to today's entry — landing on the exact line you were last writing. Right **Ⓣday** is the dial: **↻** cycles the scope **Day → Week → Month → Year**, and each scope's sub-menu lists the matching entries, so you pick a date by scrolling alone without moving the pointer.
- **Double-click Ⓣday for one polymorphic input**: type `6/4` to make that date the base point, type words to search membrane names and comments (space-separated AND), or `T` to return to today. Zero matches simply reopens the field with a hint — never a dead end.
- **Year scope is the ten-year diary, without its straitjacket.** Entries are found by **name**, not by position, so the membrane structure stays entirely yours — nested, flat, or scattered, with years left blank if you like. Structure lives in comments, so the prose itself is never touched.

### v2.0.0 — Hyper TOC sub-menu (phased release · Phase 2)
- **Right-click any Hyper TOC item to fly out its child membranes** — one level down (e.g. a lifelong diary's month → its days). The list opens centered on your cursor; move with **↑ / ↓**, confirm with **Enter**, dismiss with **Esc**, or click to jump.
- Second of the weekly phased-release unlocks: everything ships in one build, and each week opens one more feature at the door.

## v1.0 era — highlights (2026-06 → 2026-07)

_Curated, user-facing highlights. Exhaustive per-version notes live in the source header._

### v1.0.20–1.0.30 — Action badges on the three bookmarks
- **F / H shoulder badges** on the Bookmark / Reference / Home buttons: one click makes the cursor line the Front (**F**) — or, for Home, the single ribbon (**H**). No menu needed.
- Every "return spot" now shows its **jump destination as a one-line, colored tooltip**: Reference in blue with the mark's position (e.g. `¶6`), Bookmark in red, Home in green.
- Fix: highlights could occasionally stop rendering until a restart (the refresh gate could get stuck); it now self-heals.

### v1.0.0 — Reference Groups (phased release)
- **Reference groups**: named, grep-able in-text anchors. One click warps to the group's Front mark; click again to cycle every mark. Each group remembers its own Front, so switching groups returns you to that draft's last spot.
- **Marks / Annotated / Pending.** Annotated marks carry a footnote; ⌘/Ctrl-click jumps to the note (Annotated) or straight to the Front (Marks / Pending).
- Marks are stored as **HTML comments** — invisible in GitHub and Markdown preview, so your text stays clean.
- Pick from 7 preset symbols (`※ † ‡ ∗ § ‖ ¶`) plus 2 custom.

### v0.9.999 — Markdown tables
- **Format Table** (CJK & emoji width aware), **cell navigation** (Tab / Cmd+arrows), **cell merge** (stored as invisible comments so the GFM table stays valid), and **row / column duplicate & delete**.

### v0.9.999147 — Format ring
- ↻ toggles and cycles highlight / strikethrough / heading presets with just the cursor inside the decoration.

### v0.9.999123 — Reference Membranes, the Three Bookmark Treasures & the Aiming Menu
- 🏠 Home (one ribbon per file), 🔖 Bookmarks (up to 3), and reference marks — each with a Front you can jump to.

### v0.9.99957 — Done-checkbox
- Any heading / highlight / list item can become a searchable checklist item.

### v0.9.99940 — Format three-brothers
- ↻ color palette for highlight / strike / heading, with per-file color memory.

### v0.9.99935 — Navigate Me minimap scrollbar

### v0.9.99922 — ⌘/Ctrl-click to warp in the Hyper TOC

### v0.9.99921 — 🔐 Encrypt Me
- Encrypt a membrane's contents in place.

### v0.9.986–0.9.988 — 🐙 Octopush
- One-shot, git-aware GitHub backup / sync.

### v0.9.971 — Membrane OS · Markdown⊕
- Rebrand to **MeOS** (Membrane OS).

## Original Notes

# VSCodiuM - Fold Membrane v0.9.312

- mSTATS ver0 sync retained from v0.9.99.
- Added editor title/context command: Fold Membrane: Add Membrane.
- Open/close/Enter handling fixes retained from v0.9.225.
- Membrane logo ver12 integrated: yellow ▼/▲ marker alignment with the yellow code-core layer.

## v0.9.228 Menu Cleanup

The editor context menu is now consolidated under **MeOS - Membrane**.

Top MeOS actions:

1. Control Me!
2. New Me / Rename Me
3. Delete Me (excluding Contents)
4. Copy Me
5. Copy My contents


## v0.9.229 Me Dock Prototype

Added **Me Dock On/Off** to the **MeOS - Membrane** context submenu.

The first prototype opens a shape-only **Me Dock** panel:

- A ∨
- New Me ∨
- Add to Hyper TOC
- Toggle Me ∨


## v0.9.230 Open Me Dock Menu

Renamed the context menu item to **Open Me Dock >** so it reads as a dock/panel opener rather than a simple toggle command.


## v0.9.231 Open Me Dock Submenu

Changed **Open Me Dock** into a real submenu so VSCodium renders the arrow at the right edge.

- Open Me Dock >
  - Show / Hide Me Dock


## v0.9.232 Open Me Dock…

Changed **Open Me Dock >** back to a direct command named **Open Me Dock…**.

The ellipsis indicates that a separate Me Dock panel opens.


## v0.9.233 Me Dock New Me Dropdown

Implemented the first active Me Dock split button:

- **New Me ∨**
- Select **Rename Me** from ∨ to change the parent label
- Left side runs the currently selected action

`New Me` is wired to the existing Add Membrane routine. `Rename Me` is a UI-ready placeholder for the next implementation step.


## v0.9.235 Rename Me Fix

Rebased on the working v0.9.233 Me Dock implementation and safely added **Rename Me**.

- `Open Me Dock…` works again.
- `Rename Me` updates start/end membrane names together.
- Rename range detection supports `mCN=`, `CN=`, `H1=`, `H2=`, `H3=` without changing the core parser.


## v0.9.236 New Me Guard

Fixed a New Me insertion bug.

- If the cursor is inside an existing membrane name, **New Me** is blocked.
- A warning appears: use **Rename Me** instead.
- This protects membrane names as structural IDs.


## v0.9.237 New / Rename Me One Button

Changed Me Dock from the selector-style **New Me ∨ / Rename Me ∨** to one safer button:

- **New / Rename Me…**

Behavior:

- Cursor inside a membrane name → **Rename Me**
- Cursor elsewhere → **New Me**

The InputBox title confirms whether the operation is New or Rename before execution.


## v0.9.238 New / Rename Color Cue

Added visual color cues in Me Dock:

- **New** = red
- **Rename** = blue

Note: native VSCode/VSCodium context menu labels cannot be partially colored by extension API, so the color cue is applied inside Me Dock.


## v0.9.239 Crux Statement Update

Inserted the finalized Membrane notation core statement into the extension description and README.

## v0.9.240 Crux Structure Update

Updated the crux statement to include the core idea: **comments create structure**.

## v0.9.241 Semantic Metadata Crux Update

Updated the crux statement to: **comments (semantic metadata) create structure**.

## v0.9.242 Inline New/Rename Me Panel

Me Dock now switches **New Me… / Rename Me…** by cursor position and opens the input directly under the button.

## v0.9.243 Inline New/Rename Fix

Fixed inline Me Dock New/Rename:

- `Open Me Dock…` works when the cursor is outside membranes.
- `Set` keeps the target editor and applies Rename/New even after Webview focus moves.


## v0.9.244 IME-safe Set

Inline New/Rename Me input is now IME-safe:

- Enter no longer triggers Set.
- Set is click-only to avoid accidental execution during Japanese kana-kanji conversion.
- Escape still closes the inline input panel.

## v0.9.245 Always-visible New/Rename Input

Me Dock now always shows the New/Rename input box.

- Removed the extra New/Rename Me button.
- The title automatically switches between **New Me** and **Rename Me** by cursor position.
- Set remains click-only for IME safety.
- Reset restores the context-derived name.

## v0.9.246 Input Border and Timestamp Refresh

Me Dock improvements:

- Input border remains visible while editing the document.
- Added **↻** timestamp refresh button for **New Me**.
- The refresh button is hidden in **Rename Me** mode.

## v0.9.247 Rename Timestamp Refresh

The **↻** button is now available in Rename Me mode too.

- New Me: refreshes the whole default membrane name.
- Rename Me: preserves the name body and replaces/appends the trailing timestamp.

## v0.9.248 Refresh Button Fix

Fixed the **↻** timestamp refresh button.

- Refresh now updates the input even while the input is focused.
- New Me refreshes the whole default membrane name.
- Rename Me preserves the body and refreshes/appends the trailing timestamp.

## v0.9.249 Timestamp Replace Fix

Fixed Rename Me timestamp refresh duplication.

- Existing trailing timestamp forms are removed before adding the new timestamp.
- Supports `_HHMMSS.MDD` and `_HHMMSS_MDD` style suffixes.

## v0.9.250 Tooltip Polish

- Updated ↻ button hover text to: `Time Stamp`

## v0.9.251 Rename Whole Membrane Line

Me Dock now treats the whole membrane line as a Rename target.

- Cursor on the left side of ▼/▲ → Rename Me
- Cursor inside membrane name → Rename Me
- Cursor outside membrane lines → New Me

## v0.9.252 Precise Membrane Line Rename

Fixed over-relaxed Rename detection.

- Cursor on a physical line containing a real ▼/▲ membrane marker → Rename Me
- Cursor on the left side of ▼/▲ on that same line → Rename Me
- Cursor on non-membrane lines → New Me

## v0.9.253 Me Dock Current Line Marker

When Me Dock is open, the target editor line is highlighted so the left-pane context remains visible while operating right-pane controls.

## v0.9.254 Visible Current Line Marker

Made the Me Dock target line marker visibly stronger.

- Gold whole-line background
- Gold line border
- Left-side `▶` marker
- Right overview-ruler mark

## v0.9.255 Line Button Marker Toggle

Me Dock layout now puts the membrane name first and line number second.

- `Line` button toggles the right-side `⇦` marker.
- Removed full-line gold highlight/border.
- Line number is displayed in a separate input field.
- Set/Reset returns focus to the target editor.

## v0.9.256 Right Marker and Line Jump

- Moved marker from left-side `➡` to right-side `⇦` to avoid shifting membrane lines.
- Enter in the Line box jumps to the specified line.
- Set also honors the Line box before running New/Rename.

## v0.9.257 Live Line Jump

- Line input now live-jumps when its value changes.
- Enter in Line jumps but keeps focus in Me Dock for continuous navigation.
- Only Set returns focus to the editor.
- Reset restores panel values without stealing focus.

## v0.9.258 Set Same-Line Stability

- Set no longer re-jumps when the Line box already points to the current line.
- Set returns focus to the intended target line after New/Rename.
- Live Line edits no longer warn while the input is temporarily empty.

## v0.9.259 Jump Select Full Name

- Start/end membrane jump no longer depends on double-click word selection.
- The membrane name is parsed from the whole line.
- Jump operations select the full membrane name, making copy easier.

## v0.9.260 Actual W-click Jump Fix

- Patched the actual W-click jump route: `tryActivateSelectedNameJump`.
- Jump now parses the whole membrane line instead of relying on selected word text.
- W-click on any part of a membrane line selects the full membrane name and jumps to the paired membrane.

## v0.9.261 Per-file Line History

- Added per-file Line history for Me Dock.
- Added `←` and `→` buttons beside Line.
- Line jumps and W-click membrane jumps are stored by document URI.
- Switching files preserves each file's navigation stack during the session.

## v0.9.262 Cmd+G Line History

- Added `Cmd+G` = Line History Forward (Mac)
- Added `Shift+Cmd+G` = Line History Back (Mac)
- Works directly from the editor pane using Me Dock history instead of default Go to Line.

## v0.9.263 Right Pane Cmd+G

- Added `Cmd+G` / `Shift+Cmd+G` inside Me Dock (right pane)
- Right pane now controls Line History directly without search panel conflicts
- Works while typing in Me Dock inputs

## v0.9.264 Right Pane Cmd+G Blur

- `Cmd+G` / `Shift+Cmd+G` inside Me Dock now exits input mode first
- Line input value updates correctly after history navigation
- Navigation takes priority over editing when the shortcut is pressed

## v0.9.265 Insert-style Line History

Changed Me Dock Line History from browser-style truncation to insertion-style history.

Example:

```text
A → B → C
Back to B
Jump to D
Result: A → B → D → C
```

Forward history is preserved instead of being destroyed.
