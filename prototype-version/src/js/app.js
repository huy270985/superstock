var React = require('react');
var MainMenu = require('./components/MainMenu');
var StockGrid = require('./components/StockGrid');
var stocks = require('./StockData');
React.render(
  <div>
        <MainMenu />
        <StockGrid stocks={stocks}/>
  </div>,
  document.getElementById('content')
);