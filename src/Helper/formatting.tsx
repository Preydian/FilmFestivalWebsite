function isDateTimeInPast(dateTime: string): boolean {
    const inputDate = new Date(dateTime);
    const currentDate = new Date();
    return inputDate.getTime() < currentDate.getTime();
}

function formatNumber(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
}
function findTimeBetween(timestamp:string) {

    const date = new Date(timestamp);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();


    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    const years = Math.floor(months / 12);

    if (years > 0) {
        return `${years} years ago`;
    } else if (months > 0) {
        return `${months} months ago`;
    } else if (weeks > 0) {
        return`${weeks} weeks ago`;
    } else if (days > 0) {
        return `${days} days ago`;
    } else if (hours > 0) {
        return `${hours} hours ago`;
    } else if (minutes > 0) {
        return `${minutes} minutes ago`;
    } else {
        return `${seconds} seconds ago`;
    }
}

const openEditFilmFilePicker = () => {
    // @ts-ignore
    document.getElementById("filePickerEditFilm").click();
}

function getDaySuffix(day: number) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const relevantDigits = (day < 30) ? day % 20 : day % 30;
    const suffixIndex = (relevantDigits <= 3) ? relevantDigits : 0;
    return suffixes[suffixIndex];
}

function convertDateString(dayString: string) {
    const date = new Date(dayString);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const daySuffix = getDaySuffix(day);
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Format the hours and minutes to display AM/PM format
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const ampm = hours < 12 ? 'am' : 'pm';

    return `${day}${daySuffix} ${month} ${year} ${formattedHours}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

const convertRuntime = (runtime: string) => {

    const runtimeHours = runtime.trimEnd().trimStart().split(" ")[0].slice(0, -2)
    const runtimeMinutes = runtime.trimEnd().trimStart().split(" ")[1].slice(0, -1)
    return parseFloat(runtimeHours) * 60 + (parseFloat(runtimeMinutes))
}

export {isDateTimeInPast, formatNumber, findTimeBetween, convertDateString, openEditFilmFilePicker, convertRuntime}