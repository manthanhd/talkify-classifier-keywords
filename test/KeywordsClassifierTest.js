/**
 * Created by manthan on 18/02/17.
 */
const chai = require("chai");
const expect = chai.expect;

describe('KeywordClassifier', function() {
    const KeywordClassifier = require("../lib/KeywordsClassifier");
    describe("<init>", function() {
        it("successfully initialises when passed in object with topic as key and keywords as value", function() {
            let classifier = new KeywordClassifier({
                "food_topic": [
                    "fruits", "vegetables"
                ]
            });

            expect(classifier).to.exist;
        });

        it("successfully initialises when passed in object with topic as key and single keyword string as value", function() {
            let classifier = new KeywordClassifier({
                "food_topic": "food"
            });

            expect(classifier).to.exist;
        });

        it("throws TypeError when initialised with empty constructor", function(done) {
            try {
                new KeywordClassifier();
                done('expected error to be thrown');
            } catch (err) {
                expect(err).to.exist;
                done();
            }
        });
    });

    describe("getClassifications", function() {
        it("gets classification with 1 confidence for 100% match", function(done) {
            let classifier = new KeywordClassifier({
                "food": ['food']
            });

            return classifier.getClassifications("tell me about food", function(err, classifications) {
                expect(err).to.not.exist;
                expect(classifications).to.be.a('Array');
                expect(classifications.length).to.equal(1);
                expect(classifications[0].label).to.equal('food');
                expect(classifications[0].value).to.equal(1);

                done(err);
            });
        });

        it("gets classification with 0.5 confidence for 50% match", function(done) {
            let classifier = new KeywordClassifier({
                "eat": ['eat', 'food']
            }, {confidenceThreshold: 0.1});

            return classifier.getClassifications("tell me about food", function(err, classifications) {
                expect(err).to.not.exist;
                expect(classifications).to.be.a('Array');
                expect(classifications.length).to.equal(1);
                expect(classifications[0].label).to.equal('eat');
                expect(classifications[0].value).to.equal(0.5);

                done(err);
            });
        });

        it("gets classification with empty classification array for 0% match", function(done) {
            let classifier = new KeywordClassifier({
                "eat": ['eat', 'food']
            });

            return classifier.getClassifications("space rabbits", function(err, classifications) {
                expect(err).to.not.exist;
                expect(classifications).to.be.a('Array');
                expect(classifications.length).to.equal(0);

                done(err);
            });
        });

        it("gets classification with 1 when one of the mandatory keywords and at least one of the optional keywords match 100%", function(done) {
            let classifier = new KeywordClassifier({
                "eat_fruit": ['eat', ['apples', 'bananas']]
            });

            return classifier.getClassifications("I want to eat apples", function(err, classifications) {
                expect(err).to.not.exist;
                expect(classifications).to.be.a('Array');
                expect(classifications.length).to.equal(1);
                expect(classifications[0].label).to.equal('eat_fruit');
                expect(classifications[0].value).to.equal(1);

                done(err);
            });
        });

        it("gets classification with 0.5 when one of the mandatory keywords match and none of the optional keywords match", function(done) {
            let classifier = new KeywordClassifier({
                "eat_fruit": ['eat', ['apples', 'bananas']]
            }, {confidenceThreshold: 0.1});

            return classifier.getClassifications("I want to eat pears", function(err, classifications) {
                expect(err).to.not.exist;
                expect(classifications).to.be.a('Array');
                expect(classifications.length).to.equal(1);
                expect(classifications[0].label).to.equal('eat_fruit');
                expect(classifications[0].value).to.equal(0.5);

                done(err);
            });
        });

        it("gets two classifications with descending order of confidence when two topics match", function() {
            let classifier = new KeywordClassifier({
                "eat_fruit": ['eat', ['apples', 'bananas']],
                "like_fruit": ['like', ['apples', 'broccoli']]
            }, {confidenceThreshold: 0.1});

            return classifier.getClassifications("I like apples", function(err, classifications) {
                expect(err).to.not.exist;
                expect(classifications).to.be.a('Array');
                expect(classifications.length).to.equal(2);
                expect(classifications[0].label).to.equal('like_fruit');
                expect(classifications[0].value).to.equal(1);
                expect(classifications[1].label).to.equal('eat_fruit');
                expect(classifications[1].value).to.equal(0.5);
            });
        });

        it("gets two classifications with equal confidence when two topics match", function() {
            let classifier = new KeywordClassifier({
                "eat_fruit": ['eat', ['apples', 'bananas']],
                "like_fruit": ['like', ['apples', 'broccoli']]
            });

            return classifier.getClassifications("I like to eat apples", function(err, classifications) {
                expect(err).to.not.exist;
                expect(classifications).to.be.a('Array');
                expect(classifications.length).to.equal(2);
                expect(classifications[0].label).to.equal('eat_fruit');
                expect(classifications[0].value).to.equal(1);
                expect(classifications[1].label).to.equal('like_fruit');
                expect(classifications[1].value).to.equal(1);
            });
        });

        it("gets classification from downstream classifiers", function(done) {
            let parentClassifier = new KeywordClassifier({
                "topic_apples": [['apples', 'apple']]
            });

            let childClassifier1 = new KeywordClassifier({
                "topic_ask_nutrition_info": [['nutrition', 'nutritional'], ['what', 'about', 'tell']]
            });

            parentClassifier.addDownstreamClassifier('topic_apples', childClassifier1);

            return parentClassifier.getClassifications('tell me about nutritional info in apples', function(err, classifications) {
                expect(err).to.not.exist;
                expect(classifications).to.be.a('Array');
                expect(classifications.length).to.equal(2);
                expect(classifications[0].label).to.equal('topic_apples');
                expect(classifications[0].value).to.equal(1);
                expect(classifications[1].label).to.equal('topic_ask_nutrition_info');
                expect(classifications[1].value).to.equal(1);
                done();
            })
        });
    });
});