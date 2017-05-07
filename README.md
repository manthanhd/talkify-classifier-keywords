# Keyword based classifier for Talkify

As simple as classification can get, this classifier will allow you to quickly create rules for topic classification based on keywords.

[![npm version](https://badge.fury.io/js/talkify-classifier-keywords.svg)](https://badge.fury.io/js/talkify-classifier-keywords) [![Build Status](https://travis-ci.org/manthanhd/talkify-classifier-keywords.svg?branch=master)](https://travis-ci.org/manthanhd/talkify-classifier-keywords) [![Coverage Status](https://coveralls.io/repos/github/manthanhd/talkify-classifier-keywords/badge.svg?branch=master)](https://coveralls.io/github/manthanhd/talkify-classifier-keywords?branch=master)

## Usage

```javascript
const KeywordsClassifier = require("talkify-classifier-keywords")
const myClassifier = new KeywordsClassifier({
    "food_topic": [
        "food", ["apple", "banana", "strawberry"]
    ]
});

const Bot = require("talkify").Bot;
const bot = new Bot({
    classifier: myClassifier
});
```

The above example creates a keywords classifier instance with one topic and adds it to the bot instance as its classifier.

This classifier does not need any training as the rules you create form as part of its training when its instantiated.

In the above example, the classifier will only classify a given statement as food when the input contains the word food and optionally one of `apple`, `banana` and `strawberry`.

The syntax requires that all the elements of the main array are evaluated with an `and` condition while all elements of an array within the main array are evaluated as an `or` alongside the items in the main array. To make this a bit clearer, consider the following example:

```javascript
const myClassifier = new KeywordsClassifier({
    "food_topic": [
        "food", "eat", "edible"
    ]
});
```

In the above example, the classifier will match a given input to food with a lot higher confidence when all of `food, eat, edible` keywords are matched. It will evaluate them with an `and` condition.

Alternatively, consider the following example:

```javascript
const myClassifier = new KeywordsClassifier({
    "food_topic": [
        ["food", "eat", "edible"],
        ["apple", "banana", "strawberry"]
    ]
});
```

Here, one of `food, eat, edible` **and** one of `apple, banana, strawberry` are evaluated. This means that the following sentence will receive classification with 100% confidence:

```
I want to eat a banana
```

while the following will only receive 50% (0.5) confidence in classification:

```
I want to eat something.
```

For multiple topics, the classifier will always return classifications in descending order i.e. the classification that the classifier has highest confidence in will be listed towards the top of the array. Consider this:

```javascript
const myClassifier = new KeywordsClassifier({
    "eat_food": [
        "eat", ["apples", "banana", "mango"]
    ],
    "like_food": [
        "like", ["apples", "banana", "mango"]
    ]
});
```

For a given sentence:

```
I like apples
```

The classifier will return the following classifications:

```
[
    { label: "like_food", value: 1 },
    { label: "eat_food", value: 0.5 },
]
```

## Classification Graphs

This classifier supports classification graphs. Consider the following graphical arrangement:

```
[questionClassifier] ======\\
                             ====== [lightOffClassifier]
                             ||
                             ====== [lightOnClassifier]
[commandClassifier] =======//
```

Here, the `questionClassifier` and `commandClassifier` are the top level classifiers while the `lightOffClassifier` and `lightOnClassifier` are downstream classifiers to those top level classifiers.

Here's how the implementation might look like:

```javascript
const questionClassifier = new KeywordsClassifier({
    'question': [
        ["is", "check"], "turned"
    ]
});

const commandClassifier = new KeywordsClassifier({
    'command': [
        ["do", "please"], "turn"
    ]
});

const lightOffClassifier  = new KeywordsClassifier({
    'light_off': [
        ["off"], "light"
    ]
});

const lightOnClassifier= new KeywordsClassifier({
    'light_on': [
        ["on"], "light"
    ]
});

questionClassifier.addDownstreamClassifier("question", lightOffClassifier);
questionClassifier.addDownstreamClassifier("question", lightOnClassifier);

commandClassifier.addDownstreamClassifier("command", lightOffClassifier);
commandClassifier.addDownstreamClassifier("command", lightOnClassifier);
```

The above example is divided into two parts. In the first part, we're defining all our classifiers. In the second, we're associating the downstream classifiers like `lightOffClassifier` and `lightOnClassifier` to the top level classifiers like `questionClassifier` and `commandClassifier` using the `addDownstreamClassifier` method. This method takes two parameters, the name of the topic and the classifier object itself. This, in effect "subscribes" the downstream classifier to the topic that you specify. As you see, we're subscribing the downstream classifiers to the topics that the parent classifiers are producing. To keep things simple, in this case, each of the top level classifiers are only producing a single topic.

Once you've got this all setup, you can wire the classification graph to the bot like so:

```javascript
const bot = new Bot({
    classifiers: [questionClassifier, commandClassifier]
});
```

Even though we've got a total of four classifiers in our classification graph, we're only adding two of them. This is because the other two are already linked to the two that are being added to the bot so in effect, by adding two classifiers, we are adding a total of four.
