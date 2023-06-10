class TimeUtil {
    constructor() {
    }
    static getElapsed() {
        return this.currentElapsedMS / 1000;
    }
    static getElapsedMS() {
        return this.currentElapsedMS;
    }
    static getTimeDifferenceMSMM(firstDate, secondDate) {
        var millisecondsDifference = Math.floor(this.getMillisecondsDifference(firstDate, secondDate));
        var secondsDifference = Math.floor(this.getSecondsDifference(firstDate, secondDate));
        var minutesDifference = Math.floor(this.getMinutesDifference(firstDate, secondDate));
        millisecondsDifference -= secondsDifference * 1000;
        secondsDifference -= minutesDifference * 60;
        return {
            minutes: minutesDifference,
            seconds: secondsDifference,
            milliseconds: millisecondsDifference
        };
    }
    static getSecondsDifference(firstDate, secondDate) {
        return (secondDate.getTime() / 1000) - (firstDate.getTime() / 1000);
    }
    static getMillisecondsDifference(firstDate, secondDate) {
        return secondDate.getTime() - firstDate.getTime();
    }
    static getMinutesDifference(firstDate, secondDate) {
        return this.getSecondsDifference(firstDate, secondDate) / 60;
    }
}