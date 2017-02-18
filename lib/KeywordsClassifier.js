/**
 * Created by manthan on 18/02/17.
 */
function KeywordClassifier(keywordClassificationMap) {
    if (!keywordClassificationMap) throw new TypeError("KeywordClassifier cannot function without configuration in constructor");
    const keywordDigestMap = {};
    const topics = Object.keys(keywordClassificationMap);
    topics.forEach(function (topic) {
        let keywords = keywordClassificationMap[topic];
        if (!(keywords instanceof Array)) {
            keywords = [keywords];
        }

        keywordDigestMap[topic] = function (input) {
            let match = 0;
            let mismatch = 0;
            keywords.forEach(function (keyword) {
                if (keyword instanceof Array) {
                    let matched = false;
                    for (let i = 0; i < keyword.length; i++) {
                        let optionalKeyword = keyword[i];
                        if (input.includes(optionalKeyword)) {
                            match++;
                            matched = true;
                            return;
                        }
                    }
                    mismatch++;
                } else {
                    if (input.includes(keyword)) {
                        match++;
                    } else {
                        mismatch++;
                    }
                }
            });

            let total = match + mismatch;
            return match / total;
        }
    });


    this.getClassifications = function (input, callback) {
        let classifications = [];
        topics.forEach(function (topic) {
            let confidence = keywordDigestMap[topic](input);
            if (confidence > 0) {
                classifications.push({label: topic, value: confidence});
            }

        });
        return callback(undefined, classifications);
    }
}

module.exports = KeywordClassifier;