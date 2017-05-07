/**
 * Created by manthan on 18/02/17.
 */
function KeywordClassifier(keywordClassificationMap, options) {
    const async = require("async");
    if (!keywordClassificationMap) throw new TypeError("KeywordClassifier cannot function without configuration in constructor");
    let downstreamClassifiers = {};
    let confidenceThreshold = 0.6;
    if(options) {
        confidenceThreshold = options.confidenceThreshold || confidenceThreshold;
        downstreamClassifiers = options.downstreamClassifiers || downstreamClassifiers;
    }

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
        };
    });

    this.addDownstreamClassifier = function(topic, downstreamClassifier) {
        if(!downstreamClassifiers[topic]) downstreamClassifiers[topic] = [];

        downstreamClassifiers[topic].push(downstreamClassifier);
    };

    this.getClassifications = function (input, callback) {
        let classifications = [];
        topics.forEach(function (topic) {
            let confidence = keywordDigestMap[topic](input);
            if (confidence > 0 && confidence >= confidenceThreshold) {
                classifications.push({label: topic, value: confidence});
            }

        });

        let downstreamClassifications = [];

        async.eachSeries(classifications, function(classification, next) {
            let topic = classification.label;
            let downstreamClassifiersForTopic = downstreamClassifiers[topic];
            if(!downstreamClassifiersForTopic) return next();

            async.eachSeries(downstreamClassifiersForTopic, function(downstreamClassifer, next) {
                return downstreamClassifer.getClassifications(input, function(err, retrievedDownstreamClassifications) {
                    downstreamClassifications = downstreamClassifications.concat(retrievedDownstreamClassifications);
                    next();
                });
            }, function(err) {
                next();
            });
        }, function(err) {
            classifications = classifications.concat(downstreamClassifications);
            return async.sortBy(classifications, function(classification, callback) {
                return callback(undefined, classification.value * -1);
            }, function(err, sortedClassifications) {
                return callback(undefined, sortedClassifications);
            });
        });
    };

    return this;
}

module.exports = KeywordClassifier;