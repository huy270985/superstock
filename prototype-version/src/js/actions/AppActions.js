var AppDispatcher = require('../dispatcher/AppDispatcher'),
    AppConstants = require('../constants/AppConstants');

var AppActions = {

  add: function () {
    AppDispatcher.handleViewAction({
      type: AppConstants.STOCK_GETALL
    });
  }
};

module.exports = AppActions;
