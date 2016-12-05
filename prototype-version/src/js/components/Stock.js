/**
 * Created by Bond on 7/31/2016.
 */
var React = require('react');

var Stock = React.createClass({

    render: function () {
        return (
             <tr>
                <td>{this.props.value.name}</td>
                <td>${this.props.value.price}</td>
            </tr>
        );
    },

    _onClick: function (event) {
        event.preventDefault();
    }

});

module.exports = Stock;

