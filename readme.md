# Introduction

This is the front-end for the superstock project. This app allows user to monitor strongest stocks as well as add their own filters to find best-value stocks.

There are 2 pages:
- The main page: to grasp a summary view of the market
- The full page: to filter by stocks by choice

User can log-in using Facebook account and save their filters preference in real-time

# Technical stack
This project is built around the [SlickGrid](https://github.com/mleibman/SlickGrid), with the slider by [jQuery mobile](https://demos.jquerymobile.com/1.2.0/docs/forms/slider/) with the backend is powered by [Firebase](https://www.firebase.com)

To run the project, simply supply a HTTP server, e.g:

```
python -m SimpleHTTPServer
```

# Firebase Data

The data is stored in Firebase with these endpoints:
- superstock: main data
- superstock_fields: names of the corresponding fields
- superstock_titles: titles of of the corresponding fields
- superstock_format: format of each field - in [type]:[from]:[value]:[to]

For Tổng hợp:
- longterm_data
- longterm_headers
- longterm_titles

- shortterm_data
- shortterm_headers
- shortterm_titles

Data is stored in pipe delimiter format, e.g.: [field1]|[field2]|[field3]etc
