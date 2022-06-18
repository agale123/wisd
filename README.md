# Pass Analyzer

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
│   ├── clean.ipynb
│   └── process.ipynb
└── web
    ├── data
    │   ├── field.csv
    │   ├── frames
    │   │   └── *.csv
    │   ├── matches.csv
    │   └── passes
    │       └── *.csv
    ├── field.js
    ├── images
    │   └── favicon.ico
    ├── oninput.js
    ├── passes.html
    └── passes.js
```

## Developing locally

To deploy the web application, change into the web directory and run:

```
python -m http.server
```

The application will be available at http://localhost:8000