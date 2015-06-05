/**
 * jquery.easyBanner.js
 * @author    HappyFreeLife
 * @version   1.1.10
 * @url       https://github.com/happyfreelife/easyBanner/
 */

;(function ($, window, document, undefined) {
    // easyBanner对象的简写变量
    var E = $.easyBanner = {};

    // easyBanner文件的路径
    E.scriptPath = (function (scripts, i, self) {
        // 使用脚本加载器加载本文件，则调用下面的方法查找文件自身
        for (var i in scripts) {
            if (scripts[i].src && scripts[i].src.indexOf('jquery.easyBanner') > -1) {
                self = scripts[i];
                break;
            }
        }
        return self.src.substring(0, self.src.lastIndexOf('/') + 1);
    }(document.scripts));

    /**
     * 脚本加载器
     * @param  {String}   src      外部脚本路径
     * @param  {Function} callback 脚本加载完成后执行的函数
     */
    E.loadScript = function(src, callback) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = E.scriptPath + src;

        if (/msie (6.0|7.0|8.0)/i.test(navigator.userAgent)) {
            script.onreadystatechange = function() {
                if (script.readyState === 'loaded' || script.readyState === 'complete') {
                    callback();
                }
            };
        } else {
            script.onload = callback;
        }

        document.getElementsByTagName('head')[0].appendChild(script);
    }

    /**
     * 样式检测器
     * @param  {String} prop css属性名
     * @param  {String || Array} val  css属性值
     * @return {Boolean}
     */
    $.fn.cssDetector = function(prop, val) {
        if ($.isArray(val)) {
            for (var i in val) {
                if ($(this).css(prop) === val[i]) {
                    return true;
                }
            }
            return false;
        }
        return $(this).css(prop) === val;
    };

    /**
     * 插件主方法
     * @param  {Object} option    自定义参数
     * @return {HTMLElement}      调用该方法的元素集合中的每个元素
     */
    $.fn.easyBanner = function(option) {
        var defaults = {
            animation: 'slide',    // 动画模式: ['slide', 'fade']
            trigger  : 'click',    // 触发动画的事件类型: ['click', 'hover']
            arrowBtn : true,       // 左右箭头按钮
            serialBtn: true,       // 序列按钮[true, false, 'equal', 'thumb']
            autoPlay : true,       // 自动轮播
            speed    : 800,        // 动画速度
            interval : 5000        // 自动轮播间隔
        },
        options = $.extend(defaults, option || {});

        return this.each(function() {
            var self  = this,
                $this = $(this),
                $list = $this.children(),
                $item = $list.children(),
                len   = $item.length,
                animation,
                $arrowBtnWrap,
                $arrowBtn,
                $serialBtnList,
                $serialBtn,
                $thumbList,
                $thumb,
                $thumbImg,
                currentIndex = 0,
                activeIndex = 0,
                embeddedStyle = '';

            // 判断浏览器是否支持CSS3动画
            var isSupportTransition = 'transition' in document.documentElement.style;

            /**
             * 图片转换为背景图片
             */
            function imageConvert() {
                // 根据data-src自动开启Preload
                if ($item.find('img[data-src]').length === len) {
                    $item.each(function() {
                        var url = $(this).find('img').data('src');
                        $(this).attr('data-src', url).data('url', url).children('img').remove();
                    });
                    imgPreLoader(currentIndex);
                } else {
                    $item.each(function() {
                        var url = $(this).find('img').attr('src');
                        $(this).css('background-image', 'url(' + url + ')').data('url', url).children('img').remove();
                    });
                }
            }

            /**
             * 轮播列表初始化
             */
            function init() {
                if (isSupportTransition) {
                    embeddedStyle +=
                        '.transition-' + options.speed + '{'
                    +        'transition: all ' + options.speed + 'ms ease;'
                    +        '-webkit-transition: all ' + options.speed + 'ms ease;'
                    +    '}\n';
                }

                $list.hovered = false;

                $list.wrap('<div class="wrap-list">').parent().css({
                    position: 'relative',
                    width   : '100%',
                    height  : '100%',
                    overflow: 'hidden'
                });

                $list.css({
                    position: 'relative',
                    display : 'block',
                    height  : '100%'
                });

                $item.css({
                    display: 'block',
                    width  : $this.width(),
                    height : $this.height(),
                    'background-repeat': 'no-repeat',
                    'background-position': 'center top'
                });
                

                E.loadScript('module-animation.js', function() {
                    
                });

                if ($this.cssDetector('position', 'static')) {
                    $this.css('position', 'relative')
                }

                switch(options.animation) {
                    case 'fade':
                        embeddedStyle += '.top-item{z-index: 10;}\n';

                        $item.css({
                            position: 'absolute',
                            left    : 0,
                            top     : 0
                        });
                        $item.first().siblings().css('opacity', 0);
                        break;

                    case 'slide':
                        $list.css({
                            left : 0,
                            width: (len + 1) * 100 + '%'
                        });

                        $item.css({
                            float: 'left',
                            width: $this.css('width')
                        });
                        $item.first().clone().appendTo($list);
                        $item.first().show().siblings().hide();
                        break;
                }

                $(window).resize(function() {
                    $list.children().css('width', $this.width() + 'px');
                });
            }

            /**
             * 图片预加载器(延迟加载)
             * @param  {Number} loadingIndex 当前正在加载的图片序号
             */
            function imgPreLoader(loadingIndex) {
                // 只能预加载一张图片
                if (loadingIndex - currentIndex > 1) { return; }

                function preload() {
                    $loadingItem.removeClass();

                    if (loadingIndex) {
                        $loadingItem.css({
                            display: 'none',
                            'background-image': 'url(' + loadingItemSrc + ')'
                        }).fadeIn(300);
                    }

                    imgPreLoader(loadingIndex++);
                }

                var img = new Image(),
                    $loadingItem = $item.eq(loadingIndex),
                    loadingItemSrc = $loadingItem.attr('data-src');

                if (loadingItemSrc) {
                    $loadingItem.removeAttr('data-src');

                    // 不对第1张图片设置loading动画
                    if (!loadingIndex) {
                        $loadingItem.css('background-image', 'url(' + loadingItemSrc + ')');
                    } else {
                        $loadingItem.addClass('loading');
                    }

                    img.src = loadingItemSrc;
                    img.complete ? preload() : img.onload = preload;
                }
            }

            /**
             * 添加箭头按钮
             */
            function addArrowBtn() {
                $this.append(
                    '<div class="btn-arrow">'
                +       '<a class="prev" style="float: left;"></a>'
                +       '<a class="next" style="float: right;"></a>'
                +   '</div>'
                );

                $arrowBtnWrap = $('.btn-arrow', $this);
                $arrowBtn = $arrowBtnWrap.children();

                if ($arrowBtnWrap.width() === $this.width()) {
                    $arrowBtnWrap.css('width', '96%')
                }

                if ($arrowBtnWrap.cssDetector('top', 'auto') && $arrowBtnWrap.cssDetector('bottom', 'auto')) {
                    $arrowBtnWrap.css({
                                top : '50%',
                        'margin-top': -$arrowBtn.height() / 2
                    });
                }
                if ($arrowBtnWrap.cssDetector('left', 'auto') && $arrowBtnWrap.cssDetector('right', 'auto')) {
                    $arrowBtnWrap.css('margin-left', ($this.width() - $arrowBtnWrap.width()) / $this.width() / 2 * 100 + '%');
                }

                if ($arrowBtn.cssDetector('background-image', 'none')) {
                    $('.prev', $arrowBtnWrap).html('&lt;');
                    $('.next', $arrowBtnWrap).html('&gt;');

                    $arrowBtn.css({
                        'line-height': $arrowBtn.height() + 'px',
                        'font-size'  : $this.height() * 0.133 + 'px',
                        'font-family': 'SimHei',
                        'text-align' : 'center',
                        'user-select': 'none',
                               cursor: 'pointer',
                                color: '#fff'
                    });
                }

                $arrowBtnWrap.appendTo($this).css({
                    position :'absolute',
                    'z-index': 20,
                    height   : 0
                });

                arrowBtnHandler();
            }

            /**
             * 添加序列按钮
             */
            function addSerialBtn() {
                for (var i = 0, item = ''; i < len; i++) {
                    item += '<li></li>';
                }
                $this.append('<ul class="btn-serial">' + item + '</ul>');
                $serialBtnList = $('.btn-serial', $this);
                $serialBtn = $serialBtnList.children();

                $serialBtn.css('float', 'left');
                if ($serialBtn.cssDetector('width', '0px') && $serialBtn.cssDetector('height', '0px')) {
                    $serialBtn.css({width: '10px', height: '10px'});
                }

                if ($serialBtn.cssDetector('margin', ['0px', ''])) {
                    $serialBtn.css('margin', '0 5px');
                }

                if ($serialBtn.cssDetector('background-color', ['rgba(0, 0, 0, 0)', 'transparent']) &&
                    $serialBtn.cssDetector('background-image', 'none')) {
                    embeddedStyle += '.btn-serial > *{background-color: #fff;border-radius: 50%;}\n' +
                                '.btn-serial > .active{background-color: #ff8000;}\n';
                }

                if ($serialBtnList.cssDetector('top', 'auto') && $serialBtnList.cssDetector('bottom', 'auto')) {
                    $serialBtnList.css('bottom', $this.height() * 0.04);
                }

                if ($serialBtnList.cssDetector('left', 'auto') && $serialBtnList.cssDetector('right', 'auto')) {
                    $serialBtnList.css({
                        left: '50%',
                        'margin-left': -$serialBtn.outerWidth(true) * len / 2
                    });
                }

                $serialBtnList.appendTo($this).css({
                    position :'absolute',
                    'z-index': 20
                }).children(':first').addClass('active');

                serialHandler.call($serialBtn);
            }

            /**
             * 添加缩略图
             */
            function addThumb() {
                for (var i = 0, item = ''; i < len; i++) {
                    item += '<li>' + '<img src="' + $item.eq(i).data('url') + '">' + '</li>';
                }
                $this.append('<div class="wrap-thumb"><ul>' + item + '</ul></div>');

                $thumbList = $('.wrap-thumb ul', $this);
                $thumb = $thumbList.children();
                $thumbImg = $thumb.children();
                
                $thumb.css({
                    float : 'left',
                    overflow: 'hidden',
                    cursor: 'pointer'
                });

                $thumbImg.hide();
                if (!$thumb.cssDetector('height', '0px')) {
                    $thumbImg.height($thumb.height());
                } else {
                    $thumbImg.height($this.height() * 0.125);
                }

                if (!$thumb.cssDetector('width', '0px')) {
                    $thumbImg.css({
                        position     : 'relative',
                        left         : '50%',
                        'margin-left': -$thumbImg.outerWidth() / 2
                    });
                }
                $thumbImg.show();

                if ($thumbList.cssDetector('top', 'auto') && $thumbList.cssDetector('bottom', 'auto')) {
                    $thumbList.css('bottom', $this.height() / 25);
                }

                if ($thumbList.cssDetector('left', 'auto') && $thumbList.cssDetector('right', 'auto')) {
                    $thumbList.css({
                        left: '50%',
                        'margin-left': -$thumb.outerWidth(true) * len / 2
                    });
                }

                $thumbList.css({
                    position :'absolute',
                    'z-index': 20
                }).children(':first').addClass('active');

                serialHandler.call($thumb);
            }

            /**
             * banner容器hover事件处理器
             */
            function bannerHoverHandler() {
                $this.hover(function() {
                    $list.hovered = true;
                    clearInterval(self.playTimer);
                }, function() {
                    $list.hovered = false;
                    if (!$list.animating) { setPlayTimer(); }
                });
            }

            /**
             * 箭头按钮事件处理器
             */
            function arrowBtnHandler() {
                $arrowBtn.on({
                    click: function() {
                        if ($list.animating) { return; }
                        $(this).hasClass('prev') ? currentIndex-- : currentIndex++;   
                        play();
                    },

                    // 阻止连续点击箭头按钮时选中按钮
                    selectstart: function() { return false; }
                });
            }

            /**
             * 序列按钮和缩略图事件处理器
             */
            function serialHandler() {
                if (options.trigger === 'click') {
                    $(this).on('click', function() {
                        if ($list.animating) { return; }
                        currentIndex = $(this).index();
                        play();
                    });
                }

                if (options.trigger === 'hover') {
                    $(this).on('mouseenter', function() {
                        if ($list.animating) { return; }
                        currentIndex = $(this).index();
                        play();
                    });
                }
            }

            /**
             * 轮播动画
             * determineIndex    判定索引是否溢出
             * active            序列按钮和缩略图当前项高亮
             * thumbScroll       缩略图滚动
             * none              动画 - 无效果
             * fade              动画 - 淡入淡出
             * slide             动画 - 滑动
             * fadeComplete      fade动画的回调函数
             * slideComplete     slide动画的回调函数 
             */
            animation = {
                determineIndex: function() {
                    activeIndex =
                    currentIndex = 
                    currentIndex === len ? 0 : currentIndex === -1 ? len - 1 : currentIndex;
                },

                active: function() {
                    this.determineIndex();

                    if (options.serialBtn === true) {
                        $serialBtn.eq(activeIndex).addClass('active').siblings().removeClass('active');
                    }

                    if (options.serialBtn === 'thumb') {
                        $thumb.eq(activeIndex).addClass('active').siblings().removeClass('active');
                    }
                },

                thumbScroll: function() {
                    
                },

                none: function() {
                    this.determineIndex();
                    $item.eq(currentIndex).show().siblings().hide();
                    this.active();
                },

                fade: function() {
                    this.determineIndex();

                    $list.animating = true;

                    $item.removeClass().eq(currentIndex).addClass('top-item').css('opacity', 0);

                    if (isSupportTransition) {
                        $item.eq(currentIndex).addClass('transition-' + options.speed).css('opacity', 1);
                        setTimeout(animation.fadeComplete, options.speed);
                    } else {
                        $item.eq(currentIndex).animate({
                            opacity: 1
                        }, {
                            duration: options.speed,
                            complete: animation.fadeComplete
                        })
                    }

                    this.active();

                    imgPreLoader(currentIndex);
                },

                slide: function() {
                    var $item = $list.children(),
                        lastIndex = $list.data('lastIndex'),
                        slideDirection = 'left';

                    if (currentIndex === lastIndex){ return; }

                    clearInterval(self.playTimer);

                    if (currentIndex < lastIndex) {
                        slideDirection = 'right';
                    }

                    // first item >> last item
                    if (currentIndex < 0) {
                        currentIndex = len - 1;
                        $item.eq(len).show().siblings().hide();
                        slideDirection = 'right';
                    }

                    // first item >> last item
                    if (currentIndex > len) {
                        currentIndex = 1;
                        slideDirection = 'left';
                    }

                    if (slideDirection === 'right') {
                        $list.css('left', '-100%');
                    }

                    $item.eq(currentIndex).show();

                    // 使用CSS3 Transition进行动画过渡
                    // 相对于jQuery的animate执行的动画，可以大幅度提升流畅度
                    if (isSupportTransition) {
                        setTimeout(function() {
                            $list.animating = true;
                            $list.css('left', slideDirection === 'left' ? '-100%' : 0)
                            .addClass('transition-' + options.speed);

                            setTimeout(animation.slideComplete, options.speed - 20);
                        }, 20);
                    } else {
                        $list.animating = true;
                        $list.animate({
                            left: slideDirection === 'left' ? '-100%' : 0
                        }, {
                            duration: options.speed,
                            complete: animation.slideComplete
                        })
                    }

                    this.active();

                    imgPreLoader(currentIndex);
                },

                fadeComplete: function() {
                    $list.animating = false;
                    $item.eq(currentIndex).siblings().css('opacity', 0);
                    if (options.autoPlay && !$list.hovered) { setPlayTimer(); }
                },
                
                slideComplete: function() {
                    if (currentIndex === len) {
                        $item.first().show().siblings().hide();
                        currentIndex = 0;
                    }

                    $list.animating = false;
                    $list.css('left', 0).removeClass();
                    $list.data('lastIndex', currentIndex);

                    $item.eq(currentIndex).show().siblings().hide();

                    if (options.autoPlay && !$list.hovered) { setPlayTimer(); }
                }
            };

            /**
             * 轮播切换
             */
            function play() {
                animation[options.animation]();
            }

            /**
             * 设置自动播放的定时器
             */
            function setPlayTimer() {
                clearInterval(self.playTimer);
                self.playTimer = setInterval(function() {
                    currentIndex++;
                    play();
                }, options.interval);
            }

            (function() {
                imageConvert();
                init();
                bannerHoverHandler();
                
                if (len <= 1) { return; }
                if (options.arrowBtn) { addArrowBtn(); }
                if (options.serialBtn === true) { addSerialBtn(); }
                if (options.serialBtn === 'thumb') { addThumb(); }
                if (options.autoPlay) { setPlayTimer(); }

                $('head').append('<style type="text/css">' + embeddedStyle + '</style>');
            }());
        });
    };
})(jQuery, window, document);
