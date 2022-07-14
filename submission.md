# Submission

As part of the Women in Sports Data hackathon, we must provide the following
information.

## Introduction

In ever soccer match there are hundreds of passes. Maintaining possession is
key to many teams' strategies, so it is important to pick passes that have
a high likelihood of completion. As a team gets into the attacking third of
the field this strategy pivots and riskier passes are needed in order to
attack the goal, but for a large chunk of the field, the primary goal of a
pass is completion.

## Purpose & Motivation

The goal of this web application is to allow coaches and players to dive deep
into passes made during a game to see which ones were good ideas and which ones
weren't. My motivation was to find a clean way to present pass data that isn't
overwhelming, but still provides all the necessary information to understand
the context around the pass.

## Solution

The web application can be found at: https://wisd-354300.uw.r.appspot.com/
And the code for the project can be found at: https://github.com/agale123/wisd

The solution is two fold: a model to predict the likelihood of pass compeltion,
and a web application to visualize passes with key data. To build the model,
pass data is cleaned and reduced to useful predictors like the number of
opposing players in the passing lane, position of the pass, and the number of
previous passes in the possession.

After testing different models, a Gradient Boosted Decision Tree model
performed the best with a test accuracy of 0.896. It also had the most balanced
confusion matrix and was relatively quick to build. Probabilities from this
model were generated for each pass to display in the final web application.

The web application is a plain HTML/JavaScript application that uses d3 to 
visualize the passes over a specific 5 minute range. There are controls to
change the game, team, and timeframe to focus on. Selecting a pass highlights
the positions of all players on the field and displays details about that
pass that would be relevant to the coaching staff and player.

## Context for how and when to use the application/recommendation

This application is meant to complement film sessions, allowing you to
get a freeze frame of where everyone was at the moment a pass was made. By
providing additional details about the pass likelihood and the players' overall
pass completion rate, you have a good feel for whether a pass should have been
attempted.

The built model could also be used to calculate the completion likelihood
of alternative pass options. So if one pass wasn't completed, you could run
a similar pass but with a different angle, height, or body part. This could
help identify what the ideal pass in the situation would be.

## Difficulties & Challenges faced during the design and/or development process

A lot of the challenges I faced were in the design phase and trying to identify
a specific problem to tackle. Since I've never been in a front office or
coaching role, I'm not as familiar with what sorts of information is useful.
I've typically engaged with soccer data from a fan perspective which is quite
different. To narrow my scope, I talked to people like my sister who played
soccer in college to see what sort of information would be helpful to her.

Another challenge was that I hadn't really done machine learning in Python
before. I wanted to use Python instead of R because I understand the
language better and I wanted to learn how to build ML models in Python.

The final challenge I'll call out is related to performance. At times I worked
with small enough datasets that I didn't have to worry about optimizing the
code, but when I was cleaning all the passes and generating calcualted
predictors, that could be really slow if done inefficiently. I also probably
could have gotten better performance if I had built these models remotely on
a higher powered machine.