const emailRegex = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?")
const validNumberRegex = /^\b([1-9]|[1-9][0-9]|[1-2][0-9][0-9]|300)\b$/;
const numberOnlyRegex = /^\d+$/;

const passwordRegex = new RegExp(".{6,}")
const nameRegex = new RegExp("[a-zA-Z]{1,64}")
const runtimeRegex = /^[1-9]+hr\s\d{1,2}m$/;
const letterAndNumberOnlyRegex = /^[a-zA-Z-0-9]+$/;

const ageRatings = ["G", "PG", "M", "R13", "R16", "R18", "TBC"]

const sortOptions = ["Title",  "Rating", "Release Date"]

const myAgeRatingSelect = [
    {value: 1, label: "G"},
    {value: 2, label: "PG"},
    {value: 3, label: "M"},
    {value: 4, label: "R13"},
    {value: 5, label: "R16"},
    {value: 6, label: "R18"},
    {value: 7, label: "TBC"},
];

const myGenres = {
    "Comedy":1,
    "Romance":2,
    "Sci-Fi":3,
    "Film-Noir":4,
    "Action":5,
    "Animation":6,
    "Drama":7,
    "Horror":8,
    "Crime":9,
    "Thriller":10,
    "Western":11,
    "Other": 12
};

const myGenresSelect = [
    {value: 1, label: "Comedy"},
    {value: 2, label: "Romance"},
    {value: 3, label: "Sci-Fi"},
    {value: 4, label: "Film-Noir"},
    {value: 5, label: "Action"},
    {value: 6, label: "Animation"},
    {value: 7, label: "Drama"},
    {value: 8, label: "Horror"},
    {value: 9, label: "Crime"},
    {value: 10, label: "Thriller"},
    {value: 11, label: "Western"},
    {value: 12, label: "Other"},
];

const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 2
};

const sortOptionDic = {
    "Title": "ALPHABETICAL_",
    "Rating": "RATING_",
    "Release Date": "RELEASED_"
};

const sortDirectionDic = {
    "Ascending": "ASC",
    "Descending": "DESC",
}

const settingsSimilar = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 2
};

const APIUrl = "https://seng365.csse.canterbury.ac.nz/api/v1"
// const APIUrl = "http://localhost:4941/api/v1"


export {emailRegex, validNumberRegex, numberOnlyRegex, ageRatings, myAgeRatingSelect, myGenresSelect, myGenres, settings,
    nameRegex, letterAndNumberOnlyRegex, runtimeRegex, passwordRegex, sortOptions, sortOptionDic, sortDirectionDic, settingsSimilar, APIUrl}
