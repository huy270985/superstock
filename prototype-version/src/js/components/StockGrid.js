/**
 * Created by Bond on 7/31/2016.
 */
var React = require('react');
var Stock = require('./Stock');

var StockGrid = React.createClass({
    
    render: function () {
        var stocks = this.props.stocks.map(function (st) {
           return <Stock value={st} key={st.id}/>
        }) 
        return (
            <div>
                <h2>Stocks</h2>
                <table>
                    {stocks}
                </table>
            </div>
        );
    },
});

module.exports = StockGrid;
/**
 * Created by Bond on 7/31/2016.
 */
