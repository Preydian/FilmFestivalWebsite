import React from "react";
import {APIUrl} from "./constants";

const mouseOn = () => {
    // @ts-ignore
    document.getElementById("imgProfile").style.filter = "brightness(70%)";
}
const mouseOff = () => {
    // @ts-ignore
    document.getElementById("imgProfile").style.filter = "brightness(100%)";
}

const openFilePicker = () => {
    // @ts-ignore
    document.getElementById("filePickerProfile").click();
}

const mouseOnEditFilm = () => {
    // @ts-ignore
    document.getElementById("editFilmImg").style.filter = "brightness(70%)";
}
const mouseOffEditFilm = () => {
    // @ts-ignore
    document.getElementById("editFilmImg").style.filter = "brightness(100%)";
}
const clearForEdit = () => {
    // @ts-ignore
    document.getElementById("nameInput").style.backgroundColor = "white"
    // @ts-ignore
    document.getElementById("emailInput").style.backgroundColor = "white"
    // @ts-ignore
    document.getElementById("nameInput").style.color = "#5e5e5e"
    // @ts-ignore
    document.getElementById("emailInput").style.color = "#5e5e5e"

    // @ts-ignore
    document.getElementById("editProfileBtn").style.display = "none"
}
const toggleLoginPasswordVisibility = () => {
    const passwordInput = document.getElementById("passwordInputLogin");
    // @ts-ignore
    if (passwordInput.type === "password") {
        // @ts-ignore
        passwordInput.type = "text";
    } else {
        // @ts-ignore
        passwordInput.type = "password";
    }
};

const toggleChangePasswordVisibility = () => {
    const newPasswordInput = document.getElementById("newPasswordInput");
    const oldPasswordInput = document.getElementById("oldPasswordInput");
    // @ts-ignore
    if (newPasswordInput.type === "password") {
        // @ts-ignore
        newPasswordInput.type = "text";
        // @ts-ignore
        oldPasswordInput.type = "text";
    } else {
        // @ts-ignore
        newPasswordInput.type = "password";
        // @ts-ignore
        oldPasswordInput.type = "password";
    }
};

const toggleRegisterPasswordVisibility = () => {
    const passwordInput = document.getElementById("passwordInputRegister");
    // @ts-ignore
    if (passwordInput.type === "password") {
        // @ts-ignore
        passwordInput.type = "text";
    } else {
        // @ts-ignore
        passwordInput.type = "password";
    }
};

const logout = () => {

    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('fileType')

}

function alignFilters() {

    const genreButton = document.getElementById("genreBtn");
    const resetBtn = document.getElementById("resetBtn");
    const firstCard = document.getElementById("film_0");
    if (genreButton && firstCard) {
        const cardRect = firstCard.getBoundingClientRect();
        genreButton.style.marginLeft = `${cardRect.left - 20}px`;
        // @ts-ignore
        resetBtn.style.marginRight = `${cardRect.left}px`;
    }
}

const stop = (event: React.MouseEvent<HTMLLabelElement, MouseEvent>) => {
    event.stopPropagation()
}

const reviewFilmModal = async (film: film) => {

    localStorage.setItem('reviewFilmId', film.filmId.toString())
    // @ts-ignore
    document.getElementById("toggleReviewModal").click()
}

function resizeDivs() {

    const infoDiv = document.getElementById('infoDiv');
    const imgDiv  = document.getElementById('imgImg');

    if (infoDiv!.offsetHeight > 0) {
        imgDiv!.style.height = infoDiv!.offsetHeight + "px"
    }
}

export {mouseOffEditFilm, mouseOnEditFilm, mouseOff, mouseOn, openFilePicker, clearForEdit, toggleLoginPasswordVisibility,
    toggleChangePasswordVisibility, toggleRegisterPasswordVisibility, logout, alignFilters, stop, reviewFilmModal,resizeDivs}