import axios from 'axios';
import React, {useEffect, useRef, useState} from "react";
import {Link, useLocation} from 'react-router-dom';
import Header from "./Header";
import Slider from "react-slick";
import Select, {SingleValue} from 'react-select'
import {Confirm} from 'react-admin';
import {isDateTimeInPast, formatNumber, findTimeBetween, openEditFilmFilePicker, convertDateString} from "../Helper/formatting";
import {validateProfileDetails, validateEditFilmData} from "../Helper/validation";
import {ageRatings, myAgeRatingSelect, myGenres, myGenresSelect, settings, APIUrl} from "../Helper/constants";
import {mouseOn, mouseOff, mouseOffEditFilm, mouseOnEditFilm, openFilePicker, clearForEdit} from "../Helper/javaScriptStuff";
const Profile = () => {

    const nameInputRef = useRef<HTMLHeadingElement>(null);
    const [profileDetails, setProfileDetails] = React.useState("");
    const [userInfo, setUserInfo] = React.useState<userReturnWithEmail>(
        {firstName: "", lastName: "", email: ""})
    const [userFilms, setUserFilms] = React.useState<filmFull[]>([])
    const [reviewedFilms, setReviewedFilms] = React.useState<filmFull[]>([])
    const [myReviewedFilms, setMyReviewedFilms] = React.useState<number[]>([])
    const [filmCount, setFilmCount] = React.useState(0)
    const [allReviews, setAllReviews] = React.useState<review[]>([]);
    const [genres, setGenres] = React.useState < Array < genre >> ([])
    const [showReviews, setShowReviews] = React.useState(5);
    const [pfp, setProfilePicture] = React.useState<ArrayBuffer | null> (null);
    const [editable, setEditable] = React.useState(false);
    const [editFilm, setEditFilm] = React.useState<filmFull>(
        {
            description: "", numReviews: 0, runtime: 0, filmId:0, title:"", ageRating:"", directorFirstName:"", directorLastName:""
            , directorId:0, genreId:0, rating:0, releaseDate:""})
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [selectedGenre, setSelectedGenre] = useState<SingleValue<{ value: number; label: string; } | null>>();
    const [selectedAgeRating, setSelectedAgeRating] = useState<SingleValue<{ value: number; label: string; } | null>>();
    const [open, setOpen] = useState(false);

    const handleDialogClose = () => setOpen(false);
    const handleConfirm = () => {
        setOpen(false);
        axios.delete(`${APIUrl}/films/${editFilm.filmId}`, {
            headers: {
                'X-Authorization': localStorage.getItem('token')
            }
        }).then(() => {
            window.location.reload()
        }).catch(() => {

        })

    };

    const ageRatingIndex: { [key: string]: number } = {};
    myAgeRatingSelect.forEach((option, index) => {
        ageRatingIndex[option.label] = index;
    });

    useEffect(() => {
        // Update window width on resize
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [windowWidth]);

    if (windowWidth < 1700) {
        // Adjust settings for smaller screens
        settings.slidesToShow = 2;
        settings.slidesToScroll = 1;
    }

    if (windowWidth > 1700) {
        // Adjust settings for smaller screens
        settings.slidesToShow = 3;
        settings.slidesToScroll = 2;
    }

    if (windowWidth < 1045) {
        // Adjust settings for smaller screens
        settings.slidesToShow = 1;
        settings.slidesToScroll = 1;
    }

    if (windowWidth > 1045 && windowWidth < 1700) {
        // Adjust settings for smaller screens
        settings.slidesToShow = 2;
        settings.slidesToScroll = 1;
    }

    const location = useLocation();

    const handleLoadMore = () => {
        setShowReviews(showReviews + 5);
    };

    function getGenre(genreID:number) {
        for (let index = 0; index < genres.length; index++) {
            if (genres[index]["genreId"] === genreID) {
                return genres[index]["name"];
            }
        }
    }

    const updatePicture = () => {
        axios.put(`${APIUrl}/users/${localStorage.getItem('userId')}/image`, pfp, {
            headers: {
                'Content-Type': localStorage.getItem('fileType'),
                'X-Authorization': localStorage.getItem('token')
            }
        }).then(() => {
            setProfilePicture(null)
            window.location.reload()
        }).catch(() => {
        });
    }

    const updateDetails = () => {

        const nameInput = document.getElementById("nameInput")
        const emailInput = document.getElementById("emailInput")

        // @ts-ignore
        const names = nameInput.textContent.split(" ")
        // @ts-ignore
        const email = emailInput.textContent

        const updatedData = {
            firstName: names[0],
            lastName: names[1],
            email: email,
        };

        if (validateProfileDetails(names, email)) {

            axios.patch(`${APIUrl}/users/${localStorage.getItem('userId')}`, updatedData, {
                headers: {
                    'X-Authorization': localStorage.getItem('token')
                }
            }).then(() => {
                window.location.reload()
            })
            .catch((error) => {
                if (error.response.status === 403) {
                    document.getElementById("takenEmailError")!.hidden = false
                }
            })

            if (pfp !== null) {
                updatePicture()
            }
        } else {

        }

    }

    const clearImg = () => {
        document.getElementById("imgProfile")!.setAttribute("src", "../defaultUser.jpg")
        removePicture()
    }

    const removePicture = () => {

    axios.put(`${APIUrl}/users/${localStorage.getItem('userId')}/image`, null, {
            headers: {
                'Content-Type': 'image/jpeg',
                'X-Authorization': localStorage.getItem('token')
            }
        })
        .then(() => {
            setProfilePicture(null);
            window.location.reload();
        })
        .catch(() => {
        });
    };

    const changeGenre = (newValue: SingleValue<{ value: number; label: string; } | null>) => {
        setSelectedGenre(newValue)
    }

    const changeAgeRating = (newValue: SingleValue<{ value: number; label: string; } | null>) => {
        setSelectedAgeRating(myAgeRatingSelect[ageRatingIndex[newValue!.label]])
    }

    const handleDeleteFilm =() => {
        setOpen(true)
    }

    const handleEditFilm = () => {

        const titleInput = document.getElementById("titleInputEdit")
        const runtimeInput = document.getElementById("runtimeInputEdit")
        const releaseDateInput = document.getElementById("releaseDateInputEdit")
        const filmDescription = document.getElementById("filmDescriptionEdit")

        // @ts-ignore
        const title = titleInput.value.trimStart().trimEnd()
        // @ts-ignore
        const genre = selectedGenre?.label
        // @ts-ignore
        const runtime = runtimeInput.value
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
            document.getElementById("ageRatingInputEdit")!.style.borderColor = "red"
        } else if (ageRating === "") {
            ageRating = 'TBC'
        }
        let filmData
        if ((document.getElementById("releaseDateInputEdit") as HTMLInputElement).disabled) {
            filmData = {
                title: title,
                description: description,
                genreId: genreId,
                runtime: parseFloat(runtime),
                ageRating: ageRating,
            };
        } else {
            filmData = {
                title: title,
                description: description,
                releaseDate: `${formattedDate} ${formattedTime}`,
                genreId: genreId,
                runtime: parseFloat(runtime),
                ageRating: ageRating,
            };
        }

        document.getElementById("genreInputEdit")!.style.borderColor = "#E3E6ED"
        document.getElementById("titleInputEdit")!.style.borderColor = "#E3E6ED"
        document.getElementById("runtimeInputEdit")!.style.borderColor = "#E3E6ED"
        document.getElementById("runtimeInputEdit")!.style.borderColor = "#E3E6ED"
        document.getElementById("releaseDateInputEdit")!.style.borderColor = "#E3E6ED"
        document.getElementById("filmDescriptionEdit")!.style.borderColor = "#E3E6ED"

        if (validateEditFilmData(title, genreId, runtime, releaseDate, description)) {
            axios.patch(`${APIUrl}/films/${editFilm.filmId}`, filmData, {
                headers: {
                    'X-Authorization': localStorage.getItem('token')
                }
            }).then(() => {
                if (pfp !== null) {
                    axios.put(`${APIUrl}/films/${editFilm.filmId}/image`, pfp, {
                        headers: {
                            'Content-Type': localStorage.getItem('fileType'),
                            'X-Authorization': localStorage.getItem('token')
                        }
                    }).then(() => {
                        window.location.reload()
                    }).catch(() => {
                    });
                } else {
                    window.location.reload()
                }
            }).catch((error) => {
                if (error.response.status === 403) {
                    document.getElementById("titleInputEdit")!.style.borderColor = "red"
                    document.getElementById("titleDuplicateErrorEdit")!.hidden = false
                }
            })
        }
    }

    const allowEdit = () => {
        // @ts-ignore
        document.getElementById("nameInput").setAttribute("contentEditable", !editable)
        // @ts-ignore
        document.getElementById("nameInput").focus()
        // @ts-ignore
        document.getElementById("emailInput").setAttribute("contentEditable", !editable)
        // @ts-ignore
        document.getElementById("updateDetailsBtn").style.display = editable ? "none": "block"
        clearForEdit()
        setEditable(!editable)
    }

    const fileChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        const allowed = new Set(["image/jpeg", "image/jpg", "image/png", "image/gif"])
        if (allowed.has(e.target.files![0].type)) {
            document.getElementById("imgProfile")!.setAttribute("src", URL.createObjectURL(e.target.files![0]))
            document.getElementById("editProfileBtn")!.style.display = "none"
            if (document.getElementById("updateDetailsBtn")!.style.display !== "block") {
                document.getElementById("updatePictureBtn")!.style.display = "block"
            }
            const reader = new FileReader();
            reader.onload = () => {
                const bufferData = new Uint8Array(reader.result as ArrayBuffer)
                setProfilePicture(bufferData)
                localStorage.setItem('fileType', e.target.files![0].type)
            };
            reader.readAsArrayBuffer(e.target.files![0])
        }
    };

    const getReviews = async () => {
        try {
            const genresResponse = await axios.get(`${APIUrl}/films/genres`)
            setGenres(genresResponse.data);
            const response = await axios.get(`${APIUrl}/films/`);
            const films = response.data.films;
            const requests = films.map((film:film) => axios.get(`${APIUrl}/films/${film.filmId}/reviews`));
            const responses = await Promise.all(requests);
            const filmsWithReviews: film[] = [];
            responses.forEach((response, index) => {
                const reviews = response.data;
                if (reviews.length > 0) {
                    const filmWithReview = { ...films[index], reviews };
                    filmsWithReviews.push(filmWithReview);
                }
            });
            const reviews = responses.flatMap(response => response.data);
            const filteredReviews = reviews.filter(review => review.reviewerId.toString() === localStorage.getItem('userId')!.toString());
            const myReviewedFilms = filmsWithReviews.filter(film => film.directorId.toString() === localStorage.getItem('userId')!.toString()).map(film => film.filmId)
            setAllReviews(filteredReviews);
            setMyReviewedFilms(myReviewedFilms)
        } catch (error) {
            // handle error
        }
    }
    const fileChangedEditFilm = (e: React.ChangeEvent<HTMLInputElement>) => {
        const allowed = new Set(["image/jpeg", "image/jpg", "image/png", "image/gif"])
        if (e.target.files !== undefined && e.target.files !== null) {
            if (allowed.has(e.target.files![0].type)) {
                document.getElementById("editFilmImg")!.setAttribute("src", URL.createObjectURL(e.target.files![0]))
                const reader = new FileReader();
                reader.onload = () => {
                    const bufferData = new Uint8Array(reader.result as ArrayBuffer)
                    setProfilePicture(bufferData)
                    localStorage.setItem('fileType', e.target.files![0].type)
                };
                reader.readAsArrayBuffer(e.target.files![0])
            }
        }

    };

    const checkLength = (event: React.KeyboardEvent<HTMLDivElement>) => {

        const nameInput = document.getElementById("nameFields")!.textContent
        if (nameInput!.length > 3 && nameInput!.length < 60) {
            setProfileDetails(nameInput || '')
        }
        if (nameInput!.length < 1) {
            if (event.code === "Backspace") {
                // @ts-ignore
                document.getElementById("nameFields").value = profileDetails[0]
                document.getElementById("emailInput")!.focus()
                document.getElementById("nameInput")!.focus()
            } else if (event.code === "Delete") {
                // @ts-ignore
                document.getElementById("nameFields").value = profileDetails[0]
            }
            setProfileDetails(profileDetails)
        }
    }

    useEffect(() => {
        if (nameInputRef.current) {
            const inputElement = nameInputRef.current;
            inputElement.addEventListener("focus", handleFocus);

            return () => {
                inputElement.removeEventListener("focus", handleFocus);
            };
        }
    }, []);

    const handleFocus = () => {
        if (nameInputRef.current) {
            const inputElement = nameInputRef.current;
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(inputElement);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
    };

    const editFilmModal = async (film: filmFull) => {

        (document.getElementById("releaseDateInputEdit") as HTMLInputElement).disabled = isDateTimeInPast(film.releaseDate)
        const response = await axios.get(`${APIUrl}/films/${film.filmId}`);
        setEditFilm(response.data)
        // @ts-ignore
        document.getElementById("titleInputEdit")!.value = response.data.title
        setSelectedGenre(myGenresSelect[response.data.genreId - 1])
        // @ts-ignore
        document.getElementById("runtimeInputEdit").value = response.data.runtime
        // @ts-ignore
        document.getElementById("releaseDateInputEdit").value = response.data.releaseDate !== "" ? new Date(response.data.releaseDate).toISOString().substring(0, 16) : ""
        setSelectedAgeRating(myAgeRatingSelect[ageRatingIndex[response.data.ageRating]])
        // @ts-ignore
        document.getElementById("filmDescriptionEdit").value = response.data.description
        document.getElementById("toggleEditModal")!.click()
    }

    const list_of_film_reviews = () => {
        return allReviews.slice(0, showReviews).map((item: review, index: number) => (
            <div className="card text-center" key={index} style={{ marginBottom: "20px" }}>
                <div className="card-header d-flex">
                    <img src={`${APIUrl}/users/${item.reviewerId}/image`}
                         onError={(e) => {
                             const target = e.target as HTMLImageElement;
                             target.onerror = null;
                             target.src = '../defaultUser.jpg';
                         }}
                         className="img-fluid rounded-circle profile-picture"
                         alt="Not found" style={{ width: "60px", height: "60px", objectFit: "cover" }}/>
                    <div className="ml-3">
                        <h5 className="card-title">
                            {item.reviewerFirstName} {item.reviewerLastName}
                        </h5>
                        <div className="meta lg" style={{ display: "flex", flexDirection: "row" }}>
                          <span style={{ display: "flex", alignItems: "center" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gold" className="bi bi-star-fill" viewBox="0 0 16 16">
                              <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                            </svg>
                            <span style={{ marginLeft: "0.25rem" }}>{item.rating}</span>
                            <span style={{ marginLeft: "0.5rem", whiteSpace: "nowrap" }}>{findTimeBetween(item.timestamp)}</span>
                          </span>
                        </div>
                    </div>
                </div>
                <div>{item.review && <div style={{ margin: "10px" }}>
                    <p className="card-text">{item.review}</p>
                </div>}</div>
            </div>
        ));
    };

    const userProfile = () => {
        return (
            <div className="col-md-5 mx-auto" style={{maxWidth: "55%"}}>
                <div className="bg-white shadow rounded overflow-hidden">
                    <div className="px-4 pt-0 pb-4 cover">
                        <div className="media align-items-end profile-head">
                            <div>
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <img alt="..." id="imgProfile" src={`${APIUrl}/users/` + localStorage.getItem('userId') + '/image'}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = 'defaultUser.jpg';
                                        }} width="130" className="rounded mb-2 img-thumbnail"
                                        onMouseEnter={mouseOn} onMouseLeave={mouseOff} onClick={openFilePicker} style={{ cursor: 'pointer' }}/>
                                    <div style={{position: 'absolute', bottom: '10px', left: 0, right: 0, textAlign: 'center',
                                        background: 'rgba(0, 0, 0, 0.5)', color: '#fff', padding: '5px', cursor: "pointer"}}
                                         onClick={clearImg}>
                                        Remove picture
                                    </div>
                                </div>

                                <input id="filePickerProfile" type="file" accept=".png,.jpg,.gif" style={{ display: "none" }} onChange={fileChanged}/>
                                <a id="editProfileBtn" className="btn btn-outline-dark btn-sm btn-block" onClick={allowEdit}>
                                    Edit profile
                                </a>
                                <a id="updatePictureBtn" className="btn btn-outline-dark btn-sm btn-block" style={{display: "none"}} onClick={updatePicture}>
                                    Update picture
                                </a>
                                <a id="updateDetailsBtn" className="btn btn-outline-dark btn-sm btn-block" style={{display: "none"}} onClick={updateDetails}>
                                    Update details
                                </a>
                            </div>
                            <div className="media-body mb-5 text-white" onKeyDown={(event) => checkLength(event)}>
                                <h4 id="nameInput" ref={nameInputRef} contentEditable="false" className="d-flex align-items-center mt-0 mb-0 ml-3 mb-2 pr-2 pl-2" style={{textAlign: "left", width: "fit-content", borderRadius: "2px"}} suppressContentEditableWarning={true}>
                                    <span id="nameFields">{userInfo.firstName} {userInfo.lastName}</span>
                                </h4>
                                <p id="emailInput" contentEditable="false" className="small ml-3 pr-2 pl-2" style={{display: "flex", width: "fit-content", borderRadius: "2px"}} suppressContentEditableWarning={true}>
                                    {userInfo.email}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-light p-4 d-flex justify-content-end text-center">
                        <div id="namesError" style={{marginRight: "15%", color: "red"}} hidden>
                            Must have two names
                        </div>
                        <div id="nameLengthError" style={{marginRight: "15%", color: "red"}} hidden>
                            Names have a size limit of 64
                        </div>
                        <div id="emailError" style={{marginRight: "15%", color: "red"}} hidden>
                            Invalid email
                        </div>
                        <div id="takenEmailError" style={{marginRight: "15%", color: "red"}} hidden>
                            The email is already in use
                        </div>
                        <ul className="list-inline mb-0">
                            <li className="list-inline-item"><h5 className="font-weight-bold mb-0 d-block">{filmCount}</h5>
                                <small className="text-muted"> <i className="fas fa-image mr-1"></i>Directed</small>
                            </li>
                            <li className="list-inline-item"><h5 className="font-weight-bold mb-0 d-block">{reviewedFilms.length}</h5>
                                <small className="text-muted"> <i className="fas fa-image mr-1"></i>Reviewed</small>
                            </li>
                        </ul>
                    </div>
                    <div className="py-4 px-4" style={{background: "white"}}>
                        <h5 className="mb-3">Edit My films</h5>
                        {userFilms.length > 0 &&
                            <div>
                                {userFilms.length > 2 &&
                                    <Slider {...settings}>
                                        {list_of_films()}
                                    </Slider>
                                }
                                {userFilms.length <= 2 &&
                                    <div className="row row-cols-1 row-cols-md-2">
                                        {list_of_films()}
                                    </div>
                                }
                            </div>
                        }
                        {userFilms.length === 0 &&
                            <h6>You haven't directed any films yet</h6>
                        }
                    </div>
                    {reviewedFilms.length > 0 &&
                        <div className="py-4 px-4" style={{background: "white"}}>
                            <h5 className="mb-3">Reviewed films</h5>
                            <div>
                                {reviewedFilms.length > 2 &&
                                    <Slider {...settings}>
                                        {list_of_reviewed_films()}
                                    </Slider>
                                }
                                {reviewedFilms.length <= 2 &&
                                    <div className="row row-cols-1 row-cols-md-2">
                                        {list_of_reviewed_films()}
                                    </div>
                                }
                            </div>
                        </div>
                    }
                    <div className="px-4 py-3"><h5 className="mb-2">Reviews</h5>
                        <div className="p-4 rounded shadow-sm bg-light">
                            {allReviews.length > 0 && list_of_film_reviews()}
                            {showReviews < allReviews.length && (
                                <button className="btn btn-primary" onClick={handleLoadMore}>
                                    Load more
                                </button>
                            )}
                            {allReviews.length < 1 &&
                                <h6>You haven't reviewed any films yet</h6>
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const list_of_films = () => {

        return userFilms.map((item: filmFull) =>
            <div className="col" key={item.filmId}>
                <Link to={"/films/" + item.filmId} style={{textDecoration: "none"}}>
                    <div className="cardFilm">
                        <img className="card-img-top" src={`${APIUrl}/films/${item.filmId}/image`}
                             onError={(e) => {
                                 const target = e.target as HTMLImageElement;
                                 target.onerror = null;
                                 target.src = '../defaultFilm.png';
                             }}
                             alt="Card cap" style={{width: "100%", height: "200px", objectFit: "cover"}}/>
                        <div className="card-body" id="filmCardLink">
                            <h5 className="card-title">{item.title}</h5>
                            <div className="card-text" style={{textAlign: "left"}}>
                                <img className="card-img-top img-fluid rounded-circle profile-picture mr-2" src={`${APIUrl}/users/${localStorage.getItem('userId')}/image`}
                                     onError={(e) => {
                                         const target = e.target as HTMLImageElement;
                                         target.onerror = null;
                                         target.src = '../defaultUser.jpg';
                                     }}
                                     alt="Card cap" style={{width: "30px", height: "30px", objectFit: "cover", display: "unset"}}/>
                                <strong>{item.directorFirstName} {item.directorLastName}</strong>
                                <br/>
                                {convertDateString(item.releaseDate)}
                                <h6>
                                  <span className="badge badge-secondary" style={{ marginRight: "0.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" fill="gold" className="bi bi-star-fill" viewBox="0 0 16 16">
                                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                      </svg>
                                      <span style={{ marginLeft: "0.25rem" }}>{item.rating}</span>
                                    </div>
                                  </span>
                                    {item.ageRating === "G" &&
                                        <span className="badge badge-secondary" style={{ marginRight: "0.5rem", backgroundColor: "lightgreen", color: "black" }}>{item.ageRating}</span>
                                    }
                                    {(item.ageRating === "R13" || item.ageRating === "R16" || item.ageRating === "R18") &&
                                        <span className="badge badge-secondary" style={{ marginRight: "0.5rem", backgroundColor: "darkred" }}>{item.ageRating}</span>
                                    }
                                    {(item.ageRating === "M" || item.ageRating === "PG") &&
                                        <span className="badge badge-secondary" style={{ marginRight: "0.5rem", backgroundColor: "yellow", color: "black" }}>{item.ageRating}</span>
                                    }
                                    {item.ageRating === "TBC" &&
                                        <span className="badge badge-secondary" style={{ marginRight: "0.5rem" }}>{item.ageRating}</span>
                                    }
                                <span className="badge badge-secondary" style={{ marginRight: "0.5rem" }}>{getGenre(item.genreId)}</span>
                                </h6>
                                {myReviewedFilms.includes(item.filmId) &&
                                    <button id="editProfileBtn" disabled className="btn btn-outline-dark btn-sm btn-block" style={{zIndex: "100", position: "relative"}} onClick={(e) => {e.stopPropagation(); e.preventDefault(); editFilmModal(item);}}>
                                        Released & Reviewed
                                    </button>
                                }
                                {!myReviewedFilms.includes(item.filmId) &&
                                    <button id="editProfileBtn" className="btn btn-outline-dark btn-sm btn-block" style={{zIndex: "100", position: "relative"}} onClick={(e) => {e.stopPropagation(); e.preventDefault(); editFilmModal(item);}}>
                                        Edit film
                                    </button>
                                }
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        );
    }

    const list_of_reviewed_films = () => {
        return reviewedFilms.map((item: film, index: number) =>
            <div className="col mb-4" style={{minWidth: "347px" }} key={item.filmId}>
                <Link to={"/films/" + item.filmId} style={{textDecoration: "none"}}>
                    <div className="cardFilm" id={`film_${index}`}>
                        <img className="card-img-top" src={`${APIUrl}/films/${item.filmId}/image`}
                             onError={(e) => {
                                 const target = e.target as HTMLImageElement;
                                 target.onerror = null;
                                 target.src = '../defaultFilm.png';
                             }}
                             alt="Card cap" style={{width: "100%", height: "200px", objectFit: "cover"}}/>
                        <div className="card-body" id="filmCardLink">
                            <h5 className="card-title">{item.title}</h5>
                            <div className="card-text" style={{textAlign: "left"}}>
                                <img className="card-img-top img-fluid rounded-circle profile-picture mr-2" src={`${APIUrl}/users/${item.directorId}/image`}
                                     onError={(e) => {
                                         const target = e.target as HTMLImageElement;
                                         target.onerror = null;
                                         target.src = '../defaultUser.jpg';
                                     }}
                                     alt="Card cap" style={{width: "30px", height: "30px", objectFit: "cover", display: "unset"}}/>
                                <strong>{item.directorFirstName} {item.directorLastName}</strong>
                                <br/>
                                {convertDateString(item.releaseDate)}
                                <h6>
                                  <span className="badge badge-secondary" style={{ marginRight: "0.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" fill="gold" className="bi bi-star-fill" viewBox="0 0 16 16">
                                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                      </svg>
                                      <span style={{ marginLeft: "0.25rem" }}>{item.rating}</span>
                                    </div>
                                  </span>
                                    {item.ageRating === "G" &&
                                        <span className="badge badge-secondary" style={{ marginRight: "0.5rem", backgroundColor: "lightgreen", color: "black" }}>{item.ageRating}</span>
                                    }
                                    {(item.ageRating === "R13" || item.ageRating === "R16" || item.ageRating === "R18") &&
                                        <span className="badge badge-secondary" style={{ marginRight: "0.5rem", backgroundColor: "darkred" }}>{item.ageRating}</span>
                                    }
                                    {(item.ageRating === "M" || item.ageRating === "PG") &&
                                        <span className="badge badge-secondary" style={{ marginRight: "0.5rem", backgroundColor: "yellow", color: "black" }}>{item.ageRating}</span>
                                    }
                                    {item.ageRating === "TBC" &&
                                        <span className="badge badge-secondary" style={{ marginRight: "0.5rem" }}>{item.ageRating}</span>
                                    }
                                    <span className="badge badge-secondary" style={{ marginRight: "0.5rem" }}>{getGenre(item.genreId)}</span>
                                </h6>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        );
    }

    React.useEffect(() => {

        axios.get(`${APIUrl}/users/${localStorage.getItem('userId')}`, {
            headers: {
                'X-Authorization': localStorage.getItem('token')
            }
        }).then((response) => {
            setUserInfo(response.data)
            axios.get(`${APIUrl}/films?directorId=${localStorage.getItem('userId')}`
            ).then((response) => {
                setUserFilms(response.data["films"])
                setFilmCount(response.data["count"])
                axios.get(`${APIUrl}/films?reviewerId=${localStorage.getItem('userId')}`
                ).then((response) => {
                    setReviewedFilms(response.data["films"])
                }).catch(() => {
                });
            }).catch(() => {
            });
        })
        .catch(() => {
        });

    }, [location.search])

    React.useEffect(() => {

        getReviews()
    }, [reviewedFilms])

    return (
        <div className="profileBody">
            <Header></Header>
            <div className="row py-5 px-4">
                {userProfile()}
                <a id="toggleEditModal" style={{display: "none"}} data-toggle="modal" data-dismiss="modal" data-target="#editModal"></a>
                <div className="modal fade" id="editModal" tabIndex={-1} role="dialog" style={{overflow: "auto"}}
                     aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLongTitle">Edit Film</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="profile-picture-create-container">
                                    <img id="editFilmImg" src={`${APIUrl}/films/${editFilm.filmId}/image`}
                                         onError={(e) => {
                                             const target = e.target as HTMLImageElement;
                                             target.onerror = null;
                                             target.src = '../defaultFilm.png';
                                         }}
                                         className="img-fluid rounded-circle profile-picture-create" alt="Not found" style={{ width: "100px", height: "100px", objectFit: "cover", border: "1.5px solid black", cursor: "pointer" }} onMouseEnter={mouseOnEditFilm} onMouseLeave={mouseOffEditFilm} onClick={openEditFilmFilePicker}/>
                                    <input id="filePickerEditFilm" type="file" accept=".png,.jpg,.gif" style={{ display: "none" }} onChange={fileChangedEditFilm}/>
                                </div>
                                <div style={{display: 'flex', flexDirection: 'column', alignItems: "flex-start"}}>
                                    <label htmlFor="titleInputEdit"><strong>Title</strong></label>
                                    <input id="titleInputEdit" type="text" className="form-control" aria-label="Password" aria-describedby="basic-addon1"/>
                                    <div id="titleMaxLimitEdit" className="mt-2" hidden style={{color: "red"}}>Title has a maximum of 64 characters</div>
                                    <div id="titleMinLimitEdit" className="mt-2" hidden style={{color: "red"}}>A film must have a title</div>
                                    <div id="titlePercentErrorEdit" className="mt-2" hidden style={{color: "red"}}>A title cannot contain %</div>
                                    <div id="titleDuplicateErrorEdit" hidden className="mt-2" style={{color: "red"}}>A film already has that title</div>

                                    <div className="row w-100 m-0 mb-1 mt-2">
                                        <div className="col p-0 mr-2" style={{textAlign: "left"}}>
                                            <label htmlFor="genreInputEdit"><strong>Genre</strong></label>
                                            <Select id="genreInputEdit" value={selectedGenre} options={myGenresSelect} onChange={changeGenre}/>
                                        </div>
                                        <div className="col p-0" style={{textAlign: "left"}}>
                                            <label htmlFor="releaseDateInputEdit">Release Date</label>
                                            <input id="releaseDateInputEdit" type="datetime-local" className="form-control" aria-label="Password" aria-describedby="basic-addon1"/>
                                            <div id="releaseDateEditInPast" className="mt-2" hidden style={{color: "red"}}>Must be in the future</div>
                                        </div>
                                    </div>

                                    <div className="row w-100 m-0 mt-2">
                                        <div className="col p-0 mr-2" style={{textAlign: "left"}}>
                                            <label htmlFor="ageRatingInputEdit">Age Rating</label>
                                            <Select id="ageRatingInputEdit" value={selectedAgeRating} options={myAgeRatingSelect} onChange={changeAgeRating}/>
                                        </div>
                                        <div className="col p-0" style={{textAlign: "left"}}>
                                            <label htmlFor="runtimeInputEdit">Runtime</label>
                                            <input id="runtimeInputEdit" type="text" className="form-control" aria-label="Email" aria-describedby="basic-addon1"/>
                                            <div id="runtimeFormatEdit" className="mt-2" hidden style={{color: "red"}}>Format: 1hr 37m or 97</div>
                                            <div id="runtimeLengthEdit" className="mt-2" hidden style={{color: "red"}}>Runtime can not exceed 300</div>
                                        </div>
                                    </div>

                                    <label htmlFor="filmDescriptionEdit"><strong>Description</strong></label>
                                    <textarea className="form-control" id="filmDescriptionEdit" rows={3}></textarea>
                                </div>
                                <br/>
                                <p id="descriptionError" hidden style={{color: "red"}}>Film must have a description</p>
                            </div>
                            <div className="modal-footer d-flex justify-content-between">
                                <button type="button" className="btn btn-danger" onClick={handleDeleteFilm} style={{marginRight: "auto"}}>Delete</button>
                                <Confirm isOpen={open} title={`Delete film?`}
                                         confirm="Delete Film"
                                         cancel="Cancel"
                                         confirmColor="#eb4034"
                                         content="Are you sure you want to delete this film?"
                                         onConfirm={handleConfirm}
                                         onClose={handleDialogClose}/>
                                <button type="button" className="btn btn-secondary" data-dismiss="modal" style={{marginLeft: "auto"}}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleEditFilm}>Update</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )

}

export default Profile;