# Pass Analyzer

## Deployed application

The deployed version of this application can be found at:
https://wisd-354300.uw.r.appspot.com/

Here is a screenshot of what the application looks like:

![Passes rendered on a field with details about a pass](/screenshot.png)

## Data

All data for this application comes from StatsBomb through the `statsbombpy`
Python library.

![StatsBomb logo](/web/images/StatsBomb.jpg)

## Description

The goal of this project is to build a web application that allows the user to
analyze passes during key moments in a game. After selecting a match and team
to focus on, you can use the slider to select a 5 minute interval to highlight.
All the passes during that time range appear as either blue (complete) or
red (incomplete).

When you select a pass, you can see lots of details about the pass and marks
denoting where various players were at the moment of the pass. Some of the
pass details include:

- likelihood: expected probability of the pass being completed based on a model built from all passes in the Euros
- passing accuracy: how many passes the player completed in the game
- body part: which body part was used to make the pass
- recipient: who received the ball if the pass was completed

## Likelihood model

A key piece of the project was building a model to calculate the likelihood of
a given pass being completed. This gives useful context when looking at pass,
because a low likelihood pass might indicate poor decision making in the defensive
half, while a high likelihood pass that isn't completed might indicate poor
execution.

### Cleaning

The most important thing when cleaning the data was to drop any predictors that
include any information from after the moment a ball is passed. We are left with
data like the players position, other players position, the current play, which
body part was used, the height of the pass (since this is predetermined as soon
as it is struck).

In addition to the data we can get directly from StatsBomb, I also added some
calculated predictors. I calculated the number of prior passes in the current
possession which is information not directly available from a single pass. I
also calculated the number of nearby teammates and opponents in the general
direction of the pass. The idea was that having more teammates and less opponents
in the general direction of the pass would be correlated with a higher likelihood
of completion. This dimension reduction technique was applied rather than
including the exact locations of all other players at the time of the pass to
avoid overfitting.

The final step of cleaning was to convert qualitative predictors to quantitative
ones using one-hot encoding. And the response variable was converted to a
boolean where `true` indicates a completed pass.

### Building the model

After cleaning the data, I split the data into a training and test set with 2/3
of the data used for training and 1/3 used for evaluating the accuracy of the
model. I knew that I needed a non-linear model because certain values like the
x and y coordinates of the pass aren't going to be very linearly correlated with
pass completion. Passes in the middle of the field will likely have much higher
completion rate than passes on the edge of the field.

As a baseline, I first built a GradientBoostingClassifier which uses Gradient
Boosted Decision Trees using just the x and y coordinates of the pass. I then
used GradientBoostingClassifier, KNeighborsClassifier, and MLPClassifier on
the full set of predictors. Once I picked a model I wanted to utilize, I used
cross validation to optimize the parameters.

Once the model was selected and the parameters were tuned, I built the model
on the full set of passes and used the probabilities returned by the model
for each pass as the likelihood of that pass being completed.

### Results

#### GradientBoostingClassifier with only location

First I used the Gradient Boosted Decision Trees model using just the x and y
coordinates of where the pass began. This model had a test accuracy of `0.833`,
but when looking at the confusion matrix you can see that this model almost
never classifies passes as incomplete so almost all the error is passes that
were incomplete but were predicted to be completed. This isn't very useful for
the purposes of this application.

| True\Predicted | Incomplete | Complete |
| -------------- | ---------- | -------- |
| **Incomplete** | 223        | 2883     |
| **Complete**   | 168        | 15000    |


#### KNeighborsClassifier

The K-Nearest Neighbors classifier didn't perform much better than the 
Gradient Boosted Decision Trees model that was just built on the location
predictors. The test accuracy was `0.847`, but the confusion matrix was a
bit more balanced which was an improvement over the first model.

| True\Predicted | Incomplete | Complete |
| -------------- | ---------- | -------- |
| **Incomplete** | 1121       | 1985     |
| **Complete**   | 802        | 14366    |

#### MLPClassifier

Next I used a Neural Network to classify the data and this definitely showed
an improvement over the previous two models with an accuracy of `0.886`. It
also further improved the balance of errors in the confusion matrix. The
main issue for this model was that it was very slow.

| True\Predicted | Incomplete | Complete |
| -------------- | ---------- | -------- |
| **Incomplete** | 1741       | 1365     |
| **Complete**   | 711        | 14457    |

#### GradientBoostingClassifier

Finally, I came back to the Gradient Boosted Decision Trees and found that it
slightly improved on the Neural Network approach with an accuracy of `0.895`.
This fixed even more passes that were incorrectly marked as likely to complete.

| True\Predicted | Incomplete | Complete |
| -------------- | ---------- | -------- |
| **Incomplete** | 1934       | 1172     |
| **Complete**   | 732        | 14436    |

I then used cross validation to tune the parameters that brought the accuracy
to `0.896` without much change in the confusion matrix. When built on the full
dataset, the resulting accuracy of the model was `0.900`.

### Application to FAWSL

After building the model, I was curious how specific it was to that particular
tournament. I used data from the 2020/2021 FAWSL season and calculated the model
accuracy in predicting whether those passes are completed. The model had an 
accuracy of `0.832` which is much worse than what we saw on the men's Euros,
but not completely different. These two sets of games are also quite different
because it is women's instead of men's and club play instead of an international
tournament. To get the best results, a model would likely need to be built on
a more similar set of data. So for the Women's Euros it would make sense to build
the model on either the previous Euros or the Women's Champions League.

## Directory structure

There is a notebooks directory with Jupyter notebooks used to explore and clean
data. The web directory contains everything needed to serve the application.

```
.
├── README.md
├── app.yaml: configuration to deploy web app to App Engine
├── notebooks
│   ├── basic.ipynb: Used to preliminarily explore the data
│   ├── clean.ipynb: Prototype how to clean an individual match
│   ├── process.ipynb: Process and save cleaned data for all matches
│   ├── xp_clean.py: Abstracted out helpers to clean data for the xp model
│   ├── xp.ipynb: Calculate xP model for all games
│   └── xp_fawsl.ipynb: Apply the model calculated for the Euros to FAWSL data
└── web
    ├── data
    │   ├── field.csv: Coordinates of all lines needed to draw the soccer pitch
    |   ├── matches.csv: List of all matches in the Euros
    |   ├── xp.csv: Calculated xp for all passes
    │   ├── frames: Cleaned 360 frames for passes by game
    │   │   └── *.csv
    │   └── passes: Cleaned pass data by game
    │       └── *.csv
    ├── images
    │   └── favicon.ico
    ├── field.js: Create the svg and render the field
    ├── oninput.js: Handle input events and updating state in response
    ├── index.html: Entrypoint for the web application
    └── passes.js: Read in pass data and render it to the field
```

## Developing locally

### Web application

To run the web application locally, change into the `web` directory and run:

```
python -m http.server
```

The application will be available at http://localhost:8000

To deploy the web application to app engine, from the top level `wisd`
directory, run:

```
gcloud app deploy
```

### Jupyter notebooks

The Jupyter notebooks use the following Python libraries:

- statsbombpy
- pandas
- numpy
- sklearn
- joblib
- math

To run the Python notebooks locally, chaneg into the `notebooks` directory
and run:

```
jupyter notebook
```

And then go to the provided webpage to run the notebooks. The output of the
notebooks can be previewed through this GitHub repository.