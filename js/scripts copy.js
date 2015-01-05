var olapicGallery = angular.module('olapicGallery', ['ngAnimate']);

var counter = 0;
var firstRun = true;


olapicGallery.filter('trustAsResourceUrl', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
}]);

olapicGallery.directive('mediaItemDirective', function() {
    return function($scope, $element, $attrs) {

        $element.addClass('item-' + counter);

        switch (counter) {
            case 4:
            case 6:
            case 9:
            case 11:
            case 15:
                $element.before('<div class="row ng-scope" />');
                break;
        }

        if (counter == 6) {
            angular.element('#gallery-wrapper .item-6').after('<div class="media-item-wrapper item-7 main-square"><div class="media-item"><h1>Headphones and Headsets</h1></div></div>');
            counter = 7;
        }

        counter++;

        function randomDeg(min,max) {
            var num = Math.floor(Math.random()*(max-min+1)+min);
            num = num + 'deg';
            return num;
        }

        $element.find('img').on('load', function() {
            var img = angular.element(this).attr('src');
            $element.find('.media-item').css('background-image', 'url(' + img + ')')
                .velocity({
                    opacity: 1
                });

            $element.velocity({
                rotateX: ['180deg', '180deg'],
                rotateY: ['180deg', '180deg'],
                rotateZ: ['225deg', randomDeg(75, 375)],
                scale: [1, 0],
                opacity: [1, 0]
            }, 1500, [20, 5]);
        });

        $element.on('mouseenter', function() {
            $element.find('.media-item').velocity({
                backgroundPositionX: '50%',
                backgroundPositionY: ['-1.5vw', '0vw']
            }, 700, [20, 5]);

            $element.find('.info').velocity({
                height: ['50%', '0%']
            }, 700, [20, 5]);

        });

        $element.on('mouseleave', function() {
            $element.find('.media-item').velocity('reverse');

            $element.find('.info').velocity('reverse');
        });


        if($scope.$last) {
            counter = 0;

            if (firstRun) {
                angular.element('.main-square').velocity({
                    rotateX: ['180deg', '180deg'],
                    rotateY: ['180deg', '90deg'],
                    rotateZ: ['225deg', '225deg'],
                    scale: [1, 1],
                    opacity: [1, 0]
                }, {
                    duration: 1500,
                    easing: [50, 5]
                });

                firstRun = false;
            } else {
                angular.element('.main-square').velocity({
                    rotateX: ['180deg', '180deg'],
                    rotateY: ['180deg', '180deg'],
                    rotateZ: ['225deg', '225deg'],
                    scale: [1, 1],
                    opacity: [1, 1]
                }, {
                    duration: 1000
                });
            }

            angular.element('.main-square').not(':first').remove();

        }
    };
});


olapicGallery.directive('mediaViewer', function() {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'media-viewer.html'
    }
});


