# Pass Analyzer

 ![Passes rendered on a field with details about a pass](/screenshot.png)

## Deployed application

The deployed version of this application can be found at:
https://wisd-354300.uw.r.appspot.com/

## Description

The goal of this project is to build a web application that allows the user to
analyze passes during key moments in a game. After selecting a match and team
to focus on, you can use the slider to select a 5 minute interval to highlight.
All the passes during that time range appear as either blue (completed) or
red (incomplete). When you select a pass, you can see lots of details about
the pass and marks denoting where various field players were at the moment
of the pass.

## Directory structure

There is a notebooks directory with Jupyter notebooks used to explore and clean
data. The web directory contains everything needed to serve the application.

```
.
├── README.md
├── notebooks
│   ├── basic.ipynb: Used to preliminarily explore the data
│   ├── clean.ipynb: Prototype how to clean an individual match
│   ├── process.ipynb: Process and save cleaned data for all 
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

To deploy the web application, change into the web directory and run:

```
python -m http.server
```

The application will be available at http://localhost:8000

### Jupyter notebooks

To run the Python notebooks locally, run:

```
jupyter notebook
```

And then go to the provided webpage to run the notebooks. The output of the
notebooks can be previewed through this GitHub repository.