chrome.storage.local.get(["status"], function(status){
    if(status.status){
        const text = document.querySelectorAll("span, p, a, h1, h2, h3, h4, h5, h6, em, tr, ul, ol, tr, label");

        text.forEach(textNode => {
            if(hasNonMutableAncestors(textNode))  $(textNode).contents().each(function() { if(this.nodeType == Node.TEXT_NODE) $(this).replaceWith(generateFormattedText($(this).text())); });
        });
    }
});

function hasNonMutableAncestors(el){
    return $(el).parents("pre").length == 0;
}

const generateFormattedText = function(word) {
    "use strict";
    const textVide  = (word, maybeOptions) => 
        word == null || word === "",
        omitBy = (obj, omitFilter ) => Object.keys(obj).reduce((obj, key ) => (omitFilter(obj[key]) && delete obj[key ], obj), obj),
        defaults = (obj, defaultValue ) => ({
            ...defaultValue,
            ...omitBy(obj, textVide)
        }),
        DEFAULT_SEP = [`<b>`, "</b>"],
        getOptions = maybeOptions => defaults(maybeOptions, {
            sep: DEFAULT_SEP,
            fixationPoint: maybeOptions.fixationPoint || 5,
            ignoreHtmlTag: !0
        }),
        FIXATION_BOUNDARY_LIST  = [
            [0, 4, 12, 17, 24, 29, 35, 42, 48],
            [1, 2, 7, 10, 13, 14, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49],
            [1, 2, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49],
            [0, 2, 4, 5, 6, 8, 9, 11, 14, 15, 17, 18, 20, 0, 21, 23, 24, 26, 27, 29, 30, 32, 33, 35, 36, 38, 39, 41, 42, 44, 45, 47, 48],
            [0, 2, 3, 5, 6, 7, 8, 10, 11, 12, 14, 15, 17, 19, 20, 21, 23, 24, 25, 26, 28, 29, 30, 32, 33, 34, 35, 37, 38, 39, 41, 42, 43, 44, 46, 47, 48]
        ],
        getFixationLength = (word, fixationPoint ) => {
            const { length: wordLength } = word;
            const fixationBoundary = FIXATION_BOUNDARY_LIST [fixationPoint  - 1] ?? FIXATION_BOUNDARY_LIST [0];
            const fixationLengthFromLast  = fixationBoundary.findIndex(boundary => wordLength  <= boundary);
            let fixationLength = wordLength  - fixationLengthFromLast;
            return fixationLengthFromLast  === -1 && (fixationLength = wordLength  - fixationBoundary.length), Math.max(fixationLength, 0);
        },
        getHighlightedText = (word, sep) => typeof sep == "string" ? `${sep}${word}${sep}` : `${sep[0]}${word}${sep[1]}`,
        HTML_TAG_REGEX = /(<!--[\s\S]*?-->)|(<[^>]*>)/g,
        useCheckIsHtmlTag = (text) => {
            const htmlTagMatchList = text.matchAll(HTML_TAG_REGEX);
            const htmlTagRangeList = getHtmlTagRangeList(htmlTagMatchList);
            const reversedHtmlTagRangeList = htmlTagRangeList.reverse();
        
            return (match) => {
                const startIndex = match.index;
                const tagRange = reversedHtmlTagRangeList.find(
                    ([rangeStart]) => startIndex > rangeStart,
                );
                if (!tagRange) return false;
                const [rangeEnd] = tagRange;
                const isInclude = startIndex < rangeEnd;
                return isInclude;
            };
        },
        getHtmlTagRangeList = (htmlTagMatchList) => [...htmlTagMatchList].map(htmlTagMatch => {
            const startIndex = htmlTagMatch.index;
            const [tag] = htmlTagMatch;
            const { length: tagLength } = tag;
            return [startIndex, startIndex + tagLength - 1];
        }),
        CONVERTIBLE_REGEX  = /(\p{L}|\p{Nd})*\p{L}(\p{L}|\p{Nd})*/gu,
        main = (text, fixationPoint  = {}) => {
            if (!(text != null && text.length)) return "";
            const { fixationPoint: wordLength, sep: sep, ignoreHtmlTag: fixationLengthFromLast } = getOptions(fixationPoint)
            const convertibleMatchList = text.matchAll(CONVERTIBLE_REGEX);
            let result = "";
            let lastMatchedIndex = 0, checkIsHtmlTag;
            fixationLengthFromLast  && (checkIsHtmlTag = useCheckIsHtmlTag(text));
            for (const match of convertibleMatchList) {
                if (checkIsHtmlTag == null ? void 0 : checkIsHtmlTag(match)) continue;
                const [matchedWord] = match;
                const startIndex  = match.index;
                const endIndex  = startIndex  + getFixationLength(matchedWord, wordLength);
                const plainText  = text.slice(lastMatchedIndex, startIndex);
                result += plainText;
                startIndex  !== endIndex  && (result += getHighlightedText(text.slice(startIndex, endIndex ), sep));
                lastMatchedIndex = endIndex;
            }
            const remainText = text.slice(lastMatchedIndex);
            return result + remainText;
        };
    return word = main, Object.defineProperty(word, Symbol.toStringTag, {
        value: "Module"
    }), word
}({});