# BibTeX JS Parser

A very simple BibTeX parser written in javascript.

The parser focuses only on syntax parsing and doesn't care whether the `Entry Type` or field names make sense. The parser expects the input to be already trimmed thus the first character should always be `@`. It can be used by calling either:

``` BibTeXParser.parse(input)```

or: 

```BibTeXParser.strictParse(input)```

the difference between the two is that the latter will throw an error if it finds trailing characters after the closing bracket meanwhile the former will silently ignore them.

For example, in the following entry:
```
@article{citekey, 
    key1 = "value1",
    key2 = {value2},
    key3 = 123
} gggg
```
the strict version will complain about the presence of `gggg` while the other will ignore them. (Note that this also applies if trailing characters are all spaces).

The parser is deliberately permissive with regard to accepted characters, the expected syntax is the following:

```
@<entryType>{<citeKey>[,<sp><key><sp><eq><sp><val><sp>]^N}

<val> := <number> | {<any>} | "<any>"


Accepted Charsets:

entryType:  a-zA-Z0-9
citeKey:    a-zA-Z0-9*+-./:;<=>?@[]^_`
sp:         any whitespace
key:        a-zA-Z
number:     0-9.
any:        any character

```