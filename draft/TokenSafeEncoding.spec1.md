# Token-Safe Unicode Encoding

## Goal

Implement a **lossless, reversible, token-safe Unicode encoding** for arbitrary strings.

The purpose is to replace only ASCII characters that can interfere with HTML, CSS, or JavaScript parsing.

All other Unicode characters are valid and should remain unchanged whenever possible.

The encoded result must never contain any banned ASCII token characters or any form of whitespace.

## Allowed Characters

The encoded output may contain:

* Unicode alphabetic characters from any language.
* Unicode numeric characters from any language.
* Unicode symbols and punctuation from any language.
* Any other Unicode character that does not belong to the explicitly banned ASCII token set.

There is **no requirement for ASCII-only output** and no requirement for Base62/Base64/Base32.

For example, characters such as these are valid output characters:

```text
世界
বাংলা
Ж
Ω
١
９
§
→
Ж
```

## Banned Characters

Every form of whitespace is banned, including:

```text
space
tab
newline
carriage return
vertical tab
form feed
non-breaking space
Unicode whitespace
```

The encoder must also replace ASCII syntax characters that can participate in HTML, CSS, or JavaScript lexical syntax.

At minimum, reserve:

```text
{ } ( ) [ ] < > " ' ` : ; / \ % $ # @ = ! & | ? * + - , .
```

The implementation should define the exact ASCII reserved set explicitly rather than attempting to infer it dynamically.

The important rule is:

```text
encoded output MUST NOT contain a reserved ASCII token character.
encoded output MUST NOT contain whitespace.
```

Characters from other Unicode ranges are allowed, including Unicode punctuation and symbols.

## Unicode Preservation

A character that is not banned should remain unchanged.

For example:

```text
encode("Hello 世界 বাংলা") 
```

should preserve those characters.

Do not transliterate, normalize, ASCII-fold, lowercase, uppercase, or otherwise modify safe Unicode characters.

The encoding must operate on Unicode code points rather than assuming ASCII input.

## Reversibility

The encoding is lossless.

For every supported string:

```ts
decode(encode(value)) === value
```

must always be true.

The encoded representation must contain enough information to reconstruct the exact original string.

No external state may be required.

The decoder must not depend on:

```text
lookup tables
database records
runtime registries
session state
application state
network state
```

The encoded string must be self-contained.

## Length Constraint

This is a strict requirement:

```text
encode(value).length <= value.length
```

must hold for every supported input.

The encoder must never produce a longer string.

Do not use:

```text
%XX
\uXXXX
HTML entities
Base64
Base32
Base62
hexadecimal
escape sequences
multi-character replacement sequences
```

when they increase the resulting string length.

A banned input character should ideally become exactly one safe Unicode code point.

For example:

```text
":" -> one safe Unicode code point
"{" -> one safe Unicode code point
" " -> one safe Unicode code point
```

## No Lookup Table

The mapping should be algorithmic.

Do not create a large mapping such as:

```ts
{
  ":": "some-character",
  "{": "some-character",
  ...
}
```

The mapping should be derivable directly from the character/code point.

The implementation should preferably use a simple mathematical transformation or similarly small deterministic rule.

## Critical Collision Requirement

The encoding must distinguish an originally safe Unicode character from an encoded replacement character.

For example, this is invalid:

```text
":" -> "Ж"
```

if the original string is allowed to contain `"Ж"` unchanged, because:

```text
encode("Ж") === "Ж"
encode(":") === "Ж"
```

would make decoding ambiguous.

Therefore the encoding scheme must provide a deterministic way to distinguish:

```text
original Unicode character
```

from:

```text
encoded reserved character
```

without external state.

## Implementation Size

Keep the implementation extremely small.

Target:

```text
one encode function
one decode function
approximately 20–30 lines total
```

No classes.

No framework.

No configuration system.

No parser.

No AST.

No registry.

No dependency unless absolutely necessary.

The code should be readable by a human immediately.

## Important Mathematical Constraint

The implementation must not pretend that the complete requirements are simultaneously achievable if they are not.

The required transformation is effectively:

```text
arbitrary Unicode input
        ↓
same-length reversible transformation
        ↓
Unicode minus reserved ASCII characters and whitespace
```

Because the input domain contains every Unicode code point, including every possible output replacement character, a self-describing one-code-point substitution can create collisions unless the entire Unicode domain is transformed or additional information is encoded.

Therefore, before implementation, determine whether the complete requirement:

```text
arbitrary Unicode input
+
unchanged safe characters
+
self-describing
+
lossless
+
no lookup table
+
output only non-banned characters
+
encoded.length <= input.length for every input
```

is mathematically possible.

Do not relax any requirement silently.

If the exact requirements are impossible for arbitrary Unicode input, clearly identify the specific contradiction and implement only a provably valid subset rather than introducing hidden state, collisions, truncation, or data loss.

## Desired API

```ts
function encode(value: string): string
function decode(value: string): string
```

Nothing more is required.
