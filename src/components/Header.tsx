import React, {useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import Select, {SingleValue} from "react-select";
import {myAgeRatingSelect, myGenres, APIUrl, myGenresSelect, emailRegex, passwordRegex, runtimeRegex, nameRegex, letterAndNumberOnlyRegex, numberOnlyRegex, ageRatings} from "../Helper/constants";
import {toggleLoginPasswordVisibility, toggleChangePasswordVisibility, toggleRegisterPasswordVisibility, logout} from "../Helper/javaScriptStuff";
import {mouseOnCreateFilm, mouseOffCreateFilm, openCreateFilmFilePicker, openFilePicker, mouseOff, mouseOn, clearImg, clearInputs} from "../Helper/specificJavaScriptStuff";
import {validateFilmData} from "../Helper/validation";
import {convertRuntime, formatNumber} from "../Helper/formatting";
function Header() {

    const navigate = useNavigate();
    const [errorMessageLogin, setErrorMessageLogin] = React.useState("");
    const [errorMessageRegister, setErrorMessageRegister] = React.useState("");
    const [errorMessageCreateFilm, setErrorMessageCreateFilm] = React.useState("");
    const [errorMessageChangedPassword, setErrorMessageChangedPassword] = React.useState("");
    const [successMessageCreateFilm, setSuccessMessageCreateFilm] = React.useState("");
    const [successMessageChangedPassword, setSuccessMessageChangedPassword] = React.useState("");
    const [pfp, setProfilePicture] = React.useState<ArrayBuffer | null> (null);
    const [selectedGenre, setSelectedGenre] = useState<SingleValue<{ value: number; label: string; } | null>>();
    const [selectedAgeRating, setSelectedAgeRating] = useState<SingleValue<{ value: number; label: string; } | null>>();

    const ageRatingIndex: { [key: string]: number } = {};
    myAgeRatingSelect.forEach((option, index) => {
        ageRatingIndex[option.label] = index;
    });

    const handleButtonClick = () => {
        // @ts-ignore
        let newQuery = document.getElementById("searchQuery").value;
        if (!letterAndNumberOnlyRegex.test(newQuery)) {
            navigate(`/films?startIndex=0&count=10`);
        } else {
            navigate(`/films?startIndex=0&count=10&q=${newQuery}`);
        }
    }

    const checkSubmit = (event: React.KeyboardEvent<HTMLDivElement>, type: string) => {

        if (event.code === "Enter") {
            if (type === "login") {
                login()
            } else {
             register()
            }
        }
    }

    const clearChangePassword = () => {

        // @ts-ignore
        document.getElementById("oldPasswordInput").value = ""
        // @ts-ignore
        document.getElementById("newPasswordInput").value = ""
        setSuccessMessageChangedPassword("Password updated")
    }

    const changePassword = () => {

        setErrorMessageChangedPassword("")
        setSuccessMessageChangedPassword("")

        const oldPasswordInput = document.getElementById("oldPasswordInput")
        const newPasswordInput = document.getElementById("newPasswordInput")

        // @ts-ignore
        const oldPassword = oldPasswordInput.value
        // @ts-ignore
        const newPassword = newPasswordInput.value

        const updatedData = {
            password: newPassword,
            currentPassword: oldPassword,
        };

        axios.patch(`${APIUrl}/users/${localStorage.getItem('userId')}`, updatedData, {
            headers: {
                'X-Authorization': localStorage.getItem('token')
            }
        }).then(() => {
            clearChangePassword()
        })
        .catch(() => {
            setErrorMessageChangedPassword("Something went wrong")
        })

    }

    const fileChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        const allowed = new Set(["image/jpeg", "image/jpg", "image/png", "image/gif"])
        if (allowed.has(e.target.files![0].type)) {
            document.getElementById("registerImg")!.setAttribute("src", URL.createObjectURL(e.target.files![0]))
            const reader = new FileReader();
            reader.onload = () => {
                const bufferData = new Uint8Array(reader.result as ArrayBuffer)
                setProfilePicture(bufferData)
                localStorage.setItem('fileType', e.target.files![0].type)
            };
            reader.readAsArrayBuffer(e.target.files![0])
        }
    };

    const changeGenre = (newValue: SingleValue<{ value: number; label: string; } | null>) => {
        setSelectedGenre(newValue)
    }

    const changeAgeRating = (newValue: SingleValue<{ value: number; label: string; } | null>) => {
        setSelectedAgeRating(myAgeRatingSelect[ageRatingIndex[newValue!.label]])
    }

    const fileChangedCreateFilm = (e: React.ChangeEvent<HTMLInputElement>) => {
        const allowed = new Set(["image/jpeg", "image/jpg", "image/png", "image/gif"])
        // @ts-ignore
        if (allowed.has(e.target.files[0].type)) {
            // @ts-ignore
            document.getElementById("createFilmImg").setAttribute("src", URL.createObjectURL(e.target.files[0]))
            const reader = new FileReader();
            reader.onload = () => {
                const bufferData = new Uint8Array(reader.result as ArrayBuffer)
                setProfilePicture(bufferData)
                // @ts-ignore
                localStorage.setItem('fileType', e.target.files[0].type)
            };
            // @ts-ignore
            reader.readAsArrayBuffer(e.target.files[0])
        }
    };

    const filmCreated = () => {

        // @ts-ignore
        document.getElementById("titleInput").value = ""
        // @ts-ignore
        setSelectedGenre(myGenresSelect[0])
        // @ts-ignore
        document.getElementById("runtimeInput").value = ""
        // @ts-ignore
        document.getElementById("releaseDateInput").value = ""
        // @ts-ignore
        setSelectedAgeRating(myAgeRatingSelect[ageRatingIndex["G"]])
        // @ts-ignore
        document.getElementById("filmDescription").value = ""

        setErrorMessageCreateFilm("")
        clearImg()
        clearInputs()

    }

    const createFilm = () => {

        const titleInput = document.getElementById("titleInput")
        const runtimeInput = document.getElementById("runtimeInput")
        const releaseDateInput = document.getElementById("releaseDateInput")
        const filmDescription = document.getElementById("filmDescription")

        // @ts-ignore
        const title = titleInput.value.trimStart().trimEnd()
        // @ts-ignore
        const genre = selectedGenre?.label
        // @ts-ignore
        let runtime = runtimeInput.value
        // @ts-ignore
        const releaseDate = releaseDateInput.value
        // @ts-ignore
        let ageRating = selectedAgeRating?.label
        // @ts-ignore
        const description = filmDescription.value

        // @ts-ignore
        const genreId = myGenres[genre]

        const date = new Date(releaseDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const formattedDate = `${year}-${formatNumber(month)}-${formatNumber(day)}`;
        const formattedTime = `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;

        if (!ageRatings.includes(ageRating as string) && ageRating !== "") {
            // @ts-ignore
            document.getElementById("ageRatingInputEdit").style.borderColor = "red"
        } else if (ageRating === "") {
            ageRating = 'TBC'
        }

        if (runtimeRegex.test(runtime) || numberOnlyRegex.test(runtime)) {
            if (!numberOnlyRegex.test(runtime)) {
                runtime = convertRuntime(runtime)
            }
        }

        const filmData = {
            title: title,
            description: description,
            releaseDate: `${formattedDate} ${formattedTime}`,
            genreId: genreId,
            runtime: parseFloat(runtime),
            ageRating: ageRating,
        };

        // @ts-ignore
        document.getElementById("genreInput").style.borderColor = "#E3E6ED"
        // @ts-ignore
        document.getElementById("titleInput").style.borderColor = "#E3E6ED"
        // @ts-ignore
        document.getElementById("runtimeInput").style.borderColor = "#E3E6ED"
        // @ts-ignore
        document.getElementById("releaseDateInput").style.borderColor = "#E3E6ED"
        // @ts-ignore
        document.getElementById("filmDescription").style.borderColor = "#E3E6ED"

        if (validateFilmData(title, genreId, runtime, releaseDate, description, pfp)) {
            axios.post(`${APIUrl}/films`, filmData, {
                headers: {
                    'X-Authorization': localStorage.getItem('token')
                }
            }).then((response) => {
                const id = response.data["filmId"]
                if (pfp !== null) {
                    axios.put(`${APIUrl}/films/${id}/image`, pfp, {
                        headers: {
                            'Content-Type': localStorage.getItem('fileType'),
                            'X-Authorization': localStorage.getItem('token')
                        }
                    }).then(() => {
                        setSuccessMessageCreateFilm("Film has been successfully created. Refresh page when ready")
                        filmCreated()
                    }).catch(() => {
                    });
                } else {
                    setSuccessMessageCreateFilm("Film has been successfully created. Refresh page when ready")
                    filmCreated()
                }
            }).catch((error) => {
                if (error.response.status === 403) {
                    document.getElementById("titleInput")!.style.borderColor = "red"
                    document.getElementById("titleDuplicateError")!.hidden = false
                }
            })
        }
    }

    const clearRegister = () => {

        const firstNameInput = document.getElementById("firstNameInputRegister")
        const lastNameInput = document.getElementById("lastNameInputRegister")
        const emailInput = document.getElementById("emailInputRegister")
        const passwordInput = document.getElementById("passwordInputRegister")

        firstNameInput!.style.borderColor = "#E3E6ED"
        lastNameInput!.style.borderColor = "#E3E6ED"
        emailInput!.style.borderColor = "#E3E6ED"
        passwordInput!.style.borderColor = "#E3E6ED"

        setErrorMessageRegister("")
    }

    const clearLogin = () => {

        const emailInput = document.getElementById("emailInputLogin")
        const passwordInput = document.getElementById("passwordInputLogin")

        emailInput!.style.borderColor = "#E3E6ED"
        passwordInput!.style.borderColor = "#E3E6ED"

        setErrorMessageLogin("")
    }
    const login = () => {

        const emailInput = document.getElementById("emailInputLogin")
        const passwordInput = document.getElementById("passwordInputLogin")

        // @ts-ignore
        const email = emailInput.value;
        // @ts-ignore
        const password = passwordInput.value;

        const loginData = {
            email: email,
            password: password
        };

        axios.post(`${APIUrl}/users/login`, loginData)
            .then((response) => {
                localStorage.setItem('token', response.data['token'])
                localStorage.setItem('userId', response.data['userId'])
                window.location.reload()
            })
            .catch((error) => {
                if (error.response.status === 401) {
                    setErrorMessageLogin('Login failed: Incorrect credentials')
                } else if (error.response.status === 400) {
                    setErrorMessageLogin('Login failed: Invalid information')
                }
                emailInput!.style.borderColor = "#E3E6ED"
                passwordInput!.style.borderColor = "#E3E6ED"
                if (!emailRegex.test(email || '')) {
                    emailInput!.style.borderColor = "red"
                }
                if (!passwordRegex.test(password || '')) {
                    passwordInput!.style.borderColor = "red"
                }
                // @ts-ignore
                emailInput.value = email
            })
    }

    const logoutInner = () => {
        axios.post(`${APIUrl}/users/logout`, "Hold", {
            headers: {
                'X-Authorization': localStorage.getItem('token')
            }
        })
        .then((response) => {
        })
        .catch((error) => {
        })
        logout()
        window.location.href = "http://localhost:8080/films"
    }

    const register = () => {

        const firstNameInput = document.getElementById("firstNameInputRegister")
        const lastNameInput = document.getElementById("lastNameInputRegister")
        const emailInput = document.getElementById("emailInputRegister")
        const passwordInput = document.getElementById("passwordInputRegister")

        // @ts-ignore
        const firstName = firstNameInput.value;
        // @ts-ignore
        const lastName = lastNameInput.value;
        // @ts-ignore
        const email = emailInput.value;
        // @ts-ignore
        const password = passwordInput.value;

        const registerData = {
            email: email,
            firstName: firstName,
            lastName: lastName,
            password: password
        };

        const loginData = {
            email: email,
            password: password
        };

        axios.post(`${APIUrl}/users/register`, registerData)
            .then((response) => {
                const id = response.data["userId"]
                axios.post(`${APIUrl}/users/login`, loginData)
                    .then((response) => {
                        localStorage.setItem('token', response.data['token'])
                        if (pfp !== null) {
                            axios.put(`${APIUrl}/users/${id}/image`, pfp, {
                                headers: {
                                    'Content-Type': localStorage.getItem('fileType'),
                                    'X-Authorization': response.data['token']
                                }
                            }).then(() => {
                                localStorage.setItem('userId', id)
                                setProfilePicture(null)
                                window.location.reload()
                            }).catch(() => {
                            });
                        } else {
                            localStorage.setItem('userId', id)
                            window.location.reload()
                        }
                    })
                    .catch(() => {
                    })
            })
            .catch((error) => {
                // @ts-ignore
                firstNameInput.style.borderColor = "#E3E6ED"
                // @ts-ignore
                lastNameInput.style.borderColor = "#E3E6ED"
                // @ts-ignore
                emailInput.style.borderColor = "#E3E6ED"
                // @ts-ignore
                passwordInput.style.borderColor = "#E3E6ED"
                if (error.response.status === 403) {
                    // @ts-ignore
                    emailInput.style.borderColor = "red"
                    setErrorMessageRegister('Registration failed: Email already in use')
                    // Handle 403 error
                } else if (error.response.status === 400) {
                    setErrorMessageRegister('Registration failed: Invalid information')
                    // Handle other errors
                }
                if (!nameRegex.test(firstName)) {
                    // @ts-ignore
                    firstNameInput.style.borderColor = "red"
                }
                if (!nameRegex.test(lastName)) {
                    // @ts-ignore
                    lastNameInput.style.borderColor = "red"
                }
                if (!emailRegex.test(email)) {
                    // @ts-ignore
                    emailInput.style.borderColor = "red"
                }
                if (!passwordRegex.test(password)) {
                    // @ts-ignore
                    passwordInput.style.borderColor = "red"
                }
                // @ts-ignore
                firstNameInput.value = firstName
                // @ts-ignore
                lastNameInput.value = lastName
                // @ts-ignore
                emailInput.value = email
            })
    }
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light d-flex">
            <a className="navbar-brand">Film festival</a>
            <button className="navbar-toggler" type="button" data-toggle="collapse"
                    data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                    aria-expanded="true" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-between show" id="navbarSupportedContent">
                <ul className="navbar-nav mr-auto">
                    {localStorage.getItem('token') !== null &&
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" id="navbarDropdown" role="button"
                               data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Manage Films
                            </a>
                            <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                                <a className="dropdown-item" data-toggle="modal" data-dismiss="modal" data-target="#createModal" onClick={filmCreated}>Create film</a>
                                <Link className="dropdown-item" to={"/profile"}>
                                    Edit films
                                </Link>
                            </div>
                        </li>
                    }
                    <li className="nav-item">
                        <Link className="nav-link" to={"/films?startIndex=0&count=10"}>
                            Films
                        </Link>
                    </li>
                </ul>
                <ul className="navbar-nav ml-auto ">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="input-group mb-2 pr-1" style={{paddingTop: "0.75rem", width: "auto"}}>
                            <input id="searchQuery" type="text" className="form-control" placeholder="Search films" style={{display: 'inline-block', borderTopRightRadius: "7px", borderBottomRightRadius: "7px"}} onChange={handleButtonClick} autoFocus={true}/>
                            <div className="input-group-append" style={{display: 'inline-block', margin: 0, padding: 0}}>
                            </div>
                        </div>
                        {localStorage.getItem('token') !== null &&
                            <li className="nav-item dropdown">
                                <div className="d-flex align-items-center">
                                    <a className="nav-link dropdown-toggle" id="profile" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <img
                                            src={
                                                localStorage.getItem('userId') !== null
                                                    ? `${APIUrl}/users/` + localStorage.getItem('userId') + '/image'
                                                    : '../defaultUser.jpg'
                                            }
                                            className="img-fluid rounded-circle profile-picture"
                                            alt="Profile picture"
                                            style={{ width: "48.5px", height: "48.5px", objectFit: "cover" }}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null;
                                                target.src = '../defaultUser.jpg';
                                            }}
                                        />

                                    </a>
                                    <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                                        <Link className="dropdown-item" to={"/profile"}>
                                            View Profile
                                        </Link>
                                        <Link className="dropdown-item" to={"/profile"}>
                                            My Films
                                        </Link>
                                        <a className="dropdown-item" data-toggle="modal" data-target="#changePasswordModal">Change Password</a>
                                        <div className="dropdown-divider"></div>
                                        <a className="dropdown-item">
                                            <button type="button" id="logoutBtn" className="btn btn-danger" onClick={logoutInner}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
                                                    <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                                                    <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                                                </svg>
                                                Log out
                                            </button>
                                        </a>
                                    </div>
                                </div>
                            </li>
                        }
                        {localStorage.getItem('token') === null &&
                            <li>
                                <button className="btn btn-success" type="button" id="loginBtn" style={{marginTop: "3px"}} data-toggle="modal" data-target="#loginModal">
                                    <span id="loginBtnSpan">Login</span>
                                </button>
                            </li>
                        }

                        <div className="modal fade show" id="loginModal" tabIndex={-1} role="dialog"
                             aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                            <div className="modal-dialog modal-dialog-centered" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="exampleModalLongTitle">Login</h5>
                                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <div style={{display: 'flex', flexDirection: 'column', alignItems: "flex-start"}}>
                                            <label htmlFor="emailInputLogin">Email</label>
                                            <input id="emailInputLogin" type="text" className="form-control" placeholder="Email" aria-label="Email" aria-describedby="basic-addon1"
                                                   onKeyDown={(event) => checkSubmit(event, "register")}/>
                                            <label htmlFor="passwordInputLogin">Password</label>
                                            <input id="passwordInputLogin" type="password" className="form-control" placeholder="Password" aria-label="Password" aria-describedby="basic-addon1"
                                                   onKeyDown={(event) => checkSubmit(event, "login")}/>
                                        </div>
                                        <div className="form-check" style={{ display: 'flex', alignItems: 'center', marginTop: "15px" }}>
                                            <input className="form-check-input" type="checkbox" value="" id="flexCheckLogin" style={{ order: 1 }} onClick={toggleLoginPasswordVisibility}/>
                                            <label className="form-check-label" htmlFor="flexCheckLogin" style={{ order: 2 }}>
                                                Show password
                                            </label>
                                        </div>
                                        <br/>
                                        <p style={{color: "red"}}>{errorMessageLogin}</p>
                                    </div>
                                    <div className="modal-footer d-flex justify-content-between">
                                        <a data-toggle="modal" data-dismiss="modal" data-target="#registerModal" onClick={clearLogin}>Register</a>
                                        <button type="button" className="btn btn-secondary" data-dismiss="modal" style={{marginLeft: "250px"}}>Close</button>
                                        <button id="loginBtn" type="button" className="btn btn-primary" onClick={login}>Login</button>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="modal fade" id="registerModal" tabIndex={-1} role="dialog" style={{overflow: "auto"}}
                             aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                            <div className="modal-dialog modal-dialog-centered" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="exampleModalLongTitle">Register</h5>
                                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="profile-picture-container">
                                            <img id="registerImg" src={"../defaultUser.jpg"} className="img-fluid rounded-circle profile-picture" alt="Not found" style={{ width: "100px", height: "100px", objectFit: "cover", cursor: "pointer" }} onMouseEnter={mouseOn} onMouseLeave={mouseOff} onClick={openFilePicker}/>
                                            <input id="filePicker" type="file" accept=".png,.jpg,.gif" style={{ display: "none" }} onChange={fileChanged}/>
                                        </div>
                                        <div style={{display: 'flex', flexDirection: 'column', alignItems: "flex-start"}}>
                                            <label htmlFor="firstNameInputRegister">First Name</label>
                                            <input id="firstNameInputRegister" type="text" className="form-control" placeholder="Jane" aria-label="Password" aria-describedby="basic-addon1"
                                                   onKeyDown={(event) => checkSubmit(event, "register")}/>
                                            <label htmlFor="lastNameInputRegister">Last Name</label>
                                            <input id="lastNameInputRegister" type="text" className="form-control" placeholder="Doe" aria-label="Password" aria-describedby="basic-addon1"
                                                   onKeyDown={(event) => checkSubmit(event, "register")}/>
                                            <label htmlFor="emailInputRegister">Email</label>
                                            <input id="emailInputRegister" type="text" className="form-control" placeholder="Email" aria-label="Email" aria-describedby="basic-addon1"
                                                   onKeyDown={(event) => checkSubmit(event, "register")}/>
                                            <label htmlFor="passwordInputRegister">Password</label>
                                            <input id="passwordInputRegister" type="password" className="form-control" placeholder="Password" aria-label="Password" aria-describedby="basic-addon1"
                                                   onKeyDown={(event) => checkSubmit(event, "register")}/>
                                        </div>
                                        <div className="form-check" style={{ display: 'flex', alignItems: 'center', marginTop: "15px" }}>
                                            <input className="form-check-input" type="checkbox" value="" id="flexCheckRegister" style={{ order: 1 }} onClick={toggleRegisterPasswordVisibility}/>
                                            <label className="form-check-label" htmlFor="flexCheckRegister" style={{ order: 2 }}>
                                                Show password
                                            </label>
                                        </div>
                                        <br/>
                                        <p style={{color: "red"}}>{errorMessageRegister}</p>
                                    </div>
                                    <div className="modal-footer d-flex justify-content-between">
                                        <a id="loginModalLink" data-toggle="modal" data-dismiss="modal" data-target="#loginModal" onClick={clearRegister}>Login</a>
                                        <button type="button" className="btn btn-secondary" data-dismiss="modal" style={{marginLeft: "250px"}}>Close</button>
                                        <button type="button" className="btn btn-primary" onClick={register}>Register</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal fade" id="createModal" tabIndex={-1} role="dialog" style={{overflow: "auto"}}
                             aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                            <div className="modal-dialog modal-dialog-centered" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="exampleModalLongTitle">Create Film</h5>
                                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="profile-picture-create-container">
                                            <img id="createFilmImg" src={"../defaultUser.jpg"} className="img-fluid rounded-circle profile-picture-create" alt="Not found" style={{ width: "100px", height: "100px", objectFit: "cover", border: "1.5px solid black" }} onMouseEnter={mouseOnCreateFilm} onMouseLeave={mouseOffCreateFilm} onClick={openCreateFilmFilePicker}/>
                                            <input id="filePickerCreateFilm" type="file" accept=".png,.jpg,.gif" style={{ display: "none" }} onChange={fileChangedCreateFilm}/>
                                        </div>
                                        <div style={{display: 'flex', flexDirection: 'column', alignItems: "flex-start"}}>
                                            <label htmlFor="titleInput"><strong>Title</strong></label>
                                            <input id="titleInput" type="text" className="form-control" aria-label="Password" aria-describedby="basic-addon1"/>
                                            <div id="titleMaxLimit" className="mt-2" hidden style={{color: "red"}}>Title has a maximum of 64 characters</div>
                                            <div id="titleMinLimit" className="mt-2" hidden style={{color: "red"}}>A film must have a title</div>
                                            <div id="titlePercentError" className="mt-2" hidden style={{color: "red"}}>A title cannot contain %</div>
                                            <div id="titleDuplicateError" hidden className="mt-2" style={{color: "red"}}>A film already has that title</div>

                                            <div className="row w-100 m-0 mb-1 mt-2">
                                                <div className="col p-0 mr-2" style={{textAlign: "left"}}>
                                                    <label htmlFor="genreInput"><strong>Genre</strong></label>
                                                    <Select id="genreInput" value={selectedGenre} options={myGenresSelect} onChange={changeGenre}/>
                                                </div>
                                                <div className="col p-0" style={{textAlign: "left"}}>
                                                    <label htmlFor="releaseDateInput">Release Date</label>
                                                    <input id="releaseDateInput" type="datetime-local" className="form-control" aria-label="Password" aria-describedby="basic-addon1"/>
                                                    <div id="releaseDateInPast" className="mt-2" hidden style={{color: "red"}}>Must be in the future</div>
                                                </div>
                                            </div>

                                            <div className="row w-100 m-0 mt-2">
                                                <div className="col p-0 mr-2" style={{textAlign: "left"}}>
                                                    <label htmlFor="ageRatingInput">Age Rating</label>
                                                    <Select id="ageRatingInput" value={selectedAgeRating} options={myAgeRatingSelect} onChange={changeAgeRating}/>
                                                </div>
                                                <div className="col p-0" style={{textAlign: "left"}}>
                                                    <label htmlFor="runtimeInput">Runtime</label>
                                                    <input id="runtimeInput" type="text" placeholder="1hr 37m or 97" className="form-control" aria-label="Email" aria-describedby="basic-addon1"/>
                                                    <div id="runtimeFormat" className="mt-2" hidden style={{color: "red"}}>Format: 1hr 37m or 97</div>
                                                    <div id="runtimeLength" className="mt-2" hidden style={{color: "red"}}>Runtime can not exceed 300</div>
                                                </div>
                                            </div>

                                            <label htmlFor="filmDescription"><strong>Description</strong></label>
                                            <textarea className="form-control" id="filmDescription" rows={3}></textarea>
                                        </div>
                                        <br/>
                                        <p id="descriptionError" hidden style={{color: "red"}}>Film must have a description</p>
                                        <p id="imageError" hidden style={{color: "red"}}>Film must have an image</p>
                                        <p id="descriptionAndImageError" hidden style={{color: "red"}}>Film must have a description and an image</p>
                                        <p style={{color: "red"}}>{errorMessageCreateFilm}</p>
                                        <p style={{color: "green"}}>{successMessageCreateFilm}</p>
                                    </div>
                                    <div className="modal-footer d-flex justify-content-between">
                                        <button type="button" className="btn btn-secondary" data-dismiss="modal" style={{marginLeft: "auto"}}>Close</button>
                                        <button type="button" className="btn btn-primary" onClick={createFilm}>Create Film</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal fade show" id="changePasswordModal" tabIndex={-1} role="dialog"
                             aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                            <div className="modal-dialog modal-dialog-centered" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="exampleModalLongTitle">Change Password</h5>
                                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <div style={{display: 'flex', flexDirection: 'column', alignItems: "flex-start"}}>
                                            <label htmlFor="oldPasswordInput">Current Password</label>
                                            <input id="oldPasswordInput" type="password" className="form-control" placeholder="Password" aria-label="Password" aria-describedby="basic-addon1"/>
                                            <label htmlFor="newPasswordInput">New Password</label>
                                            <input id="newPasswordInput" type="password" className="form-control" placeholder="Password" aria-label="Password" aria-describedby="basic-addon1"/>
                                        </div>
                                        <div className="form-check" style={{ display: 'flex', alignItems: 'center', marginTop: "15px" }}>
                                            <input className="form-check-input" type="checkbox" value="" id="flexCheckLogin" style={{ order: 1 }} onClick={toggleChangePasswordVisibility}/>
                                            <label className="form-check-label" htmlFor="flexCheckLogin" style={{ order: 2 }}>
                                                Show password
                                            </label>
                                        </div>
                                        <br/>
                                        <p style={{color: "red"}}>{errorMessageChangedPassword}</p>
                                        <p style={{color: "green"}}>{successMessageChangedPassword}</p>
                                    </div>
                                    <div className="modal-footer d-flex justify-content-between">
                                        <button type="button" className="btn btn-secondary" data-dismiss="modal" style={{marginLeft: "auto"}}>Close</button>
                                        <button type="button" className="btn btn-primary" onClick={changePassword}>Confirm</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </ul>
            </div>
        </nav>

    )
}

export default Header;