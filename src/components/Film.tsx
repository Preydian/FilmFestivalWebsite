import axios from 'axios';
import React from "react";
import {Link, useNavigate, useParams} from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Header from './Header';
import Tooltip from "@mui/material/Tooltip";
import {settings, settingsSimilar, APIUrl} from "../Helper/constants";
import {isDateTimeInPast, convertDateString, findTimeBetween} from "../Helper/formatting";
import {resizeDivs, reviewFilmModal} from "../Helper/javaScriptStuff";
import {refreshPage} from "../Helper/specificJavaScriptStuff";

const Film = () => {


    const {id} = useParams();
    const [genres, setGenres] = React.useState < Array < genre >> ([])
    const [selectedFilm, setFilm] = React.useState<filmFull>(
        {
            description: "", numReviews: 0, runtime: 0, filmId:0, title:"", ageRating:"", directorFirstName:"", directorLastName:""
            , directorId:0, genreId:0, rating:0, releaseDate:""})
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [films, setFilms] = React.useState<filmFull[]>([]);
    const [reviewedFilms, setReviewedFilms] = React.useState<number[]>([])
    const [similarFilms, setSimilarFilms] = React.useState<filmFull[]>([]);
    const [uniqueFilms, setUniqueFilms] = React.useState<filmFull[]>([]);
    const [reviews, setReviews] = React.useState([]);
    const [showReviews, setShowReviews] = React.useState(5);
    const [value, setValue] = React.useState("");

    const navigate = useNavigate()

    function getGenre(genreID:number) {
        for (let index = 0; index < genres.length; index++) {
            if (genres[index]["genreId"] === genreID) {
                return genres[index]["name"];
            }
        }
    }

    const changeValue = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
        setValue(changeEvent.target.value)
    }

    const handleLoadMore = () => {
        setShowReviews(showReviews + 5);
    };
    const loadAll = () => {
        setShowReviews(reviews.length);
    };

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

        const fetchSimilarFilms = async () => {

            const mergedFilms = [...films, ...similarFilms];
            const uniqueFilmsStr = new Set<string>(); // Set to keep track of unique persons as strings
            const uniqueFilms: filmFull[] = [];

            for (const film of mergedFilms) {
                const filmStr = JSON.stringify(film); // Convert person object to string
                if (!uniqueFilmsStr.has(filmStr)) {
                    uniqueFilmsStr.add(filmStr);
                    uniqueFilms.push(film);
                }
            }
            setUniqueFilms(uniqueFilms)

        }

        fetchSimilarFilms()
    }, [films, similarFilms])

    const goBack = () => {
        navigate(-1)
    }

    React.useEffect(() => {

        const getFilmImage = async ({selectedFilm}: { selectedFilm: any }) => {
            try {
                const [filmsResponse, reviewsResponse] = await Promise.all([
                    axios.get(`${APIUrl}/films?directorId=${selectedFilm.directorId}`),
                    axios.get(`${APIUrl}/films/${selectedFilm.filmId}/reviews`),
                ]);
                setErrorFlag(false);
                setErrorMessage("");
                setFilms(filmsResponse.data["films"]);

                if (localStorage.getItem('userId') !== null) {
                    const reviewedFilms = await axios.get(`${APIUrl}/films?reviewerId=${localStorage.getItem('userId')}`);
                    setReviewedFilms(reviewedFilms.data["films"].map((film: film) => film.filmId));
                }

                setErrorFlag(false);
                setErrorMessage("");
                setReviews(reviewsResponse.data);

            } catch (error) {
                setErrorFlag(true);
                setErrorMessage("Error fetching data.");
            }
        };

        const getFilm = async () => {
            try {
                const response = await axios.get(`${APIUrl}/films/` + id);
                setErrorFlag(false);
                setErrorMessage("");
                setFilm(response.data);
                await getFilmImage({selectedFilm: response.data});
            } catch (error) {
                setErrorFlag(false);
                // @ts-ignore
                setErrorMessage(error.toString());
            }
        };

        getFilm();
    }, [id]);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                axios.get(`${APIUrl}/films/genres`)
                    .then((response) => {
                        setGenres(response.data);
                });
                if (selectedFilm.genreId > 0) {
                    const similarFilmsResponse = axios.get(`${APIUrl}/films?genreIds=${selectedFilm.genreId}`);
                    const [similarFilms] = await Promise.all([similarFilmsResponse]);
                    setErrorFlag(false);
                    setErrorMessage("");
                    resizeDivs();
                    setSimilarFilms(similarFilms.data["films"]);
                }
            } catch (error) {
                setErrorFlag(true);
                setErrorMessage("Error fetching data.");
            }
        };
        fetchData()
    }, [selectedFilm])

    const list_of_directors_films = () => {
        return films.map((item: film) =>
            <div className="col" key={item.filmId}>
                <Link to={"/films/" + item.filmId} style={{textDecoration: "none"}} onClick={() => refreshPage(item.filmId, selectedFilm.filmId)}>
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
    };

    const list_of_similar_films = () => {
        return uniqueFilms.map((item: film, index: number) =>
            (item.title !== selectedFilm.title && (
                    <div className="col" key={item.filmId}>
                        <Link to={"/films/" + item.filmId} style={{textDecoration: "none"}} onClick={() => refreshPage(item.filmId, selectedFilm.filmId)}>
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
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                )
            ));
    };

    const list_of_film_reviews = () => {
        return reviews.slice(0, showReviews).map((item: review, index: number) => (
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

    if (errorFlag) {
        return (
            <div>
                <h1>Film</h1>
                <div style={{ color: "red" }}>
                    {errorMessage}
                </div>
                <Link to={"/films"}>Back to films</Link>
            </div>
        )
    } else {
        if (selectedFilm.directorId > 0) {
            return (
                <div>
                    <Header></Header>
                    <div className="film-container">
                        <div className="film-card">
                            <div className="card text-center">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <ul className="nav nav-pills card-header-pills" style={{ flex: 1 }}>
                                        <li className="nav-item" key="film">
                                            <a className="nav-link active" data-toggle="tab" href="#nav-film">Film</a>
                                        </li>
                                        <li className="nav-item" key="director">
                                            <a className="nav-link" data-toggle="tab" href="#nav-director">Director</a>
                                        </li>
                                        <li className="nav-item" key="reviews">
                                            <a className="nav-link" data-toggle="tab" href="#nav-reviews">Reviews</a>
                                        </li>
                                        <li className="nav-item" key="similar">
                                            <a className="nav-link" data-toggle="tab" href="#nav-similar">Similar Films</a>
                                        </li>
                                    </ul>
                                    <div onClick={goBack} style={{cursor: "pointer"}}>
                                        <svg xmlns="http:// www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-arrow-left mr-2    " viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                                        </svg>
                                        Back
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="tab-content" style={{ flex: "1", marginRight: "2rem" }}>

                                        {/*Film tab*/}
                                        <div className="tab-pane show active" id="nav-film" style={{ width: "100%", height: "100%"}}>
                                            <div style={{ display: "flex", flexDirection: "row" }}>
                                                <div id="imgDiv" style={{ flex: "1", marginRight: "2rem" }}>
                                                    <img id="imgImg" className="card-img-top"
                                                         src={`${APIUrl}/films/${selectedFilm.filmId}/image`}
                                                         onError={(e) => {
                                                             const target = e.target as HTMLImageElement;
                                                             target.onerror = null;
                                                             target.src = '../defaultFilm.png';
                                                         }}
                                                         alt="Card cap" style={{ width: "100%", objectFit: "cover" }} />
                                                </div>
                                                <div id="infoDiv" style={{ flex: "2" }}>
                                                    <h1 style={{ textAlign: "left" }}>{selectedFilm.title}</h1>
                                                    <div className="meta lg" style={{ display: "flex", flexDirection: "row", width: "10%" }}>
                                                        <span className="badge badge-secondary" style={{ marginRight: "0.5rem" }}>
                                                        <div style={{ display: "flex", alignItems: "center" }}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" fill="gold" className="bi bi-star-fill" viewBox="0 0 16 16">
                                                              <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                            </svg>
                                                            <span style={{ marginLeft: "0.25rem" }}>{selectedFilm.rating}</span>
                                                          </div>
                                                        </span>
                                                        {selectedFilm.ageRating === "G" &&
                                                            <span className="badge badge-secondary" style={{ marginRight: "0.5rem", backgroundColor: "lightgreen", color: "black" }}>{selectedFilm.ageRating}</span>
                                                        }
                                                        {(selectedFilm.ageRating === "R13" || selectedFilm.ageRating === "R16" || selectedFilm.ageRating === "R18") &&
                                                            <span className="badge badge-secondary" style={{ marginRight: "0.5rem", backgroundColor: "darkred" }}>{selectedFilm.ageRating}</span>
                                                        }
                                                        {(selectedFilm.ageRating === "M" || selectedFilm.ageRating === "PG") &&
                                                            <span className="badge badge-secondary" style={{ marginRight: "0.5rem", backgroundColor: "yellow", color: "black" }}>{selectedFilm.ageRating}</span>
                                                        }
                                                        {selectedFilm.ageRating === "TBC" &&
                                                            <span className="badge badge-secondary" style={{ marginRight: "0.5rem" }}>{selectedFilm.ageRating}</span>
                                                        }
                                                        <span className="badge badge-secondary" style={{ marginRight: "0.5rem" }}>{getGenre(selectedFilm.genreId)}</span>
                                                    </div>
                                                    <div style={{ textAlign: "left", margin: "0 0 15px 0" }} className="mt-2">
                                                        {selectedFilm.description}
                                                    </div>
                                                    <div>
                                                        <div className="meta">
                                                            <div className="titles">
                                                                <span><strong>Genre:</strong></span>
                                                                <span><strong>Release:</strong></span>
                                                                <span><strong>Director:</strong></span>
                                                            </div>
                                                            <div className="title-Description">
                                                                <span>{getGenre(selectedFilm.genreId)}</span>
                                                                <span itemProp="dateCreated" className="ml-1" style={{width: "230px"}}>{convertDateString(selectedFilm.releaseDate)}</span>
                                                                <span className="shorting ml-1" data-max="20">{selectedFilm.directorFirstName} {selectedFilm.directorLastName}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {localStorage.getItem('userId') !== null && localStorage.getItem('userId') !== selectedFilm.directorId.toString() && isDateTimeInPast(selectedFilm.releaseDate) && !reviewedFilms.includes(selectedFilm.filmId) &&
                                                        <button id="editProfileBtn" className="btn btn-outline-dark btn-sm btn-block mt-1" style={{zIndex: "100", position: "relative"}} onClick={(e) => {e.stopPropagation(); e.preventDefault(); reviewFilmModal(selectedFilm);}}>
                                                            Review
                                                        </button>
                                                    }
                                                    {reviewedFilms.includes(selectedFilm.filmId) &&
                                                        <button id="editProfileBtn" disabled className="btn btn-outline-dark btn-sm btn-block mt-1" style={{zIndex: "100", position: "relative"}} onClick={(e) => {e.stopPropagation(); e.preventDefault(); reviewFilmModal(selectedFilm);}}>
                                                            Already Reviewed
                                                        </button>
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                        {/*Director tab*/}
                                        <div className="tab-pane fade" id="nav-director" style={{ width: "100%", height: "100%"}}>
                                            <div>
                                                <div className="d-flex justify-content-center my-3" style={{ width: "105%"}}>
                                                    <img src={`${APIUrl}/users/${selectedFilm.directorId}/image`}
                                                         onError={(e) => {
                                                             const target = e.target as HTMLImageElement;
                                                             target.onerror = null;
                                                             target.src = '../defaultUser.jpg';
                                                         }}
                                                         className="img-fluid rounded-circle profile-picture"
                                                         alt="Not found" style={{width: "200px", height: "200px", objectFit: "cover" }}/>
                                                </div>
                                                <span style={{ marginLeft: "1rem" }}> <strong>{selectedFilm.directorFirstName} {selectedFilm.directorLastName} </strong></span>
                                                <br/>
                                                {films.length > 0 &&
                                                    <div style={{width: "105%"}}>
                                                        {films.length === 1 &&
                                                            <span style={{ marginLeft: "1rem"}}> {selectedFilm.directorFirstName} {selectedFilm.directorLastName} has directed the film below</span>
                                                        }
                                                        {films.length > 1 &&
                                                            <span style={{ marginLeft: "1rem"}}> {selectedFilm.directorFirstName} {selectedFilm.directorLastName} has directed the {films.length} films below</span>
                                                        }
                                                        <br/>
                                                        <br/>
                                                        {films.length > 2 &&
                                                            <Slider {...settings}>
                                                                {list_of_directors_films()}
                                                            </Slider>
                                                        }
                                                        {films.length <= 2 &&
                                                            <div className="row row-cols-1 row-cols-md-2">
                                                                {list_of_directors_films()}
                                                            </div>
                                                        }
                                                    </div>
                                                }
                                            </div>
                                        </div>

                                        {/*Review tab*/}
                                        <div className="tab-pane fade" id="nav-reviews">
                                            {reviews.length > 0 &&
                                                <div className="card-container">
                                                    { reviews.length > 1 &&
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: "center" }}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chat-left-text" viewBox="0 0 16 16">
                                                                    <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                                                    <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                                                                </svg>
                                                                <h4 style={{ marginLeft: '8px' }}>
                                                                    {reviews.length} Reviews
                                                                </h4>
                                                            </div>
                                                            <div style={{textAlign: "right"}}>
                                                                {showReviews < reviews.length &&
                                                                <small className="text-muted" onClick={loadAll}> <i className="fas fa-image mr-1"></i>Show all</small>
                                                                }
                                                            </div>
                                                        </div>
                                                    }
                                                    { reviews.length === 1 &&
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: "center" }}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chat-left-text" viewBox="0 0 16 16">
                                                                <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                                                <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                                                            </svg>
                                                            <h4 style={{ marginLeft: '8px' }}>
                                                                {reviews.length} Review
                                                            </h4>
                                                        </div>
                                                    }
                                                    {list_of_film_reviews()}
                                                    {showReviews < reviews.length && (
                                                        <button className="btn btn-primary" onClick={handleLoadMore}>
                                                            Load more
                                                        </button>
                                                    )}
                                                </div>
                                            }
                                            {reviews.length < 1 &&
                                                <h2>This film hasn't been reviewed yet</h2>
                                            }
                                        </div>

                                        {/*Similar Films tab*/}
                                        <div className="tab-pane fade" id="nav-similar" style={{ width: "100%", height: "100%"}}>
                                            <div>
                                                {films.length > 0 &&
                                                    <div>
                                                        <span style={{ marginLeft: "1rem"}}> More movies with the same director or genre as <strong> {selectedFilm.title} </strong></span>
                                                        <br/>
                                                        <br/>
                                                        {uniqueFilms.length - 1 > 2 &&
                                                            <div style={{width: "105%"}}>
                                                                <Slider {...settingsSimilar}>
                                                                    {list_of_similar_films()}
                                                                </Slider>
                                                            </div>

                                                        }
                                                        {uniqueFilms.length - 1 <= 2 &&
                                                            <div className="row row-cols-1 row-cols-md-2">
                                                                {list_of_similar_films()}
                                                            </div>
                                                        }
                                                    </div>
                                                }
                                            </div>
                                        </div>

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

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div>

                </div>
            )
        }
    }
}
export default Film;