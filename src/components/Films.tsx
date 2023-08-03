import axios from 'axios';
import React from "react";
import {Link, useLocation, useNavigate} from 'react-router-dom';
import Header from "./Header";
import 'react-tooltip/dist/react-tooltip.css'
import Tooltip from '@mui/material/Tooltip';
import {ageRatings, sortOptions, myGenres, sortOptionDic, sortDirectionDic, APIUrl} from "../Helper/constants";
import {isDateTimeInPast, convertDateString} from "../Helper/formatting";
import {alignFilters, stop} from "../Helper/javaScriptStuff";
const Films = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const [films, setFilms] = React.useState<filmFull[]>([]);
    const [count, setCount] = React.useState(0);
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [query, setQuery] = React.useState(!location.search.includes("startIndex") ? "?startIndex=0": location.search);
    const [loading, setLoading] = React.useState(true);
    const [genres, setGenres] = React.useState <Array<genre>>([])
    const [genreFilters, setGenreFilters] = React.useState<Set<String>>(new Set());
    const [ageRatingFilters, setAgeRatingFilters] = React.useState<Set<String>>(new Set());
    const [sortOption, setSortOption] = React.useState("Release Date");
    const [sortDirection, setSortDirection] = React.useState("Ascending");
    const firstCardRef = React.useRef(null);
    const [value, setValue] = React.useState("");
    const [reviewedFilms, setReviewedFilms] = React.useState<number[]>([])

    function getGenre(genreID: number) {
        for (let index = 0; index < genres.length; index++) {
            if (genres[index]["genreId"] === genreID) {
                return genres[index]["name"];
            }
        }
    }

    const reviewFilm = () => {

        // @ts-ignore
        const reviewString = document.getElementById("filmReview").value

        const updatedData = {
            rating: parseInt(value),
            review: reviewString,
        };

        axios.post(`${APIUrl}/films/${localStorage.getItem('reviewFilmId')}/reviews`, updatedData, {
            headers: {
                'X-Authorization': localStorage.getItem('token')
            }
        }).then(() => {
            localStorage.removeItem('reviewFilmId')
            window.location.reload()
        })
        .catch(() => {
        })

    }

    React.useEffect(() => {

        setQuery(!location.search.includes("startIndex") ? "?startIndex=0": location.search)
    }, [location.search]);

    const getReviewedFilms = async () => {

        if (localStorage.getItem('userId') !== null) {
            const reviewedFilms = await axios.get(`${APIUrl}/films?reviewerId=${localStorage.getItem('userId')}`);
            setReviewedFilms(reviewedFilms.data["films"].map((film: film) => film.filmId));
        }

    }

    React.useEffect(() => {

        if (loading) {

            getReviewedFilms()
            let dynamicQuery = query
            if (!query.includes("startIndex")) {
                dynamicQuery = "?startIndex=0" + query
            }

            axios.get(`${APIUrl}/films${dynamicQuery}`)
                .then((response) => {
                    setErrorFlag(false);
                    setErrorMessage("");
                    setFilms(response.data["films"]);
                    setCount(response.data["count"]);
                    axios.get(`${APIUrl}/films/genres`)
                        .then((response) => {
                            setErrorFlag(false)
                            setErrorMessage("")
                            setGenres(response.data);
                        })
                        .catch((error) => {
                            setErrorFlag(true);
                            setErrorMessage(error.toString());
                        });
                })
                .catch((error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                    setLoading(false);
                });
        }
    }, [query]);

    const addPagination = () => {
        const urlParams = new URLSearchParams(query);
        let startIndex = parseInt(urlParams.get('startIndex') ?? '0' );
        alignFilters()
        return Array.from({length: Math.ceil(count / 10)}, (_, i) => {

            urlParams.set('startIndex', ((i * 10)).toString());
            const newQuery = '?' + urlParams.toString();
            const pageNumber = i + 1;
            const active = startIndex / 10 + 1 === pageNumber;
            return (
                <Link className={`page-item ${active ? 'active' : ''}`} to={`/films${newQuery}`} key={pageNumber}>
                    <li className="page-link">{pageNumber}</li>
                </Link>
            );
        });
    }

    const addGenreFilter = () => {
        return genres.map((item: genre, index:number) =>
            <li id="genreLi" key={index}>
                <input className="form-check-input" type="checkbox" id={`inlineCheckboxGenre${index}`} onClick={(event) => checkBox(index, event, "genre")}/>
                <label className="form-check-label" id={`genre${index}`} htmlFor={`inlineCheckboxGenre${index}`} onClick={(event) => stop(event)}>{item.name}</label>
            </li>
        )
    }

    const addAgeRatingFilter = () => {
        return ageRatings.map((item: string, index:number) =>
            <li id="ageRatingLi" key={index}>
                <input className="form-check-input" type="checkbox" id={`inlineCheckboxAgeRating${index}`} onClick={(event) => checkBox(index, event, "ageRating")}/>
                <label className="form-check-label" id={`ageRating${index}`} htmlFor={`inlineCheckboxAgeRating${index}`} onClick={(event) => stop(event)}>{item}</label>
            </li>
        )
    }
    const addSortOptions = () => {
        return sortOptions.map((item: string, index:number) =>
            <li className={"form-check"} id="sortLi" key={index + 1}>
                <input className="form-check-input" type="radio" id={`inlineSortRadio${index + 1}`} name="flexRadioDefault" onClick={(event) => checkBox(index + 1, event, "sort")} defaultChecked/>
                <label className="form-check-label" id={`sort${index + 1}`} htmlFor={`inlineSortRadio${index + 1}`}>{item}</label>
            </li>
        )
    }

    const resetFilters = () => {
        const urlParams3 = new URLSearchParams(query);
        if (genreFilters.size > 0 || ageRatingFilters.size > 0 || urlParams3.get("q") !== null || (sortDirection !== "Ascending" || sortOption !== "Release Date")) {
            navigate(`/films?startIndex=0&count=10`)
            window.location.reload()
        }
    }

    React.useEffect(() => {
        const applyFilters = () => {
            const urlParams2 = new URLSearchParams(query);
            let final = ""
            let potential = [genreFilters.size > 0 || ageRatingFilters.size > 0 ? "?startIndex=0": "?startIndex=" + urlParams2.get("startIndex"), "&count=10", "&q=" +  urlParams2.get("q")]
            for (const param of potential) {
                if (param.split("=")[1] !== 'null') {
                    final += param
                }
            }
            let genreFiltersQuery = ""
            let ageRatingFiltersQuery = ""
            for (const filter of genreFilters) {
                // @ts-ignore
                genreFiltersQuery = `${genreFiltersQuery}&genreIds=${myGenres[filter]}`
            }
            for (const filter of ageRatingFilters) {
                // @ts-ignore
                ageRatingFiltersQuery = `${ageRatingFiltersQuery}&ageRatings=${filter}`
            }
            // @ts-ignore
            let sortByQuery = `&sortBy=${sortOptionDic[sortOption]}${sortDirectionDic[sortDirection]}`
            navigate(`/films${final}${ageRatingFiltersQuery+genreFiltersQuery+sortByQuery}`);
        }
        applyFilters()
    }, [genreFilters, ageRatingFilters, sortOption, sortDirection, query])

    const checkBox = (idNum:number, event:React.MouseEvent<HTMLInputElement, MouseEvent>, filterType:string) => {
        event.stopPropagation()
        switch(filterType) {
            case "genre": {
                let element = document.getElementById("genre" + idNum);
                if (!genreFilters.has(element!.innerText)) {
                    setGenreFilters(prev => new Set([...prev, element!.innerText]));
                } else {
                    genreFilters.delete(element!.innerText)
                    setGenreFilters(new Set(genreFilters));
                    let box = document.getElementById("genreBtnSpan")
                    let output = "Genre "
                    if (genreFilters.size <= 1) {
                        for (const filter of genreFilters) {
                            output = `${output} ${filter}`
                        }
                        box!.innerText = output
                    } else {
                        box!.innerText = `Genre ${genreFilters.size} selected`
                    }
                }
                break;
            }
            case "ageRating": {
                let element = document.getElementById("ageRating" + idNum);
                if (!ageRatingFilters.has(element!.innerText)) {
                    setAgeRatingFilters(prev => new Set([...prev, element!.innerText]));
                } else {
                    ageRatingFilters.delete(element!.innerText)
                    setAgeRatingFilters(new Set(ageRatingFilters))
                    let box = document.getElementById("ageRatingSpanBtn")
                    let output = "Age Rating "
                    if (ageRatingFilters.size <= 1) {
                        for (const filter of ageRatingFilters) {
                            output = `${output} ${filter}`
                        }
                        // @ts-ignore
                        box.innerText = output
                    } else {
                        // @ts-ignore
                        box.innerText = `Age Rating ${ageRatingFilters.size} selected`
                    }
                }
                break;
            }
            case "sort": {
                let element = document.getElementById("sort" + idNum);
                // @ts-ignore
                setSortOption(element.innerText)
                break;
            }
            case "sortDirection": {
                let element = document.getElementById("sortDirection" + idNum);
                // @ts-ignore
                setSortDirection(element.innerText)
                break;
            }
        }
    }

    const reviewFilmModal = async (film: film) => {

        localStorage.setItem('reviewFilmId', film.filmId.toString())
        // @ts-ignore
        document.getElementById("toggleReviewModal").click()
    }

    function changeSortBtnText() {
        const box = document.getElementById("sortSpanBtn")
        // @ts-ignore
        switch (sortOption) {
            case "Release Date": {
                if (sortDirection !== "Ascending") {
                    // @ts-ignore
                    box.innerText = `Sort ${sortOption}: New - Old`
                } else {
                    // @ts-ignore
                    box.innerText = `Sort ${sortOption}: Old - New`
                }
                break;
            }
            case "Title": {
                if (sortDirection === "Ascending") {
                    // @ts-ignore
                    box.innerText = `Sort ${sortOption}: A - Z`
                } else {
                    // @ts-ignore
                    box.innerText = `Sort ${sortOption}: Z - A`
                }
                break;
            }
            case "Rating": {
                if (sortDirection === "Ascending") {
                    // @ts-ignore
                    box.innerText = `Sort ${sortOption}: 0 - 10`
                } else {
                    // @ts-ignore
                    box.innerText = `Sort ${sortOption}: 10 - 0`
                }
                break;
            }
        }
    }

    React.useEffect(() => {
        changeSortBtnText()
    }, [sortOption, sortDirection])

    React.useEffect(() => {
        let box = document.getElementById("genreBtnSpan")
        let output = "Genre "
        if (genreFilters.size <= 1) {
            for (const filter of genreFilters) {
                output = `${output} ${filter}`
            }
            // @ts-ignore
            box.innerText = output
        } else {
            // @ts-ignore
            box.innerText = `Genre ${genreFilters.size} selected`
        }
    }, [genreFilters])

    React.useEffect(() => {
        let box = document.getElementById("ageRatingSpanBtn")
        let output = "Age Rating "
        if (ageRatingFilters.size <= 1) {
            for (const filter of ageRatingFilters) {
                output = `${output} ${filter}`
            }
            // @ts-ignore
            box.innerText = output
        } else {
            // @ts-ignore
            box.innerText = `Age Rating ${ageRatingFilters.size} selected`
        }
    }, [ageRatingFilters])


    const list_of_films = () => {
        if (films.length === 0) {
            return (
                <p style={{flex: "auto", maxWidth: "none"}}>No Films</p>
            )
        }
        return films.map((item: film, index: number) =>
            <div className="col mb-4" style={{minWidth: "347px" }} key={item.filmId} ref={index === 0 ? firstCardRef : null}>
                <Link to={"/films/" + item.filmId} style={{textDecoration: "none"}}>
                    <div className="cardFilm" id={`film_${index}`}>
                        <img className="card-img-top" src={`${APIUrl}/films/${films[index].filmId}/image`}
                            onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = '../defaultFilm.png';
                        }} alt="Card cap" style={{width: "100%", height: "200px", objectFit: "cover"}}/>
                        <div className="card-body" id="filmCardLink">
                            <h5 className="card-title">{item.title}</h5>
                            <div className="card-text" style={{textAlign: "left"}}>
                                <img className="card-img-top img-fluid rounded-circle profile-picture mr-2" src={`${APIUrl}/users/${films[index].directorId}/image`}
                                     onError={(e) => {
                                         const target = e.target as HTMLImageElement;
                                         target.onerror = null;
                                         target.src = '../defaultUser.jpg';
                                     }}
                                     alt="Card cap" style={{width: "30px", height: "30px", objectFit: "cover"}}/>
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
                                {localStorage.getItem('userId') !== null && localStorage.getItem('userId') !== item.directorId.toString() && isDateTimeInPast(item.releaseDate) && !reviewedFilms.includes(item.filmId) &&
                                    <button id="editProfileBtn" className="btn btn-outline-dark btn-sm btn-block" style={{zIndex: "100", position: "relative"}} onClick={(e) => {e.stopPropagation(); e.preventDefault(); reviewFilmModal(item);}}>
                                        Review
                                    </button>
                                }
                                {(localStorage.getItem('userId') !== null && localStorage.getItem('userId') === item.directorId.toString()) && isDateTimeInPast(item.releaseDate) &&
                                    <button id="editProfileBtn" disabled className="btn btn-outline-dark btn-sm btn-block" style={{zIndex: "100", position: "relative"}} onClick={(e) => {e.stopPropagation(); e.preventDefault(); reviewFilmModal(item);}}>
                                        Can't review your own film
                                    </button>
                                }
                                {localStorage.getItem('userId') === null &&
                                    <button id="editProfileBtn" disabled className="btn btn-outline-dark btn-sm btn-block" style={{zIndex: "100", position: "relative"}} onClick={(e) => {e.stopPropagation(); e.preventDefault(); reviewFilmModal(item);}}>
                                        Log in or register to review
                                    </button>
                                }
                                {!isDateTimeInPast(item.releaseDate) && localStorage.getItem('userId') !== null &&
                                    <button id="editProfileBtn" disabled className="btn btn-outline-dark btn-sm btn-block" style={{zIndex: "100", position: "relative"}} onClick={(e) => {e.stopPropagation(); e.preventDefault(); reviewFilmModal(item);}}>
                                        Not Released
                                    </button>
                                }
                                {reviewedFilms.includes(item.filmId) &&
                                    <button id="editProfileBtn" disabled className="btn btn-outline-dark btn-sm btn-block" style={{zIndex: "100", position: "relative"}} onClick={(e) => {e.stopPropagation(); e.preventDefault(); reviewFilmModal(item);}}>
                                        Already Reviewed
                                    </button>
                                }
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        );
    };

    const changeValue = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
        setValue(changeEvent.target.value)
    }

    if (errorFlag) {
        return (
            <div>
                <h1>Films</h1>
                <div style={{color: "red"}}>
                    {errorMessage}
                </div>
            </div>
        );
    } else {
        const urlParams = new URLSearchParams(query);
        let index = parseInt(urlParams.get('startIndex') ?? '0');
        urlParams.set('startIndex', '0');
        const fistQuery = '?' + urlParams.toString();
        urlParams.set('startIndex', (Math.floor((count-1)/10) * 10).toString());
        const lastQuery = '?' + urlParams.toString();
        return (
            <div className="profileBody">
                <Header></Header>
                <h1>Films</h1>
                <div>
                    <a id="toggleReviewModal" style={{display: "none"}} data-toggle="modal" data-dismiss="modal" data-target="#reviewModal"></a>
                    <div className="modal fade show" id="reviewModal" tabIndex={-1} role="dialog"
                         aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalLongTitle">Review Film</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div style={{display: 'flex', flexDirection: 'column', alignItems: "flex-start"}}>
                                        <label htmlFor="filmRatingReview"><strong>Rating:</strong> {value}</label>
                                        <Tooltip className="mb-2" title={value} arrow placement="top">
                                            <input style={{height: "12px"}} id={"filmRatingReview"} type="range" min={1} max={10}
                                                   step={1} value={value}
                                                   data-tooltip-id="my-tooltip" data-tooltip-content={value}
                                                   onChange={changeEvent => changeValue(changeEvent)}/>
                                        </Tooltip>
                                        <label htmlFor="filmReview">Review</label>
                                        <textarea className="form-control" id="filmReview" rows={3}></textarea>
                                    </div>
                                    <br/>
                                    {/*<p style={{color: "red"}}>{errorMessageLogin}</p>*/}
                                </div>
                                <div className="modal-footer d-flex justify-content-between">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal" style={{marginLeft: "250px"}}>Close</button>
                                    <button type="button" className="btn btn-primary" onClick={reviewFilm}>Submit Review</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
                        <div className="dropdown">
                            <button className="btn btn-secondary dropdown-toggle" type="button" id="genreBtn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ marginRight: '20px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-folder2-open" viewBox="0 0 16 16">
                                    <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14V3.5zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5V6zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7H1.633z"/>
                                </svg>
                                <span id="genreBtnSpan">Genre</span>
                            </button>
                            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton" style={{width: "300px"}}>
                                <ul id="genreUl" style={{ display: 'flex', flexWrap: 'wrap', listStyle: 'none' }}>
                                    {addGenreFilter()}
                                </ul>
                            </div>
                        </div>

                        <div className="dropdown">
                            <button className="btn btn-secondary dropdown-toggle" type="button" id="ageRatingBtn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ marginRight: '20px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-slash-circle" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M11.354 4.646a.5.5 0 0 0-.708 0l-6 6a.5.5 0 0 0 .708.708l6-6a.5.5 0 0 0 0-.708z"/>
                                </svg>
                                <span id="ageRatingSpanBtn">Age Rating</span>
                            </button>
                            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton" style={{width: "300px"}}>
                                <ul id="ageRatingUl" style={{ display: 'flex', flexWrap: 'wrap', listStyle: 'none' }}>
                                    {addAgeRatingFilter()}
                                </ul>
                            </div>
                        </div>

                        <div className="dropdown">
                            <button className="btn btn-secondary dropdown-toggle" type="button" id="ageRatingBtn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ marginRight: '20px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sort-down" viewBox="0 0 16 16">
                                    <path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 11.293V2.5zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z"/>
                                </svg>
                                <span id="sortSpanBtn">Sort</span>
                            </button>
                            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton" onClick={(event) => event.stopPropagation()}>
                                <ul id="sortUl">
                                    {addSortOptions()}
                                </ul>
                                <div className="dropdown-divider"></div>
                                <ul id="sortUl">
                                    <li className={"form-check"} id="sortLi" key={-1}>
                                        <input className="form-check-input" type="radio" id={`inlineSortDirectionRadio${0}`} name="flexRadioDirection" onClick={(event) => checkBox(0, event, "sortDirection")} defaultChecked />
                                        <label className="form-check-label" id={`sortDirection${0}`} htmlFor={`inlineSortDirectionRadio${0}`}>Ascending</label>
                                    </li>
                                    <li className={"form-check"} id="sortLi" key={-2}>
                                        <input className="form-check-input" type="radio" id={`inlineSortDirectionRadio${1}`} name="flexRadioDirection" onClick={(event) => checkBox(1, event, "sortDirection")}/>
                                        <label className="form-check-label" id={`sortDirection${1}`} htmlFor={`inlineSortDirectionRadio${1}`}>Descending</label>
                                    </li>
                                </ul>
                            </div>
                        </div>


                        <button className="btn btn-danger ml-auto" type="button" id="resetBtn" onClick={resetFilters}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                            </svg>
                            <span id="resetBtnSpan">Reset</span>
                        </button>

                    </div>

                    <div className="container mt-4 ml-5 mr-5">
                        {films.length < 5 &&
                            <div className={`row row-cols-1 row-cols-md-${films.length}`}>
                                {list_of_films()}
                            </div>
                        }
                        {films.length >= 5 &&
                            <div className="row row-cols-1 row-cols-md-5 slide-up">
                                {list_of_films()}
                            </div>
                        }
                    </div>
                    {films.length > 0 &&
                        <nav aria-label="..." style={{display: "flex", justifyContent: "center"}}>
                            <ul className="pagination">
                                {index > 0 &&
                                    <Link className="page-item" to={`/films${index > 0 ? fistQuery : ''}`} key={index}>
                                        <li className="page-link">First</li>
                                    </Link>
                                }
                                {addPagination()}
                                {Math.floor((count - 1)/10) * 10 !== index && count > 10 &&
                                    <Link className="page-item" to={`/films${Math.floor(count/10) !== index ? lastQuery : ''}`} key={Math.floor(count/10)}>
                                        <li className="page-link">Last</li>
                                    </Link>
                                }
                            </ul>
                        </nav>
                    }
                </div>
            </div>
        );
    }
}

export default Films;
