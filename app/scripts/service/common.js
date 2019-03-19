/**
 * provider support for common controller setup like
 * - header
 * - click symbol to display chart
 */
'use strict';

angular
.module('superstockApp')
    .factory('common',
        ['utils', '$sce',
        function (utils, $sce) {
            return {
                /*
                * Get market summary data
                */
                syncMarketSummary: function($scope) {
                    $scope.headerTitle = { content: "XEM CÁCH DÙNG BẢNG GIÁ TẠI: HTTP://HUNGCANSLIM.COM/BANGGIA <br>MỌI QUY TẮC ĐỀU LÀ VÔ NGHĨA, NẾU BẠN KHÔNG TUÂN THỦ!" }
                    // utils.getMarketSummary().then(function (data) {
                    //     $scope.headerTitle = data;
                    // }).catch(function (ex) {
                    //     console.error('Exception when getMarketSummary')
                    // });
                },

                /*
                * Update trading date
                */
                syncTradingDate: function ($scope) {
                    utils.getTradingDate().then(function (data) {
                        $scope.tradingDate = data;
                    }).catch(function (ex) {
                        console.error('Exception when getTradingDate')
                    });
                },

                clickSymbolPopupDetails: function ($scope) {
                    /**
                     * Binding onclick event for symbol, display company profile & technical chart
                     */
                    $(document).ready(function () {
                        /*
                        * Graph chart click event
                        */
                        $(document).on('click', '.chart-icon', function () {
                            $('#myModal').modal('show');
                            $scope.stockInfo = $(this).data('symbol');
                            $scope.iSrc = 'https://banggia.vndirect.com.vn/chart/?symbol=' + $(this).data('symbol');
                            $scope.iSrcTrust = $sce.trustAsResourceUrl($scope.iSrc);
                        });

                        /*
                        * Company information click event
                        */
                        $(document).on('click', '.information-icon', function () {
                            $('#companyModal').modal('show');
                            var symbolVal = $(this).data('symbol');
                            var industryVal = $(this).data('industry');
                            $scope.companyInfo = symbolVal;
                            utils.getCompanyInformation(symbolVal).then(function (data) {
                                $scope.companyDatas = data;
                            }).catch(function (ex) {
                                console.error('Could not load company info', ex);
                            });
                        });
                    });
                },

            }
        }
    ])
