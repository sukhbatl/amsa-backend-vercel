function getCombinations(words) {
    words = words.sort();
    const result = [];
    const f = function(prefix, chars) {
        for (let i = 0; i < chars.length; i++) {
            let s = chars[i];
            if (prefix !== '') {
                s = prefix + ',' + chars[i];
            }
            result.push(s);
            f(s, chars.slice(i + 1));
        }
    };
    f('', words);
    return result;
}

module.exports.getCombinations = getCombinations;
