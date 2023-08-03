import {emailRegex, numberOnlyRegex, validNumberRegex} from "./constants";
import {isDateTimeInPast} from "./formatting";
import {clearInputs} from "./specificJavaScriptStuff";

const validateProfileDetails = (names: string[], email: string | null) => {

    document.getElementById("namesError")!.hidden = true
    document.getElementById("nameLengthError")!.hidden = true
    document.getElementById("emailError")!.hidden = true
    document.getElementById("takenEmailError")!.hidden = true

    let validDetails = true
    if (names.length !== 2) {
        document.getElementById("namesError")!.hidden = false
        document.getElementById("nameInput")!.focus()
        validDetails = false

    } else if (names[0].length > 64 || names[1].length > 64) {
        document.getElementById("nameLengthError")!.hidden = false
        document.getElementById("nameInput")!.focus()
        validDetails = false
    }
    if (!emailRegex.test(email || '')) {
        document.getElementById("emailError")!.hidden = false
        document.getElementById("emailInput")!.focus()
        validDetails = false
    }

    return validDetails;
}

const validateEditFilmData = (title: string, genreId: string, runtime: string, releaseDate: string, description: string) => {
    const isPast = isDateTimeInPast(releaseDate);
    let valid = true;

    document.getElementById("titleMinLimitEdit")!.hidden = true
    document.getElementById("titleMaxLimitEdit")!.hidden = true
    document.getElementById("titlePercentErrorEdit")!.hidden = true
    document.getElementById("titleDuplicateErrorEdit")!.hidden = true
    document.getElementById("runtimeLengthEdit")!.hidden = true
    document.getElementById("runtimeFormatEdit")!.hidden = true
    document.getElementById("descriptionError")!.hidden = true
    document.getElementById("releaseDateEditInPast")!.hidden = true

    if (genreId === undefined) {
        // @ts-ignore
        document.getElementById("genreInputEdit").style.borderColor = "red"
        valid = false
    }
    if (title.length === 0) {
        console.log("Nope")
        document.getElementById("titleMinLimitEdit")!.hidden = false
        document.getElementById("titleInputEdit")!.style.borderColor = "red"
        valid = false
    } else if (title.length > 64) {
        console.log("Nope2")
        document.getElementById("titleInputEdit")!.style.borderColor = "red"
        document.getElementById("titleMaxLimitEdit")!.hidden = false
        valid = false
    } else if (title.includes("%")) {
        console.log("Nope3")
        document.getElementById("titleInputEdit")!.style.borderColor = "red"
        document.getElementById("titlePercentErrorEdit")!.hidden = false
        valid = false
    }
    if (!validNumberRegex.test(runtime)) {
        document.getElementById("runtimeInputEdit")!.style.borderColor = "red"

        if (numberOnlyRegex.test(runtime)) {
            document.getElementById("runtimeLengthEdit")!.hidden = false
            document.getElementById("runtimeFormatEdit")!.hidden = true

        } else {
            document.getElementById("runtimeFormatEdit")!.hidden = false
            document.getElementById("runtimeLengthEdit")!.hidden = true

        }
        valid = false
    }
    if (releaseDate.length === 0 || isPast) {
        if (!(document.getElementById("releaseDateInputEdit") as HTMLInputElement).disabled) {
            // @ts-ignore
            document.getElementById("releaseDateInputEdit").style.borderColor = "red"
            document.getElementById("releaseDateEditInPast")!.hidden = false
            valid = false
        }
    }
    if (description.length > 512 || description === "") {
        // @ts-ignore
        document.getElementById("filmDescriptionEdit").style.borderColor = "red"
        document.getElementById("descriptionError")!.hidden = false

        valid = false
    }
    return valid
}

const validateFilmData = (title: string, genreId: string, runtime: string, releaseDate: string, description: string, pfp: ArrayBuffer | null) => {
    const isPast = isDateTimeInPast(releaseDate);
    clearInputs()
    let valid = true;
    if (genreId === undefined) {
        // @ts-ignore
        document.getElementById("genreInput").style.borderColor = "red"
        valid = false
    }
    if (title.length === 0) {
        document.getElementById("titleMinLimit")!.hidden = false
        document.getElementById("titleInput")!.style.borderColor = "red"
        valid = false
    } else if (title.length > 64) {
        document.getElementById("titleInput")!.style.borderColor = "red"
        document.getElementById("titleMaxLimit")!.hidden = false
        valid = false
    } else if (title.includes("%")) {
        document.getElementById("titleInput")!.style.borderColor = "red"
        document.getElementById("titlePercentError")!.hidden = false
        valid = false
    }
    if (!validNumberRegex.test(runtime)) {
        document.getElementById("runtimeInput")!.style.borderColor = "red"

        if (numberOnlyRegex.test(runtime)) {
            document.getElementById("runtimeLength")!.hidden = false
            document.getElementById("runtimeFormat")!.hidden = true

        } else {
            document.getElementById("runtimeFormat")!.hidden = false
            document.getElementById("runtimeLength")!.hidden = true

        }
        valid = false
    }
    if (releaseDate.length === 0 || isPast) {
        // @ts-ignore
        document.getElementById("releaseDateInput").style.borderColor = "red"
        document.getElementById("releaseDateInPast")!.hidden = false
        valid = false
    }
    if (pfp === null && (description.length > 512 || description === "")) {
        document.getElementById("filmDescription")!.style.borderColor = "red"
        document.getElementById("descriptionAndImageError")!.hidden = false
        valid = false
    } else if (pfp === null && !(description.length > 512 || description === "")) {
        document.getElementById("imageError")!.hidden = false
        valid = false
    } else if (pfp !== null && (description.length > 512 || description === "")) {
        document.getElementById("filmDescription")!.style.borderColor = "red"
        document.getElementById("descriptionError")!.hidden = false
        valid = false
    }

    return valid
}

export {validateProfileDetails, validateEditFilmData, validateFilmData}