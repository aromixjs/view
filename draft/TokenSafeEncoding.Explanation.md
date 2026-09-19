# Token Safe Unicode Encoding Explanation


## 1. What the problem actually asks for

Take any string and produce a version that:

- contains **no** HTML/CSS/JS-meaningful ASCII characters (`{ } ( ) [ ] < > " ' \` : ; / \ % $ # @ = ! & | ? * + - , .`)
- contains **no** whitespace of any kind
- leaves every *other* character (letters, digits, emoji, CJK, etc.) **byte-for-byte identical**
- is **fully reversible** — `decode(encode(x)) === x`
- is **self-contained** — no external table, no session state
- is **never longer** than the input

That last requirement — safe characters pass through *unchanged* — is the one that shapes everything else.

## 2. Why some characters have to be sacrificed

Split all of Unicode into two buckets:

- `R` = the ~54 banned characters (29 reserved ASCII symbols + 25 official Unicode whitespace characters)
- `S` = everything else ("safe" characters)

The spec requires `encode` to be the **identity function on `S`** — every safe character maps to itself. That's already a complete, self-contained bijection from `S` onto `S`; nothing is left over.

Now try to encode a banned character `r ∈ R`. Its encoded form has to be *some* character `s ∈ S` (output must only contain safe characters). But `s` is already spoken for — it's the identity-encoding of the literal character `s`. So the string `"s"` and the string containing `r` both encode to the same output. `decode` cannot tell them apart.

This isn't a design flaw to engineer around — it's a straightforward pigeonhole argument. **Any** scheme (lookup table, arithmetic formula, state machine, marker byte) that (a) leaves safe characters untouched and (b) only emits safe characters, runs into exactly this collision, for *some* input, unless something is explicitly carved out.

So the honest options are:
1. Shrink the input domain slightly (declare a small set of code points off-limits for literal input), or
2. Let output length grow when escaping happens (a marker character can't double as its own payload, so it costs an extra code point — see the companion `-sentinel.ts` file for what that looks like), or
3. Stop leaving safe characters unchanged (ruled out — the spec requires it).

This implementation takes option 1, because the spec calls the length bound a *strict* requirement and only asks for domain restriction to be handled "explicitly, not silently."

## 3. The chosen carve-out: Private Use Area

Unicode reserves the block `U+E000`–`U+F8FF` (6,400 code points) as the **Private Use Area (PUA)** — by design, the Unicode Consortium assigns *no meaning* to these code points. They exist specifically so private systems can define their own local conventions. No font is required to render them, no normal document is expected to contain them, and no public standard assigns them semantics.

The algorithm reserves just the **first 54 of those 6,400 code points** — `U+E000` through `U+E035` — one per banned character:

```
index 0  → "{"        → U+E000
index 1  → "}"        → U+E001
index 2  → "("        → U+E002
...
index 28 → "."        → U+E01C
index 29 → "\t"        → U+E01D
...
index 53 → "\u3000"   → U+E035
```

The mapping is `PUA_BASE + index_in_the_reserved_list` — pure arithmetic, driven off one small, explicit, hand-written array (which the spec itself asked for: "define the exact ASCII reserved set explicitly rather than attempting to infer it dynamically").

## 4. The algorithm

**encode(value):**
```
for each Unicode code point ch in value:
    if ch's code point is inside U+E000..U+E035:
        throw — input isn't in the supported domain
    if ch is in the 54-character RESERVED list:
        emit the single PUA character at (U+E000 + index of ch in RESERVED)
    else:
        emit ch unchanged
```

**decode(value):**
```
for each Unicode code point ch in value:
    if ch's code point is inside U+E000..U+E035:
        emit RESERVED[ch's code point − U+E000]
    else:
        emit ch unchanged
```

Both directions are a single pass, O(n), no recursion, no external state — everything needed to invert the transform is recoverable from the character values themselves.

## 5. Worked example

Input: `{"data":123,"datas":"sta> :[]"}` (31 characters)

| original char | banned? | encoded as |
|---|---|---|
| `{` | yes | `U+E000` |
| `"` | yes | `U+E006` |
| `d`,`a`,`t`,`a` | no | unchanged |
| `:` | yes | `U+E00B` |
| `1`,`2`,`3` | no | unchanged |
| `,` | yes | `U+E01B` |
| ... | ... | ... |
| `}` | yes | `U+E001` |

Every banned character becomes **exactly one** PUA character. Nothing is inserted, nothing is duplicated. Result: still 31 code points, and `decode` maps each PUA character straight back to its original symbol.

## 6. "It looks unrenderable — is that actually working?"

Yes, and it's expected, for two separate reasons:

**First — that's the point.** The original goal wasn't "produce something a person can read," it was "produce something that can't be misread as HTML/CSS/JS syntax." A blank-looking PUA character is *maximally* safe by that standard: browsers, parsers, and interpreters have no syntactic rule attached to it. There's nothing for it to accidentally close, open, escape, or inject.

**Second — "unrenderable" only means "no font has a glyph for it," not "invalid" or "lossy."** A Private Use Area code point is just as real and just as storable as any other Unicode code point — it round-trips through JSON, UTF-8, databases, and network transport exactly like `A` or `€` would. A terminal or editor prints a blank, a box, or nothing at all for it purely because no font author has drawn a picture for a code point the standard deliberately left undefined — the same way `\u200B` (zero-width space) or an unassigned code point in general prints as nothing. The *data* is fully intact; only its *visual representation* is absent. That's confirmed by the round-trip test: `decode(encode(x)) === x` held exactly on your input.

If you need the encoded form to also be visually inspectable (e.g. eyeballing it in a terminal while debugging), that's a different, additional requirement than what the original spec asked for — the spec asked for parser-safety and losslessness, not human-legibility of the intermediate form. That could be layered on separately (e.g. a debug-only pretty-printer that shows `⟦U+E00B⟧` for each PUA character) without touching the core encode/decode contract.

## 7. Guarantees, stated precisely

| Property | Holds? | Scope |
|---|---|---|
| `decode(encode(x)) === x` | ✅ | for any `x` not containing `U+E000`–`U+E035` |
| `encode(x).length === x.length` | ✅ | always, for every supported `x` |
| Safe characters unchanged | ✅ | always |
| Output contains no reserved ASCII or whitespace | ✅ | always |
| No lookup table / external state | ✅ | one small explicit array + arithmetic offset |
| Works for literally all of Unicode | ❌ | excludes 54 specific PUA code points, by necessity (§2) |

That last row is the one honest limitation, and `encode` enforces it with a thrown error rather than silently corrupting data if it's ever violated.
