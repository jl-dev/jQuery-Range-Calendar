$(document).ready(function () {
    var calendar = $("#calendar").rangeCalendar({
        lang: "es",
        startDate: moment(20160101, "YYYYMMDD"),
        endDate: moment(),
        start: "0",
        minRangeWidth: 1,
        maxRangeWidth: 1,
        maxTimeRangeWidth: 6,
        changeRangeCallback: rangeChanged
    });

    var today = new Date();

    calendar.setStartDate(today);

    function rangeChanged(target, range) {
        console.log(range);
    }
});