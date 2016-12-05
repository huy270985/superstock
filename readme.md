# Super Stock

## Introduction

This is the front-end for the superstock project. This app allows user to monitor strongest stocks as well as add their own filters to find best-value stocks.

There are 2 pages:
- The main page: to grasp a summary view of the market
- The full page: to filter by stocks by choice

User can log-in using Facebook account and save their filters preference in real-time

## Technical stack

Project based on AngularJS, used the ui-grid (angular module) for layout stock board

## Prerequisite

```npm install```

```bower install```

## Build

Mở thư mục gốc của source code và execute command sau:

```grunt build```

Sau khi build thành công grunt sẽ tạo ra thư mục ```dist```

Sử dụng webserver (like Apache, IIS, nginx,..) để serve thư mục (```dist```)

Để deploy lên [Github page](https://pages.github.com/), push tất cả các files trong ```dist`` lên branch ```gh-pages```

Page sẽ đc chạy trên https://superstock.github.io/stockboard

## Run

```grunt serve```

Default URL to access: [http://localhost:9000/](http://localhost:9000/)

## Detect errors and potential problems in code.

```grunt jshint```