olapicGallery.controller('galleryController', function($scope, $http) {

    $scope.imagesArray = [];
    $scope.charactersLimit = 14;
    $scope.mediaItemInfo = {};



    $http.get('https://api.olapic.com/customers/215757/media/recent?auth_token=0a40a13fd9d531110b4d6515ef0d6c529acdb59e81194132356a1b8903790c18&count=14&version=v2.2')
        .success(function(response) {
            console.warn(response);
            $scope.medias = response.data._embedded.media;

            $scope.nextLink = response.data._links.next.href;
            $scope.prevLink = response.data._links.prev.href;

            console.log($scope.medias, $scope.nextLink, $scope.prevLink);

            angular.forEach($scope.medias, function(media, index) {

                console.log(index, media);

                $scope.imagesArray.push({
                    'media': media
                });
            });

            console.log($scope.imagesArray);

        });



    $scope.navigateMedia = function(url) {

        counter = 0;

        $http.get(url)
            .success(function(response) {
                console.log(response);
                $scope.medias = response.data._embedded.media;

                $scope.nextLink = response.data._links.next.href;
                $scope.prevLink = response.data._links.prev.href;

                console.log($scope.medias);
            });
    };

    angular.element('#navigation a').on('click', function() {
        var urlLink = angular.element(this).data('url-link');
        $scope.navigateMedia(urlLink);
    });

    $scope.showViewer = function() {

        var $mediaViewer = angular.element('#media-viewer');

        console.log('click');


        var mediaViewerAnimation = {
            top: ['50%', $scope.mediaItemInfo.mediaItemPosition.top],
            left: ['50%', $scope.mediaItemInfo.mediaItemPosition.left],
            backgroundColor: ['rgb(255,255,255)', 'rgb(255,255,255)'],
            backgroundColorAlpha: [1, 0],
            opacity: [1, 1],
            rotateX: ['180deg', '180deg'],
            rotateY: ['180deg', '180deg'],
            rotateZ: ['180deg', '225deg'],
            translateZ: ['1px', '1px'],
            width: ['100%', $scope.mediaItemInfo.mediaWidth],
            maxWidth: ['500px', $scope.mediaItemInfo.mediaWidth],
            height: ['500px', $scope.mediaItemInfo.mediaHeight]
        };

        var mediaViewerImageAnimation = {
            rotateZ: ['0deg', '-45deg'],
            height: ['500px', '150%'],
            width: ['500px', '150%'],
            top: [0, '-1.8vw'],
            left: [0,'-1.8vw']
        };

        if ($scope.isBigViewer) {
            mediaViewerAnimation.marginTop = ['-250px', '5.1vw'];
            mediaViewerAnimation.marginLeft = ['-400px', '5.1vw'];

            mediaViewerImageAnimation.top = [0, '-5.8vw'];
            mediaViewerImageAnimation.left = [0, '-5.8vw'];
        } else {
            mediaViewerAnimation.marginTop = ['-250px', '2.3vw'];
            mediaViewerAnimation.marginLeft = ['-400px', '2.3vw'];

            mediaViewerImageAnimation.top = [0, '-3.3vw'];
            mediaViewerImageAnimation.left = [0, '-3.3vw'];
        }


        $mediaViewer.find('img').one('load', function() {
            var img = angular.element(this).attr('src');

            $mediaViewer.find('.image').css('background-image', 'url(' + img + ')');

            $scope.expandViewer();
        });


        $scope.expandViewer = function() {

            $mediaViewer.css({
                left: $scope.mediaItemInfo.mediaItemPosition.left,
                top: $scope.mediaItemInfo.mediaItemPosition.top,
                width: $scope.mediaItemInfo.mediaWidth,
                height: $scope.mediaItemInfo.mediaHeight,
                display: 'block'
            });

            angular.element('#media-viewer-overlay').velocity('fadeIn', 1000);

            $mediaViewer.velocity(mediaViewerAnimation, 600);

            $mediaViewer.find('.image').velocity(mediaViewerImageAnimation, {
                duration: 700,
                complete: function() {
                    $mediaViewer.velocity({
                        maxWidth: ['800px', '500px']
                    }, 700, [20, 5]);

                    $mediaViewer.find('.info').velocity({
                        opacity: [1, 0]
                    }, 500);
                }
            });


            switch ($scope.viewerMediaInfo.source) {
                case 'instagram':
                case 'twitter':
                    $scope.viewerMediaInfo.socialProfileUrl = 'http://' + $scope.viewerMediaInfo.source + '.com/' + $scope.viewerMediaInfo._embedded.uploader.social_connections.instagram.username;
                    break;
                default:
                    $scope.viewerMediaInfo.socialProfileUrl = 'javascript:';
                    $scope.viewerMediaInfo.original_source = 'javascript:';
                    break;

            }

            if ($scope.viewerMediaInfo.location) {
                $scope.viewerMediaInfo.mapIframeSrc = 'https://maps.google.com/maps?q='+ $scope.viewerMediaInfo.location.latitude +','+ $scope.viewerMediaInfo.location.longitude + '&hl=es;z=14&output=embed'
            }
        }



    };


    angular.element('body').on('click', '#media-viewer-overlay, .close', function() {


        var $mediaViewer = angular.element('#media-viewer');



        var mediaViewerAnimation = {
            top: [$scope.mediaItemInfo.mediaItemPosition.top, '50%'],
            left: [$scope.mediaItemInfo.mediaItemPosition.left, '50%'],
            backgroundColor: ['rgb(255,255,255)', 'rgb(255,255,255)'],
            backgroundColorAlpha: [0, 1],
            rotateX: ['180deg', '180deg'],
            rotateY: ['180deg', '180deg'],
            rotateZ: ['225deg', '180deg'],
            translateZ: ['1px', '1px'],
            width: [$scope.mediaItemInfo.mediaWidth, '100%'],
            maxWidth: [$scope.mediaItemInfo.mediaWidth, '500px'],
            height: [$scope.mediaItemInfo.mediaHeight, '500px'],
            opacity: [0, 1]
        };

        var mediaViewerImageAnimation = {
            rotateZ: ['-45deg', '0deg'],
            height: ['150%', '500px'],
            width: ['150%', '500px'],
            top: [ '-1.8vw', 0],
            left: ['-1.8vw', 0]
        };

        if ($scope.isBigViewer) {
            mediaViewerAnimation.marginTop = ['5.1vw', '-250px'];
            mediaViewerAnimation.marginLeft = ['5.1vw', '-400px'];

            mediaViewerImageAnimation.top = ['-5.8vw', 0];
            mediaViewerImageAnimation.left = ['-5.8vw', 0];
        } else {
            mediaViewerAnimation.marginTop = ['2.3vw', '-250px'];
            mediaViewerAnimation.marginLeft = ['2.3vw', '-400px'];

            mediaViewerImageAnimation.top = ['-3.3vw', 0];
            mediaViewerImageAnimation.left = ['-3.3vw', 0];
        }




        $mediaViewer.velocity({
            maxWidth: ['500px', '800px']
        }, {
            duration: 400,
            easing: 'easeInExpo'
        }).find('.info').velocity({
            opacity: [0, 1]
        }, {
            duration: 400,
            complete: function() {
                $mediaViewer.velocity(mediaViewerAnimation, {
                    duration: 1000,
                    easing: 'easeOutExpo'
                }).find('.image').velocity(mediaViewerImageAnimation, {
                        duration: 500,
                        complete: function() {
                            console.log('complete');
                            $mediaViewer.velocity({
                                top: 0,
                                left: 0
                            })
                        }
                    });
            }
        });

        angular.element('#media-viewer-overlay').velocity('fadeOut', 500);

    });



    angular.element('#gallery-wrapper').on('click', '.media-item-wrapper:not(.main-square)', function() {


        $scope.mediaItemInfo.mediaItemPosition = angular.element(this).find('.media-item').offset();
        $scope.mediaItemInfo.mediaID = angular.element(this).find('.media-item').data('media-id');
        $scope.mediaItemInfo.mediaWidth= angular.element(this).css('width');
        $scope.mediaItemInfo.mediaHeight = angular.element(this).css('height');


        if (angular.element(this).hasClass('item-6') || angular.element(this).hasClass('item-7') || angular.element(this).hasClass('item-8')) {
            angular.element('#media-viewer').addClass('big');
            $scope.isBigViewer = true;
        } else {
            angular.element('#media-viewer').removeClass('big');
            $scope.isBigViewer = false;

        }


        $http.get('https://api.olapic.com/media/' + $scope.mediaItemInfo.mediaID + '?auth_token=0a40a13fd9d531110b4d6515ef0d6c529acdb59e81194132356a1b8903790c18&version=v2.2')
            .success(function(response) {
                $scope.viewerMediaInfo = response.data;

                $scope.showViewer();

            });
    });
});





