/**
 * j.keyboard.js
 * 前端软键盘插件
 * 调用Keyboard.initKeyboard(options)方法开始键盘功能的设置
 * options对象的属性：
 * fn : 设置Fn键的功能（可选）
 * confirm : 设置确定键的功能（可选）
 * left : 设置键盘的横坐标（可选）
 * top : 设置键盘的纵坐标（可选）
 * appendPlace : 键盘被添加到页面的哪个元素里，默认是body（可选）
 * defaultInput : 设置页面上默认反映键盘进行操作后的文本框，该文本框必须出现在inputs中（可选）
 * inputs : 设置页面上可接受该键盘输入的文本框（必须）
 * keyboardName : 设置第一次出现的键盘模式,默认是upperCaseKeyboard（upperCaseKeyboard：大写键盘，lowerCaseKeyboard：小写键盘，signKeyboard：特殊符号键盘）（可选）
 * 以下方法在键盘被初始化后可随时调用:
 * Keyboard.toggleKeyboard() : 切换键盘的显示与隐藏
 * Keyboard.showKeyboard() : 显示键盘
 * Keyboard.hideKeyboard() : 隐藏键盘
 * Keyboard.moveKeyboardTo(offset) : 根据offset的left和top属性，在水平方向上移动left距离，或在垂直方向上移动top距离
 * Keyboard.moveKeyboardBy(offset) : 在水平方向上将键盘移动到offset的left位置处，或在垂直方向上将键盘移动到offset的top位置处
 * @author : zk
 * @date : 2014/05/13
 *
 */
 (function() {

    var sKeyboardDiv = '<div class="keyboard">[keyboards]</div>';
    var ulNum = '<ul class="ulNum"><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li><li>7</li><li>8</li><li>9</li><li>0</li></ul>';
    var ulSign1 = '<ul class="ulSign1"><li>_</li><li>/</li><li>-</li><li>+</li><li>(</li><li>)</li><li>@</li><li>#</li><li>%</li><li>?</li></ul>';
    var ulSign2 = '<ul class="ulSign2"><li class="fn">Fn</li><li>*</li><li>:</li><li>;</li><li>,</li><li>.</li><li>。</li><li>!</li><li class="back"><img src="images/tb_del.png"></li></ul>';
    var upperLetter1 = '<ul class="UpperLetter1"><li>Q</li><li>W</li><li>E</li><li>R</li><li>T</li><li>Y</li><li>U</li><li>I</li><li>O</li><li>P</li></ul>';
    var upperLetter2 = '<ul class="UpperLetter2"><li>A</li><li>S</li><li>D</li><li>F</li><li>G</li><li>H</li><li>J</li><li>K</li><li>L</li></ul>';
    var upperLetter3 = '<ul class="UpperLetter3"><li class="shift uppercase" target="lowerCaseKeyboard"><img src="images/tb_shift_2.png"></li><li>Z</li><li>X</li><li>C</li><li>V</li><li>B</li><li>N</li><li>M</li><li class="back"><img src="images/tb_del.png"></li></ul>';
    var lowerLetter1 = '<ul class="LowerLetter1"><li>q</li><li>w</li><li>e</li><li>r</li><li>t</li><li>y</li><li>u</li><li>i</li><li>o</li><li>p</li></ul>';
    var lowerLetter2 = '<ul class="LowerLetter2"><li>a</li><li>s</li><li>d</li><li>f</li><li>g</li><li>h</li><li>j</li><li>k</li><li>l</li></ul>';
    var lowerLetter3 = '<ul class="LowerLetter3"><li class="shift lowercase" target="upperCaseKeyboard"><img src="images/tb_shift.png"></li><li>z</li><li>x</li><li>c</li><li>v</li><li>b</li><li>n</li><li>m</li><li class="back"><img src="images/tb_del.png"></li></ul>';
    var letterBottom = '<ul class="letterBottom"><li class="shift sign" target="signKeyboard">123!@#?</li><li class="space">空格</li><li class="confirm">确定</li></ul>';
    var ulNumBotton = '<ul class="ulNumBotton"><li class="sign letterShift">ABC</li><li class="space">空格</li><li class="confirm">确定</li></ul>';
    var keyboardLength = 0;
    var defaultLeft = 730;
    var defaultTop = 20;
    var space = ' ';
    var back = '$back$';
    var clickActiveDelay = 0.15;//按键按下后的延迟时间，单位:秒
    var currentKeyboard;
    var totalKeyboardArray = [];
    var $resultPlace;
    var $appendPlace;
    var options;
    var lastKeyboardName;//切换到符号键盘前，最后一次是大写键盘还是小写键盘
    var ieUserAgent = 'MSIE';
    var _fn;
    var _confirm;

    //定义空函数
    var noop = function() {
    };

    var setLastKeyboardName = function(name) {
        lastKeyboardName = name;
    };

    var getLastKeyboardName = function() {
        return lastKeyboardName;
    };

    //利用不同的ul来拼装键盘
    var createKeyboard = function(keyboardObj) {
        var name = keyboardObj.name;
        var array = keyboardObj.array;
        keyboardLength++;
        return '<div name="' + name + '" class="keyboardType ' + name + '">' + array.join('') + '</div>';
    };

    var upperCaseKeyboard = {
        name : 'upperCaseKeyboard',
        array : [upperLetter1, upperLetter2, upperLetter3, letterBottom]
    };
    var lowerCaseKeyboard = {
        name : 'lowerCaseKeyboard',
        array : [lowerLetter1, lowerLetter2, lowerLetter3, letterBottom]
    };
    var signKeyboard = {
        name : 'signKeyboard',
        array :[ulNum, ulSign1, ulSign2, ulNumBotton]
    };

    //目前支持大写、小写、特殊字符三种键盘模式
    totalKeyboardArray.push(createKeyboard(upperCaseKeyboard));
    totalKeyboardArray.push(createKeyboard(lowerCaseKeyboard));
    totalKeyboardArray.push(createKeyboard(signKeyboard));

    var finalKeyboardDiv = sKeyboardDiv.replace('[keyboards]', totalKeyboardArray.join(''));

    //切换键盘的显示与隐藏
    var toggleKeyboard = function() {
        $('.keyboard:hidden').length > 0 ? $('.keyboard').fadeIn() : $('.keyboard').fadeOut();
    };

    //显示键盘
    var showKeyboard = function() {
        $('.keyboard').show();
    };

    //隐藏键盘
    var hideKeyboard = function() {
        $('.keyboard').hide();
    };

    //调整键盘的位置
    var moveKeyboardTo = function(xy) {
        xy.left ? $('.keyboard').offset({left : xy.left}) : '';
        xy.top ? $('.keyboard').offset({top : xy.top}) : '';
    };

    var moveKeyboardBy = function(xy) {
        var offset = $('.keyboard').offset();
        xy.left ? $('.keyboard').offset({left : (offset.left + xy.left)}) : '';
        xy.left ? $('.keyboard').offset({top : (offset.top + xy.top)}) : '';
    };

    var updateText = (function() {

        var func;

        if (navigator.userAgent.indexOf(ieUserAgent) == -1) {
            func = function(currentVal, text) {
                var startIndex = $resultPlace[0].selectionStart;
                var endIndex = $resultPlace[0].selectionEnd;
                var offset = endIndex - startIndex;
                if (text == back) {//点击了退格键
                    if (startIndex == 0 && offset > 0 || startIndex > 0) {
                        var currentValArray = currentVal.match(/./g);;
                        if (!offset) {//没有select中一段文字的情况
                            startIndex = startIndex - 1;
                            offset = 1;
                        }
                        currentValArray.splice(startIndex, offset);
                        $resultPlace.val(currentValArray.join(''));
                    }
                } else {
                    var reg = new RegExp('(.{' + startIndex++ + '})');
                    $resultPlace.val(currentVal.replace(reg, '$1' + text));
                }
                $resultPlace.focus();
                $resultPlace[0].selectionStart = $resultPlace[0].selectionEnd = startIndex;
            };
        }

        return func;

    })();

    //点击键盘事件
    var clickKeyboard = function(e) {
            e.stopPropagation();
        try {
            var $this = $(this);
            $this.addClass('active');
            setTimeout(function() {
                $this.removeClass('active');
            }, 1000 * clickActiveDelay);
            if ($this.hasClass('shift')) {//是否点击了键盘切换按键：大小写，特殊符号
                var target = $this.attr('target');
                setLastKeyboardName($this.closest('div').attr('name'));
                $('.keyboardType').hide();
                $('.' + target).show();
                return false;
            }
            if ($this.hasClass('letterShift')) {//是否点击了符号键盘下的ABC
                var target = getLastKeyboardName();
                $('.keyboardType').hide();
                $('.' + target).show();
                return false;
            }
            if ($this.hasClass('confirm')) {//是否点击了确认
                _confirm();
                return false;
            }
            if ($this.hasClass('fn')) {//是否点击了功能键
                _fn();
                return false;
            }
            //未点击特殊功能按键
            var text = $this.text();
            var currentVal = $resultPlace.val();
            if ($this.hasClass('space')) {//是否点击了空格
                text = space;
            }
            if ($this.hasClass('back')) {//是否点击了退格键
                text = back;
            }
            updateText(currentVal, text);
        } catch (e) {
            console.log('error in clickKeyboard');
        }
    };

    //输入的input被focus的事件
    var inputFocus = function() {
        var $this = $(this);
        options.inputs.removeAttr('focused').removeClass('inputFocused');
        $this.attr('focused', 'focused').addClass('inputFocused');
        $resultPlace = $this;
    };

    var initKeyboard = function(config) {
        options = config;
        $appendPlace = options.appendPlace || $('body');
        var x = options.left || defaultLeft;
        var y = options.top || defaultTop;
        currentKeyboard = options.keyboardName || upperCaseKeyboard.name;
        //确定哪些input可以被键盘输入
        if (!options.inputs || !options.inputs.length) {
            console.log('没有传入接受键盘输入的input');
            return false;
        }
        options.inputs.focus(inputFocus);
        _fn = options.fn || noop;
        _confirm = options.confirm || noop;
        //默认focus的input
        setTimeout(function() {
            options.defaultInput ? (options.defaultInput[0]).focus() : (options.inputs[0]).focus();
        }, 0);
        $appendPlace.append(finalKeyboardDiv);//默认展开键盘1
        $('.keyboard').offset({left : x, top : y}).show();
        $('[name="' + currentKeyboard + '"]').show();
        $('.keyboard li').on('click', clickKeyboard);
    };

    //开放接口
    window.Keyboard = window.Keyboard || {};
    Keyboard.initKeyboard = initKeyboard;
    Keyboard.toggleKeyboard = toggleKeyboard;
    Keyboard.showKeyboard = showKeyboard;
    Keyboard.hideKeyboard = hideKeyboard;
    Keyboard.moveKeyboardTo = moveKeyboardTo;
    Keyboard.moveKeyboardBy = moveKeyboardBy;

})();
