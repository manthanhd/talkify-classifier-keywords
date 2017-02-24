# Keyword based classifier for Talkify

As simple as classification can get, this classifier will allow you to quickly create rules for topic classification based on keywords.

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