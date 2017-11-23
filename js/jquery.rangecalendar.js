/**
 * jquery.rangecalendar.js v 1.0.2

 * Copyright 2013, Angelo Libero Mangieri
 * Email: angelo@afreeux.com
 *
 * jquery.rangecalendar.js v 1.1.0
 * Copyright 2017, José Luis Uc
 * Email: ucp.jose@gmail.com
 *
 */




;( function( $, window, undefined ) {

    $.fn.rangeCalendar = function(options) {

        var defaults = {

            lang: "en",
            theme: "default-theme",
            themeContext: this,
            startDate: moment(),
            endDate: moment().add('months', 12),
            start : "+7",
            startRangeWidth : 3,
            minRangeWidth: 1,
            maxRangeWidth: 14,
            weekends: true,
            autoHideMonths: false,
            visible: true,
            trigger: null,
            changeRangeCallback : function( el, cont, dateProp ) { return false; },
            //Define el minimo, maximo y rango de la linea del tiempo
            startTimeRangeWidth: 2,
            minTimeRangeWidth: 2,
            maxTimeRangeWidth: 4
        };

        this.each(function(i, el) {

            var obj = el,
                $el = $(el),
                settings = $.extend( true, {},defaults, options );
            obj.options = settings;

            obj.showCalendar = function(animate) {

                var calPos = obj.calendarObj.position();
                var lastItemPos = obj.calendarObj.find(".cell").last().position();
                var lastItemRight =  (lastItemPos.left + obj.calendarObj.find(".cell").last().outerWidth() );
                var selectedItemPos = obj.calendarObj.find(".cell").eq(0).position();

                $el.slideDown((animate ? 300 : 0), function() {

                    var windowWidth = $(window).outerWidth();
                    $(obj.calendarObj).css({left: windowWidth });
                    $(obj.monthsObj).css({left: windowWidth });

                    $(obj.timeObj).css({left: windowWidth});

                    obj._placeElement(obj.calendarObj,(!selectedItemPos ? 0 : selectedItemPos.left) );
                    obj._placeElement(obj.monthsObj);

                    obj._placeElement(obj.timeObj);
                });

                obj.visible = true;
            },
                obj.hideCalendar = function() {

                    $el.slideUp(50);
                    obj.visible = false;
                },
                obj.toggleCalendar = function () {

                    if(obj.visible)
                        obj.showCalendar();
                    else
                        obj.hideCalendar();
                },

                obj.rangeWidth = function(){

                    var cellWidth = obj.calendarObj.find(".cell").outerWidth();
                    var rangeWidth = parseInt(obj.calendarObj.find('.range-bar').outerWidth()/cellWidth);
                    obj._rangeWidth = ( !rangeWidth ? obj._rangeWidth : rangeWidth) ;

                    return obj._rangeWidth;
                },
                //Define rangeWidth para la linea del tiempo
                obj.timeRangeWidth = function () {
                    var cellWidth = obj.timeObj.find(".cell").outerWidth();
                    var rangeWidth = parseInt(obj.timeObj.find('.time-range-bar').outerWidth()/cellWidth);
                    obj._timeRangeWidth = ( !rangeWidth ? obj._timeRangeWidth : rangeWidth);

                    return obj._timeRangeWidth;
                },
                obj.setRangeWidth = function(rangeWidth) {

                    var cellWidth = obj.calendarObj.find(".cal-cell").eq(0).outerWidth();
                    var rangeWidth = parseInt(!rangeWidth || rangeWidth < obj.minRangeWidth ? obj.minRangeWidth : rangeWidth);
                    $el.find(".range-bar").width(cellWidth*rangeWidth);
                    $el.find(".range-bar").trigger("resize");
                },
                //Define setRangeWidth para la linea del tiempo
                obj.setTimeRangeWidth = function (rangeWidth) {
                    var cellWidth = obj.timeObj.find(".time-cell").eq(0).outerWidth();
                    var rangeWidth = parseInt(!rangeWidth || rangeWidth < obj.minTimeRangeWidth ? obj.minTimeRangeWidth : rangeWidth);
                    $el.find(".time-range-bar").width(cellWidth*rangeWidth);
                    $el.find(".time-range-bar").trigger("resize");
                },
                obj.range = function() {
                    var startDateIndex = obj.calendarObj.find('.cell.selected:eq(0)').index();
                    //var selectedDate = moment(obj.startDate.format()).add('days', startDateIndex);
                    var startDate = moment(obj.startDate.format()).add('days', startDateIndex);
                    var endDate = moment(obj.startDate.format()).add('days', startDateIndex);

                    //Obtiene la hora de inicio y final seleccionado
                    var startTime = obj.timeObj.find('.cell.selected:eq(0)')[0].textContent;
                    var endTime = obj.timeObj.find('.cell.selected').last()[0].textContent;

                    var startTimeSplit = startTime.split(':');
                    var startTimeMinutes = (+startTimeSplit[0]) * 60 + (+startTimeSplit[1]);

                    var endTimeSplit = endTime.split(':');
                    var endTimeMinutes = (+endTimeSplit[0]) * 60 + (+endTimeSplit[1]);

                    var start = startDate.add('m', startTimeMinutes);
                    var end = endDate.add('m', endTimeMinutes);

                    var startFormatted = start.format();
                    var endFormatted = end.format();

                    var range = $.data(obj, 'range', {
                        start: startFormatted,
                        end: endFormatted
                    });

                    return range;
                },

                obj.setStartDate = function(startDate) {

                    var date = moment(startDate);
                    var fullYear = date.format("YYYY");
                    var monthNumber = date.format("MM");
                    var dayNumber = date.format('D');
                    var dateId =  fullYear+monthNumber+dayNumber;
                    var monthId =  fullYear+monthNumber;

                    var dateCell = obj.calendarObj.find('.cell[date-id="'+dateId+'"]').eq(0);
                    dateCell.trigger("click");

                    var monthCell = obj.monthsObj.find('.cell[month-id="'+monthId+'"]').eq(0);
                    monthCell.trigger("click");
                },

                obj.lang = function (){
                    return obj.lang;
                },

                obj.setTheme = function (themeName){

                    var _themeName = $(obj.themeContext).attr("theme");

                    if(_themeName)
                        $(obj.themeContext).removeClass(_themeName);

                    $(obj.themeContext).attr("theme",""+themeName+"");
                    $(obj.themeContext).addClass(""+themeName+"");
                    obj.theme = themeName;
                },

                obj.update = function() {
                    moment.lang(obj.lang);
                    obj.setTheme(obj.theme);
                    obj._generateView();
                },

                //EVENTS
                obj.didResizeBar = function() {

                    var prevRangeWidth = obj.rangeWidth();
                    var rangeWidth = prevRangeWidth;
                    var resizeBarPos = obj.calendarObj.find('.range-bar').position();
                    var resizeBarWidth = obj.calendarObj.find('.range-bar').outerWidth();
                    var resizeBarRight = resizeBarPos.left+resizeBarWidth;
                    var cellWidth = $(obj).find(".cell").first().outerWidth();
                    var lastCellPos = $(obj).find(".cell").last().position();
                    var deltaWidth = 0;
                    var objWidth = (lastCellPos.left+cellWidth);

                    if(resizeBarRight > objWidth){

                        deltaWidth = objWidth-resizeBarWidth;
                        prevRangeWidth = (resizeBarWidth-deltaWidth)/cellWidth;
                    }


                    obj.calendarObj.find('.cell').removeClass("selected");
                    obj.calendarObj.find('.cell').removeClass("last");
                    obj.calendarObj.find('.cell.start').addClass("selected");
                    obj.calendarObj.find('.cell.start').nextAll().slice(0, (!rangeWidth ? obj.minRangeWidth-1 : rangeWidth-1)).addClass('selected');
                    obj.calendarObj.find('.cell.selected').last().addClass("last");
                    obj._dispatchEvent(obj.changeRangeCallback,obj.range(),obj);
                },
                //Define didResizeBar para la linea del tiempo
                obj.didResizeTimeBar = function () {
                    var prevRangeWidth = obj.timeRangeWidth();
                    var rangeWidth = prevRangeWidth;
                    var resizeBarPos = obj.timeObj.find('.time-range-bar').position();
                    var resizeBarWidth = obj.timeObj.find('.time-range-bar').outerWidth();
                    var resizeBarRight = resizeBarPos.left+resizeBarWidth;
                    var cellWidth = $(obj).find(".cell").first().outerWidth();
                    var lastCellPos = $(obj).find(".cell").last().position();
                    var deltaWidth = 0;
                    var objWidth = (lastCellPos.left+cellWidth);

                    if(resizeBarRight > objWidth){

                        deltaWidth = objWidth-resizeBarWidth;
                        prevRangeWidth = (resizeBarWidth-deltaWidth)/cellWidth;
                    }

                    obj.timeObj.find('.cell').removeClass("selected");
                    obj.timeObj.find('.cell').removeClass("last");
                    obj.timeObj.find('.cell.start').addClass("selected");
                    obj.timeObj.find('.cell.start').nextAll().slice(0, (!rangeWidth ? obj.minTimeRangeWidth-1 : rangeWidth-1)).addClass('selected');
                    obj.timeObj.find('.cell.selected').last().addClass("last");
                    obj._dispatchEvent(obj.changeRangeCallback,obj.range(),obj);
                },
                obj.didSelectMonth = function(e) {


                    if(obj.isDragging || $(obj.lastTarget).is(obj.monthsObj) ){

                        delete obj.lastTarget;
                        return;
                    }

                    var currentMonthId = $(this).attr("month-id");
                    var currentCellMonth = obj.calendarObj.find('.cell[month-id="'+currentMonthId+'"].selected').eq(0);
                    var monthPosition = (!currentCellMonth.length  ? obj.calendarObj.find('.cell[month-id="'+currentMonthId+'"]').eq(0).position() : currentCellMonth.position());
                    var calendarViewWidth = $($el).outerWidth();

                    obj.monthsObj.find('.cell').not(this).removeClass('selected');
                    $(this).addClass('selected');

                    obj._placeElement(obj.calendarObj,monthPosition);
                    obj._dispatchEvent(obj.changeRangeCallback,obj.range(),obj);

                },



                obj.didChangeRange = function(e,ui) {

                    if(obj.isDragging || $(obj.lastTarget).is(obj.calendarObj)){

                        delete obj.lastTarget;
                        return;
                    }
                    var rangeWidth = obj.rangeWidth();
                    var currentCalItem = $(this);
                    var lastCalItem = obj.calendarObj.find('.cell').last();
                    var delta = lastCalItem.index()-currentCalItem.index();

                    var rightBar  = currentCalItem.index()+rangeWidth-1;
                    if(rightBar > lastCalItem.index()){
                        obj.calendarObj.find(' .cell').eq(currentCalItem.index()-rangeWidth+delta+1).trigger("click");
                        return;
                    }

                    obj.calendarObj.find(".start").removeClass("start");
                    currentCalItem.addClass("start");

                    obj._updateRangeBar();
                    obj._updateMonths();
                    obj._dispatchEvent(obj.changeRangeCallback,obj.range(),obj);

                },

                //Define didChangeRange para la linea del tiempo
                obj.didChangeTimeRange = function (e, ui) {

                    if(obj.isDragging || $(obj.lastTarget).is(obj.timeObj)){

                        delete obj.lastTarget;
                        return;
                    }
                    var rangeWidth = obj.timeRangeWidth();
                    var currentCalItem = $(this);
                    var lastCalItem = obj.timeObj.find('.cell').last();
                    var delta = lastCalItem.index()-currentCalItem.index();

                    var rightBar  = currentCalItem.index()+rangeWidth-1;
                    if(rightBar > lastCalItem.index()){
                        obj.timeObj.find(' .cell').eq(currentCalItem.index()-rangeWidth+delta+1).trigger("click");
                        return;
                    }

                    obj.timeObj.find(".start").removeClass("start");
                    currentCalItem.addClass("start");

                    obj._updateRangeBar();
                    obj._updateTimeRangeBar();
                    obj._dispatchEvent(obj.changeRangeCallback,obj.range(),obj);
                },


                ///////////////////////////////////////////////////////*

                // PRIVATE METHODS


                obj._initRangeBar = function(){

                    $(window).unbind("resize"); //Prevents window.resize event triggering
                    var rangeWidth = obj.rangeWidth()  ;
                    var cellWidth = obj.calendarObj.find(".cell").eq(0).outerWidth();
                    var cellHeight = obj.calendarObj.find(".cell").eq(0).outerHeight();
                    var selectedCell = obj.calendarObj.find(".cell.selected:eq(0)");


                    if(!selectedCell.length)
                        return;


                    obj.calendarObj.find(".range-bar").unbind( "resize");
                    obj.calendarObj.find(".range-bar").remove();

                    $(selectedCell).append('<div class="range-bar resizable"><div class="range-bar-content"></div></div>');

                    if(obj.maxRangeWidth > 1){
                        obj.calendarObj.find(".range-bar").resizable({
                            grid:[cellWidth,0],
                            maxWidth: obj.maxRangeWidth*cellWidth,
                            minWidth: cellWidth*obj.minRangeWidth,
                            maxHeight:cellHeight,
                            minHeight:cellHeight,
                            handles: "e"
                        });
                    }


                    obj.setRangeWidth(rangeWidth);
                    obj.calendarObj.find(".range-bar").on( "resize", obj.didResizeBar);

                    $(window).bind("resize",obj._resize);

                },
                //Inicializa la barra para la linea del tiempo
                obj._initTimeRangeBar = function () {
                    $(window).unbind("resize"); //Prevents window.resize event triggering
                    var rangeWidth = obj.timeRangeWidth();
                    var cellWidth = obj.timeObj.find(".cell").eq(0).outerWidth();
                    var cellHeight = obj.timeObj.find(".cell").eq(0).outerHeight();
                    var selectedCell = obj.timeObj.find(".cell.selected:eq(0)");

                    if(!selectedCell.length)
                        return;


                    obj.timeObj.find(".time-range-bar").unbind( "resize");
                    obj.timeObj.find(".time-range-bar").remove();

                    $(selectedCell).append('<div class="time-range-bar resizable"><div class="time-range-bar-content"></div></div>');

                    if(obj.maxTimeRangeWidth > 1){
                        obj.timeObj.find(".time-range-bar").resizable({
                            grid:[cellWidth,0],
                            maxWidth: obj.maxTimeRangeWidth*cellWidth,
                            minWidth: cellWidth*obj.minTimeRangeWidth,
                            maxHeight:cellHeight,
                            minHeight:cellHeight,
                            handles: "e"
                        });
                    }

                    obj.setTimeRangeWidth(rangeWidth);
                    obj.timeObj.find(".time-range-bar").on( "resize", obj.didResizeTimeBar);

                    $(window).bind("resize",obj._resize);
                },
                obj._initMonths  = function() {



                    obj.monthsObj.draggable({

                        axis: "x" ,
                        scrollSensitivity: 100,
                        scrollSpeed: 100 ,
                        cursor: "move",

                        create: function (e, ui) {

                            obj._updateMonths();
                            obj._placeElement(obj.monthsObj);

                        },
                        start: function (e, ui) {

                            obj.isDragging = true;
                            obj.monthsObj.find('.cell').unbind("click");


                        },
                        drag: function (e, ui) {

                        },

                        stop: function(e, ui) {


                            $(this).css({top: 0});
                            obj.lastTarget = e.target;

                            setTimeout(function(){
                                obj.isDragging = false;
                                delete obj.lastTarget;
                                obj._placeElement(obj.monthsObj);
                                obj.monthsObj.find('.cell').bind("click",obj.didSelectMonth);
                            },10);
                        }
                    });

                },

                obj._initCalendar = function() {

                    var xpos;

                    obj.calendarObj.draggable({

                        axis: "x" ,
                        scrollSensitivity: 100,
                        scrollSpeed: 100 ,
                        cursor: "move",

                        create: function () {

                            obj.calendarObj.find('.cell').removeClass("selected");
                            obj.calendarObj.find('.cell').removeClass("last");
                            obj.calendarObj.find(".cell").eq(obj.start-1).addClass("start");
                            obj.calendarObj.find(".cell").eq(obj.start-1).addClass("selected");
                            obj.calendarObj.find('.cell.start').nextAll().slice(0, obj._rangeWidth-1).addClass('selected');
                            obj.calendarObj.find('.cell').bind("click",obj.didChangeRange);
                            obj.calendarObj.find('.cell.selected').last().addClass("last");

                            obj._placeElement(obj.calendarObj);
                        },
                        start: function(e, ui) {

                            xpos = ui.position.left;
                            $(window).unbind("resize"); //Prevents window.resize event triggering
                            obj.isDragging = true;
                            obj.calendarObj.find('.cell').unbind("click");
                        },
                        drag: function (e, ui) {

                            var xmove = ui.position.left - xpos;
                            var direction = xmove >= 0 ? 'right' : 'left';

                            var rangeCalendarWidth = $el.outerWidth();
                            var calendarOffset = obj.calendarObj.position();

                            var monthMaxId = parseInt(obj.monthsObj.find(".cell").last().attr("month-id"));
                            var monthMinId = parseInt(obj.monthsObj.find(".cell").first().attr("month-id"));

                            var currentMonthId = parseInt(obj.monthsObj.find(".cell.selected").attr("month-id"));
                            var nextMonthId = parseInt(obj.monthsObj.find(".cell.selected").next().attr("month-id"));
                            var prevMonthId = parseInt(obj.monthsObj.find(".cell.selected").prev().attr("month-id"));


                            if(nextMonthId && currentMonthId && nextMonthId <= monthMaxId && direction == "left") {

                                var nextMonthsCell = obj.monthsObj.find('.cell[month-id="'+nextMonthId+'"]');
                                var nextMonthCalendarCell = obj.calendarObj.find('.cell[month-id="'+nextMonthId+'"]').first();
                                var nextMonthCalendarCellPos = nextMonthCalendarCell.position();


                                var nextMonthLeftCenter = (rangeCalendarWidth/2 -(nextMonthCalendarCellPos.left )) ;

                                if( nextMonthLeftCenter >= calendarOffset.left && calendarOffset.left != 0){

                                    obj.monthsObj.find(".cell").removeClass("selected");
                                    $(nextMonthsCell).addClass("selected");
                                    obj._placeElement(obj.monthsObj,nextMonthsCell.position());
                                }

                            }
                            else if(prevMonthId && currentMonthId && prevMonthId >= monthMinId && direction == "right") {

                                var prevMonthCell = obj.monthsObj.find('.cell[month-id="'+prevMonthId+'"]');
                                var prevMonthCalendarCell = obj.calendarObj.find('.cell[month-id="'+prevMonthId+'"]').last();
                                var prevMonthCalendarCellPos = prevMonthCalendarCell.position();
                                var prevMonthLeftCenter = (rangeCalendarWidth/2 -(prevMonthCalendarCellPos.left )) ;

                                if(prevMonthLeftCenter <= calendarOffset.left+prevMonthCalendarCell.outerWidth() ) {

                                    obj.monthsObj.find(".cell").removeClass("selected");
                                    $(prevMonthCell).addClass("selected");

                                    obj._placeElement(obj.monthsObj,prevMonthCell.position());
                                }
                            }
                        },
                        stop: function(e, ui) {

                            //alert("Drag easing da inserire");
                            //var calendarOffset = obj.calendarObj.position();
                            //obj.calendarObj.animate({left: parseInt(calendarOffset.left)-100},300,'easeOutCirc');
                            obj.lastTarget = e.target;
                            obj._placeElement(obj.calendarObj);

                            setTimeout(function(){
                                obj.isDragging = false;
                                delete obj.lastTarget;

                                obj.calendarObj.find('.cell').bind("click",obj.didChangeRange);
                                $(window).bind("resize",obj._resize);
                                obj._placeElement(obj.monthsObj);
                            },100);

                        }
                    });
                },
                //Inicializa la linea del tiempo
                obj._initTimeline = function () {
                    var xpos;

                    obj.timeObj.draggable({
                        axis: "x",
                        scrollSensitivity: 100,
                        scrollSpeed: 100,
                        cursor: "move",

                        create: function () {
                            obj.timeObj.find('.cell').removeClass("selected");
                            obj.timeObj.find('.cell').removeClass("last");
                            obj.timeObj.find(".cell").eq(0).addClass("start");
                            obj.timeObj.find(".cell").eq(0).addClass("selected");
                            obj.timeObj.find('.cell.start').nextAll().slice(0, obj._timeRangeWidth-1).addClass('selected');
                            obj.timeObj.find('.cell').bind("click",obj.didChangeTimeRange);
                            obj.timeObj.find('.cell.selected').last().addClass("last");

                            obj._placeElement(obj.timeObj);
                        },
                        start: function (e, ui) {
                            xpos = ui.position.left;
                            $(window).unbind("resize");
                            obj.isDragging = true;
                            obj.timeObj.find('.cell').unbind("click");
                        },
                        drag: function (e, ui) {

                        },
                        stop: function (e, ui) {
                            obj.lastTarget = e.target;
                            obj._placeElement(obj.timeObj);

                            setTimeout(function(){
                                obj.isDragging = false;
                                delete obj.lastTarget;

                                obj.timeObj.find('.cell').bind("click",obj.didChangeTimeRange);
                                $(window).bind("resize",obj._resize);
                                obj._placeElement(obj.timeObj);
                            },100);
                        }
                    });
                },

                obj._getCalendarHTML = function(startDate,endDate) {

                    var calendarHtml = '';
                    var cell;
                    var date = moment(startDate).add('days', obj.start);
                    var endDate = moment(endDate).add('days', obj.start);
                    var rangeWidth = obj.rangeWidth();

                    for (var index = 1; (date.isBefore(endDate) || date.isSame(endDate)) ; index++){

                        var fullYear = date.format("YYYY");
                        var month = date.format("MMM");
                        var monthNumber = date.format("MM");
                        var day = date.format('ddd');
                        var dayNumber = date.format('D');
                        var isWeekend = date.day()%6==0;

                        if(isWeekend && !obj.weekends){
                            date.add('days', 1);
                            continue;
                        }

                        cell = '<div class="cal-cell cell" date-id="'+fullYear+monthNumber+dayNumber+'" month-id="'+fullYear+''+monthNumber+'" month="'+monthNumber+'">';
                        cell += '<div class="cell-content">';
                        cell += '<div class="day-number">'+dayNumber+'</div>';

                        cell += '<div class="day '+( isWeekend ? 'ferial' : '') +'">'+day+'</div>';
                        cell += '</div>';
                        cell += '</div>';

                        calendarHtml += cell;
                        date.add('days', 1);
                    }



                    return calendarHtml;
                },
                obj._getMonthsHTML = function(startDate,endDate) {

                    var monthsHtml = '';
                    var cell;
                    var date = moment(startDate).add('days', obj.start);
                    var endDate = moment(endDate).add('days', obj.start);
                    for (var index = 1; (date.isBefore(endDate) || date.isSame(endDate)) ; index++){

                        var year = date.format("YY");
                        var fullYear = date.format("YYYY");
                        var month = date.format("MMM");
                        var monthNumber = date.format("MM");

                        cell = '<div class="month-cell cell" month-id="'+fullYear+''+monthNumber+'" month="'+monthNumber+'">';
                        cell += '<i class="bullet"></i>';
                        cell += '<div class="date-formatted"><span class="month-name">'+month+'</span> '+year+'</span></div>';
                        cell += '</div>';

                        monthsHtml += cell;
                        date.add('month', 1);
                    }

                    return monthsHtml;
                },
                //Genera el html de la linea del tiempo
                obj._getTimeHTML = function () {
                    var timeHtml = '';
                    var cell;
                    var x = 15; //minutes interval
                    var times = []; // time array
                    var tt = 0; // start time
                    var ap = ['AM', 'PM']; // AM-PM

                    //loop to increment the time and push results in array
                    for (var i=0;tt<24*60; i++) {
                        var hh = Math.floor(tt/60); // getting hours of day in 0-24 format
                        var mm = (tt%60); // getting minutes of the hour in 0-55 format
                        if(hh < 10){
                            times[i] = ("0" + hh + ':' + ("0" + mm).slice(-2));
                        } else{
                            times[i] = (hh + ':' + ("0" + mm).slice(-2));
                        }
                        //times[i] = ("0" + (hh % 12)).slice(-2) + ':' + ("0" + mm).slice(-2) + ap[Math.floor(hh/12)]; // pushing data in array in [00:00 - 12:00 AM/PM format]
                        tt = tt + x;
                    }

                    for (var index = 0; index < times.length; index++){
                        cell = '<div class="time-cell cell">';
                        cell += '<div class="cell-content">';
                        cell += '<div class="hour-number">'+ times[index] +'</div>';
                        cell += '</div>';
                        cell += '</div>';
                        timeHtml += cell;
                    }

                    return timeHtml;
                },
                obj._updateMonths = function() {

                    var currentMonth = obj.calendarObj.find('.cell.selected:eq(0)').attr("month-id");
                    obj.monthsObj.find('.cell').removeClass('selected');
                    obj.monthsObj.find('.cell').removeClass('current');
                    obj.monthsObj.find('.cell[month-id="'+currentMonth+'"]').addClass('selected');
                    obj.monthsObj.find('.cell[month-id="'+currentMonth+'"]').addClass('current');
                },
                obj._updateRangeBar  = function() {

                    obj.didResizeBar();
                    obj._initRangeBar();
                },
                //Define updateRangeBar para la linea del tiempo
                obj._updateTimeRangeBar = function () {
                    obj.didResizeTimeBar();
                    obj._initTimeRangeBar();
                },
                obj._dispatchEvent = function (callback,options,el) {

                    if(!callback)
                        return false;

                    callback(el,options);
                },
                obj._placeElement = function (el) {

                    obj._placeElement(el,null);
                },
                obj._placeElement = function (el, position) {

                    var calendarViewWidth = $el.outerWidth();
                    var cellWidth = $(el).find(".cell").first().outerWidth();
                    var objChildrens = $(el).children().length;
                    var objWidth = (objChildrens*cellWidth);

                    var elPos =  $(el).position();
                    left = (  !position ? parseInt(elPos.left) :  -position.left);

                    if(calendarViewWidth > objWidth )
                        left = (calendarViewWidth-objWidth)/2;
                    else if (calendarViewWidth < objWidth && left >= 0)
                        left = 0 ;
                    else if(left < calendarViewWidth-objWidth)
                        left = -objWidth+calendarViewWidth;

                    $(el).stop().animate({left: left},300,'easeOutCirc');
                },
                obj._timedResize = function() {

                    clearTimeout(obj.resizeTimer);
                    obj.resizeTimer = setTimeout(obj._resize, obj.timeoutTime);
                },
                obj._bindEvents = function () {

                    if(obj.trigger){

                        $(obj.trigger).unbind("click");
                        $(obj.trigger).click(obj.toggleCalendar);
                    }

                    obj.timeout = false;
                    obj.timeoutTime = 100;

                    obj.calendarObj.find(".range-bar").on( "resize", obj.didResizeBar);
                    obj.monthsObj.find('.cell').bind("click",obj.didSelectMonth);

                    obj.timeObj.find(".time-range-bar").on("resize", obj.didResizeTimeBar);

                    $(window).bind('resize',obj._timedResize);

                    $el.hover(

                        function() {

                            if(obj.autoHideMonths)
                                obj.monthsObj.slideDown(100,'easeOutCirc');
                        },
                        function() {

                            if(obj.autoHideMonths)
                                obj.monthsObj.slideUp(0,'easeOutCirc');

                        }
                    );

                    $(obj).on('mousedown', '.range-bar', function (e) {


                        var topElement = document.elementFromPoint(e.clientX, e.clientY);
                        if($(topElement).hasClass('ui-resizable-handle')){

                            e.stopPropagation();
                            return false;
                        }

                    });

                    //Define mousedown para time-range-bar
                    $(obj).on('mousedown', '.time-range-bar', function (e) {


                        var topElement = document.elementFromPoint(e.clientX, e.clientY);
                        if($(topElement).hasClass('ui-resizable-handle')){

                            e.stopPropagation();
                            return false;
                        }

                    });


                    $(obj).on('mouseup', '.range-bar', function (e) {

                        if($(obj).find('.range-bar').hasClass('ui-resizable-resizing'))
                            return true;

                        $(this).hide();
                        var BottomElement = document.elementFromPoint(e.clientX, e.clientY);
                        $(this).show();

                        $(BottomElement).trigger('click'); //Manually fire the event for desired underlying element
                        return true;
                    });

                    //Define mouseup para time-range-bar
                    $(obj).on('mouseup', '.time-range-bar', function (e) {

                        if($(obj).find('.time-range-bar').hasClass('ui-resizable-resizing'))
                            return true;

                        $(this).hide();
                        var BottomElement = document.elementFromPoint(e.clientX, e.clientY);
                        $(this).show();

                        $(BottomElement).trigger('click'); //Manually fire the event for desired underlying element
                        return true;
                    });

                },

                obj._resize = function(){


                    obj._placeElement(obj.calendarObj);
                    obj._placeElement(obj.monthsObj);

                    obj._placeElement(obj.timeObj);
                    obj.timeout = false;

                },

                obj._updateView = function (startDate,endDate){

                    obj.calendarObj.append(obj._getCalendarHTML(startDate,endDate));
                    obj.monthsObj.append(obj._getMonthsHTML(startDate,endDate));
                    //Agrega el html de la linea del tiempo
                    obj.timeObj.append(obj._getTimeHTML());

                    if(obj.visible){
                        $el.css({display:"block"});
                        obj.showCalendar();
                    }
                    else
                        $el.css({display:"none"});

                    obj._initCalendar();
                    obj._initMonths();
                    //Inicializa la linea del tiempo
                    obj._initTimeline();

                    obj._initRangeBar();
                    //Inicializa la barra de la linea del tiempo
                    obj._initTimeRangeBar();

                },
                obj._generateView = function () {

                    var mainClass = "range-calendar";

                    $el.removeClass(mainClass)
                    $el.addClass(mainClass);
                    $el.empty();

                    obj.monthsObj = $('<div class="wrapper"><div class="months"></div></div>');
                    $el.append( obj.monthsObj );
                    obj.monthsObj = obj.monthsObj.find(".months");
                    (obj.autoHideMonths ?  obj.monthsObj.addClass("auto-hide-months") : '');

                    obj.calendarObj = $('<div class="wrapper"><div class="calendar"></div></div>');
                    $el.append( obj.calendarObj );
                    obj.calendarObj = obj.calendarObj.find(".calendar");

                    //Define obj.time
                    obj.timeObj = $('<div class="wrapper"><div class="timeline"></div></div>');
                    $el.append(obj.timeObj);
                    obj.timeObj = obj.timeObj.find(".timeline");

                    obj._updateView(obj.startDate,obj.endDate);
                    obj._bindEvents();
                    obj._dispatchEvent(obj.changeRangeCallback,obj.range(),obj);
                },

                obj._init = function( element,options ) {

                    obj.themeContext = options.themeContext;
                    obj.lang  = options.lang ;
                    obj.isDragging = false;
                    obj.minRangeWidth = options.minRangeWidth;
                    obj.maxRangeWidth = options.maxRangeWidth;

                    //Define max y min timeRangeWIdth
                    obj.minTimeRangeWidth = options.minTimeRangeWidth;
                    obj.maxTimeRangeWidth = options.maxTimeRangeWidth;

                    obj.weekends = options.weekends;
                    obj.startDate = options.startDate;
                    obj.endDate = options.endDate;
                    obj.start = (!options.start ? "+7" : parseInt(options.start)) ;
                    obj.startRangeWidth = ( options.startRangeWidth > options.maxRangeWidth ? options.maxRangeWidth : options.startRangeWidth);
                    obj._rangeWidth = obj.startRangeWidth;
                    obj.trigger = options.trigger;
                    obj.visible = options.visible;
                    obj.changeRangeCallback = options.changeRangeCallback;
                    obj.autoHideMonths = options.autoHideMonths ;

                    //Inicializa los rangos de la linea del tiempo
                    obj.startTimeRangeWidth = ( options.startTimeRangeWidth > options.maxTimeRangeWidth ? options.maxTimeRangeWidth : options.startTimeRangeWidth);
                    obj._timeRangeWidth = obj.startTimeRangeWidth;

                    obj.theme = (options.theme ? options.theme : defaults.theme );
                    obj.update();
                },

                obj._init(el,obj.options);
            $(obj).data('rangeCalendar', obj );
        });

        return this.data("rangeCalendar");
    };

} )( jQuery, window );