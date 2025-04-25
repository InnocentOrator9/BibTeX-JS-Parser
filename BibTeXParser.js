"use strict";

const BibTeXParser = (() => {

    // Constants definitions
    const _TKN_COMMA = ",";
    const _TKN_DQUOTE = '"';
    const _TKN_AT = "@";
    const _TKN_CURLY_OPEN = "{";
    const _TKN_CURLY_CLSD = "}";
    const _TKN_EQUAL = "=";
    const _TKN_BACKSLASH = "\\";
    const _TKN_DOT = ".";

    function parse(input) {
        return _parse(input, false);
    }

    function strictParse(input) {
        return _parse(input, true);
    }

    function _parse(input, strict) {

        let state = 0;
        let parsedBib = {};
        let tempKey = "";
        let tempValueStart = undefined;
        let bracketCounter = 0;

        for (let i = 0; i < input.length; i++) {

            switch (state) {
                case 0:
                    if (input[i] !== _TKN_AT) {
                        throw Error(`Expected '${_TKN_AT}' at index ${i} instead found: '${input[i]}'`);
                    }

                    state = 1;

                    break;

                case 1:
                    let entryStart = i;

                    while (isAlphanumeric(input.charCodeAt(i))) i++;

                    if (input[i] !== _TKN_CURLY_OPEN) {
                        throw Error(`Expected '${_TKN_CURLY_OPEN}' at index ${i} instead found: '${input[i]}'`);
                    }

                    parsedBib["entryType"] = input.substring(entryStart, i).toLowerCase();

                    state = 2;

                    break;

                case 2:
                    let codeStart = i;

                    while (isAlphanumericExtended(input.charCodeAt(i))) i++;

                    parsedBib["citeKey"] = input.substring(codeStart, i);

                    if (input[i] !== _TKN_COMMA && input[i] !== _TKN_CURLY_CLSD) {
                        throw Error(`Expected '${_TKN_CURLY_CLSD}' or '${_TKN_COMMA}' at index ${i} instead found: '${input[i]}'`);
                    }

                    if (input[i] === _TKN_COMMA) {
                        state = 3;
                    }
                    else {
                        state = 13;
                    }

                    break;

                case 3:
                    if (!isWhitespace(input[i])) {
                        if (!isAlpha(input.charCodeAt(i))) {
                            throw Error(`Expected a character [a-zA-Z] at index ${i} instead found: '${input[i]}'`);
                        }

                        state = 4;
                    }
                    break;

                case 4:

                    let keyStart = i - 1;

                    while (isAlpha(input.charCodeAt(i))) i++;

                    tempKey = input.substring(keyStart, i).toLowerCase();

                    if (isWhitespace(input[i])) {
                        state = 5;
                    }
                    else {

                        if (input[i] !== _TKN_EQUAL) {
                            throw Error(`Expected '${_TKN_EQUAL}' at index ${i} instead found: '${input[i]}'`);
                        }

                        state = 6;
                    }

                    break;

                case 5:

                    if (!isWhitespace(input[i])) {
                        if (input[i] !== _TKN_EQUAL) {
                            throw Error(`Expected '${_TKN_EQUAL}' at index ${i} instead found: '${input[i]}'`);
                        }

                        state = 6;
                    }

                    break;

                case 6:

                    if (!isWhitespace(input[i])) {
                        if (input[i] !== _TKN_DQUOTE && input[i] !== _TKN_CURLY_OPEN && !isNumeric(input.charCodeAt(i))) {
                            throw Error(`Expected Number literal [0-9] or Double Quotes ["] or Open Curly Bracket [{] at index ${i} instead found: '${input[i]}'`);
                        }

                        tempValueStart = i;

                        if (input[i] === _TKN_DQUOTE) {
                            state = 10;
                        }
                        else if (input[i] === _TKN_CURLY_OPEN) {
                            bracketCounter = 1;
                            state = 12;
                        }
                        else {
                            state = 7;
                        }
                    }

                    break;

                case 7:

                    while (isNumeric(input.charCodeAt(i))) i++;

                    if (input[i] === _TKN_DOT) {
                        state = 8;
                    }
                    else {

                        parsedBib[tempKey] = input.substring(tempValueStart, i);

                        if (input[i] !== _TKN_COMMA && input[i] !== _TKN_CURLY_CLSD && !isWhitespace(input[i])) {
                            throw Error(`Expected '${_TKN_CURLY_CLSD}' or '${_TKN_COMMA}' or a whitespace at index ${i} instead found: '${input[i]}'`);
                        }

                        if (input[i] === _TKN_COMMA) {
                            state = 3;
                        }
                        else if (input[i] === _TKN_CURLY_CLSD) {
                            state = 13;
                        }
                        else {
                            state = 9;
                        }
                    }

                    break;
                case 8:

                    while (isNumeric(input.charCodeAt(i))) i++;

                    parsedBib[tempKey] = input.substring(tempValueStart, i);

                    if (input[i] !== _TKN_COMMA && input[i] !== _TKN_CURLY_CLSD && !isWhitespace(input[i])) {
                        throw Error(`Expected '${_TKN_CURLY_CLSD}' or '${_TKN_COMMA}' or a whitespace at index ${i} instead found: '${input[i]}'`);
                    }

                    if (input[i] === _TKN_COMMA) {
                        state = 3;
                    }
                    else if (input[i] === _TKN_CURLY_CLSD) {
                        state = 13;
                    }
                    else {
                        state = 9;
                    }

                    break;
                case 9:

                    if (!isWhitespace(input[i])) {
                        if (input[i] !== _TKN_COMMA && input[i] !== _TKN_CURLY_CLSD) {
                            throw Error(`Expected '${_TKN_CURLY_CLSD}' or '${_TKN_COMMA}' at index ${i} instead found:\t${input[i]}`);
                        }

                        if (input[i] === _TKN_COMMA) {
                            state = 3;
                        }
                        else {
                            state = 13;
                        }
                    }

                    break;

                case 10:
                    if (input[i] === _TKN_DQUOTE && input[i - 1] !== _TKN_BACKSLASH) {

                        if (i - tempValueStart <= 1) {
                            parsedBib[tempKey] = "";
                        }
                        else {
                            parsedBib[tempKey] = input.substring(tempValueStart + 1, i);
                        }

                        state = 11;
                    }

                    break;

                case 11:
                    if (input[i] === _TKN_CURLY_CLSD) {
                        state = 13;
                    }
                    else if (input[i] === _TKN_COMMA) {
                        state = 3;
                    }
                    else if (isWhitespace(input[i])) {
                        state = 9;
                    }
                    else {
                        throw Error(`Expected '${_TKN_CURLY_CLSD}' or '${_TKN_COMMA}' or a whitespace at index ${i} instead found: '${input[i]}'`);
                    }

                    break;

                case 12:
                    if (input[i] === _TKN_CURLY_OPEN) {
                        bracketCounter++;
                    }
                    else if (input[i] === _TKN_CURLY_CLSD) {
                        bracketCounter--;

                        if (bracketCounter <= 0) {

                            if (i - tempValueStart <= 1) {
                                parsedBib[tempKey] = "";
                            }
                            else {
                                parsedBib[tempKey] = input.substring(tempValueStart + 1, i);
                            }

                            state = 11;
                        }
                    }

                    break;

                case 13:

                    if (strict) {
                        throw Error(`Trailing content after valid block. Expected end of input after '${_TKN_CURLY_CLSD}', but found: '${input.substring(i)}'`);
                    }

                    break;
            }
        }

        switch (state) {

            case 10:
                throw Error(`Missing closing '${_TKN_DQUOTE}' for value of key '${tempKey}'`);

            case 11:
            case 12:
                throw Error(`Missing closing '${_TKN_CURLY_CLSD}' for value of key '${tempKey}'`);

            case 13:
                return parsedBib;
        }

    };

    function isNumeric(charCode) {
        return (charCode >= 48 && charCode <= 57);
    };

    function isAlpha(charCode) {
        return (charCode >= 65 && charCode <= 90) ||
            (charCode >= 97 && charCode <= 122)
    };

    function isAlphanumeric(charCode) {
        return (charCode >= 65 && charCode <= 90) ||
            (charCode >= 97 && charCode <= 122) ||
            (charCode >= 48 && charCode <= 57)
    }

    function isAlphanumericExtended(charCode) {
        return (charCode >= 93 && charCode <= 122) || (charCode >= 45 && charCode <= 91) || (charCode >= 42 && charCode <= 43)
    }

    function isWhitespace(char) {
        return char.trim() === "";
    }

    return { parse, strictParse };

})();