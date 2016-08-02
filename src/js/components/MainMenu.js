/**
 * Created by Bond on 7/31/2016.
 */
var React = require('react');

var MainMenu = React.createClass({
    render: function () {
        return (
            <div>
                <ul>
                    <li><a>Menu 1</a></li>
                    <li><a>Menu 2</a></li>
                    <li><a>Menu 3</a></li>
                </ul>
                </div>
        );
    },
});

module.exports = MainMenu;
