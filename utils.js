/**
 * 
 * @param {string} time 
 */
function sanitizeTime(time) {
    let removedChineseTime = time.replace(/節/gm, "");
    let firstLeftBracket = removedChineseTime.indexOf("(");
    let firstTilde = removedChineseTime.indexOf("~");
    let startTime = removedChineseTime.substring(firstLeftBracket + 1, firstTilde);
    let lastRightBracket = removedChineseTime.lastIndexOf(")");
    let lastTilde = removedChineseTime.lastIndexOf("~");
    let endTime = removedChineseTime.substring(lastTilde + 1, lastRightBracket);

    return {
        startTime,
        endTime
    };
}

function sanitizedPeriod(period) {
    let removedChinesePeriod = period.replace(/節/gm, "");
    let tilde = removedChinesePeriod.indexOf("~");
    let startPeriod = removedChinesePeriod.substring(0, tilde);
    
    let endPeriod = removedChinesePeriod.substring(tilde + 1);
    if (tilde < 0) {
        startPeriod = endPeriod;
    }

    return {
        startPeriod,
        endPeriod
    };
}

export { sanitizeTime, sanitizedPeriod };