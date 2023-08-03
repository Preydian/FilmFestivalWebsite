
const mouseOn = () => {
    // @ts-ignore
    document.getElementById("registerImg").style.filter = "brightness(70%)";
}
const mouseOff = () => {
    // @ts-ignore
    document.getElementById("registerImg").style.filter = "brightness(100%)";
}

const mouseOnCreateFilm = () => {
    // @ts-ignore
    document.getElementById("createFilmImg").style.filter = "brightness(70%)";
}
const mouseOffCreateFilm = () => {
    // @ts-ignore
    document.getElementById("createFilmImg").style.filter = "brightness(100%)";
}
const openFilePicker = () => {
    // @ts-ignore
    document.getElementById("filePicker").click();
}
const openCreateFilmFilePicker = () => {
    // @ts-ignore
    document.getElementById("filePickerCreateFilm").click();
}

const clearImg = () => {
    // @ts-ignore
    document.getElementById("createFilmImg").setAttribute("src", "../defaultFilm.png")
}
const clearInputs = () => {

    document.getElementById("titleMaxLimit")!.hidden = true
    document.getElementById("titleMinLimit")!.hidden = true
    document.getElementById("titlePercentError")!.hidden = true
    document.getElementById("titleDuplicateError")!.hidden = true
    document.getElementById("runtimeLength")!.hidden = true
    document.getElementById("runtimeFormat")!.hidden = true
    document.getElementById("releaseDateInPast")!.hidden = true
    document.getElementById("descriptionError")!.hidden = true
    document.getElementById("imageError")!.hidden = true
    document.getElementById("descriptionAndImageError")!.hidden = true

    document.getElementById("genreInput")!.style.borderColor = "#E3E6ED"
    document.getElementById("titleInput")!.style.borderColor = "#E3E6ED"
    document.getElementById("runtimeInput")!.style.borderColor = "#E3E6ED"
    document.getElementById("releaseDateInput")!.style.borderColor = "#E3E6ED"
    document.getElementById("filmDescription")!.style.borderColor = "#E3E6ED"
}


function refreshPage(clickedFilm:number, selectedId: number) {

    if (clickedFilm !== selectedId) {
        let links = document.getElementsByTagName("a");
        for (let index = 0; index < links.length; index++) {
            // @ts-ignore
            if (links.item(index).href.slice(-9) === "#nav-film") {
                links.item(index)!.classList.add('active');
                document.getElementById("nav-film")!.classList.add('active');
                document.getElementById("nav-director")!.classList.remove('active');
                document.getElementById("nav-reviews")!.classList.remove('active');
                document.getElementById("nav-similar")!.classList.remove('active');
            } else {
                if (links.item(index)!.href.slice(-12) === "#nav-director") {
                    links.item(index)!.classList.add('active');
                    document.getElementById("nav-film")!.classList.remove('active');
                    document.getElementById("nav-director")!.classList.add('active');
                    document.getElementById("nav-reviews")!.classList.remove('active');
                    document.getElementById("nav-similar")!.classList.remove('active');
                } else {
                    if (links.item(index)!.href.slice(-10) === "#nav-reviews") {
                        links.item(index)!.classList.add('active');
                        document.getElementById("nav-film")!.classList.remove('active');
                        document.getElementById("nav-director")!.classList.remove('active');
                        document.getElementById("nav-reviews")!.classList.add('active');
                        document.getElementById("nav-similar")!.classList.remove('active');
                    } else {
                        if (links.item(index)!.href.slice(-10) === "#nav-similar") {
                            links.item(index)!.classList.add('active');
                            document.getElementById("nav-film")!.classList.remove('active');
                            document.getElementById("nav-director")!.classList.remove('active');
                            document.getElementById("nav-reviews")!.classList.remove('active');
                            document.getElementById("nav-similar")!.classList.add('active');
                        } else {
                            links.item(index)!.classList.remove('active');
                        }
                    }
                }
            }
        }
    }
}

export {mouseOn, mouseOff, mouseOffCreateFilm, mouseOnCreateFilm, openCreateFilmFilePicker, openFilePicker, clearImg, refreshPage, clearInputs}