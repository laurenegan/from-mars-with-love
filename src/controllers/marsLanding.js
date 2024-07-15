import axios from "axios";
import Handlebars from "handlebars";
import database from "../../firebaseConfig";

export default function marsLandingController() {
    axios
    .get("templates/marsLanding.hbs")
    .then((response1) => {
        const marsLandingPageHtml = response1.data;

        axios
        .get("templates/photoFromArchive.hbs")
        .then((response2) => {
            const photoFromArchiveHtml = response2.data;

            axios
            .get("templates/photoResults.hbs")
            .then((response3) => {
                const photoSearchHtml = response3.data;

                return render(marsLandingPageHtml, photoFromArchiveHtml, photoSearchHtml);
            });
        });
    });

    //function render(marsLandingPageHtml) {
    function render(marsLandingPageHtml, photoFromArchiveHtml, photoSearchHtml) {
        const marsLandingPageFunc = Handlebars.compile(marsLandingPageHtml);
        const photoFromArchiveFunc = Handlebars.compile(photoFromArchiveHtml);
        const photoSearchTemplateFunc = Handlebars.compile(photoSearchHtml);

        document
        .getElementById("root")
        .innerHTML = marsLandingPageFunc();

        //Generate Randome Date
        function randomDate(start, end) {
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
        }
        //Found on FreeCodeCamp: https://www.freecodecamp.org/news/javascript-date-now-how-to-get-the-current-date-in-javascript/
        function formatDate(date, format) {
            const map = {
                mm: date.getMonth() + 1,
                dd: date.getDate(),
                //yy: date.getFullYear().toString().slice(-2),
                yyyy: date.getFullYear()
            }

            return format.replace(/mm|dd|yyyy/gi, matched => map[matched])
        }
        //Query ingredients
        const firstPhotoDay = new Date("2012-08-02"); //First day of Curiosity's photos
        const today = new Date();
        const URL = "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?";
        const apiKey = "Kh8M2QocU6ss69muwg6Etc4l2BpUh37fll0y8yoX";
        const roverCameras = ["FHAZ", "RHAZ", "MAST", "CHEMCAM", "MAHLI", "MARDI", "NAVCAM"];

        let randomPhotoDate = randomDate(firstPhotoDay, today);
        let roverCamera = roverCameras[Math.floor(Math.random() * roverCameras.length)];
        let earthDate = formatDate(randomPhotoDate, 'yyyy-mm-dd');
        
        console.log("First photo: " + firstPhotoDay);
        console.log("Today: " + today);
        console.log("Random date: " + randomPhotoDate);
        console.log("Random Earth Date: " + earthDate);

        axios
        .get(URL + "earth_date=" + earthDate + "&camera=" + roverCamera + "&api_key=" + apiKey)
        .then(function (response) {
            let randomPhoto = response.data.photos[Math.floor(Math.random() * response.data.photos.length)];

            if (response.data.photos.length === 0 && document.getElementById("photoFromArchiveContent") === null) {
                document.getElementById("noPhotoFromArchiveFound").style.display = "block";

                return console.log("This is the case when there are no photos returned from the API");

            } else if (response.data.photos.length === 0) {
                document.getElementById("noPhotoFromArchiveFound").style.display = "block";
                document.getElementById("photoFromArchiveContent").style.display = "none";
                document.getElementById("photoFromArchiveImage").style.display = "none";

                return console.log("This is the case when there are no photos returned from the API");
            }
            else {
                //Push data into template
                document
                .getElementById("photoFromArchive")
                .innerHTML += photoFromArchiveFunc({
                    //photoRover: randomPhoto.rover.name,
                    photoCamera: randomPhoto.camera.full_name,
                    photoURL: randomPhoto.img_src,
                    photoDate: randomPhoto.earth_date,
                    photoID: randomPhoto.id
                });

                document.getElementById("noPhotoFromArchiveFound").style.display = "none";
                document.getElementById("photoFromArchiveContent").style.display = "block";
                document.getElementById("photoFromArchiveImage").style.display = "block";
            }

            console.log(randomPhoto);
        })
        .catch(function (err) {
            console.log(err);
        });

        //"Another!" button click to get a new random photo
        document
        .addEventListener("click", (event) => {
            if (event.target.id === "getAnotherRandomPhoto") {
                let randomPhotoDate = randomDate(firstPhotoDay, today);
                let roverCamera = roverCameras[Math.floor(Math.random() * roverCameras.length)];
                let earthDate = formatDate(randomPhotoDate, 'yyyy-mm-dd');

                axios
                .get(URL + "earth_date=" + earthDate + "&camera=" + roverCamera + "&api_key=" + apiKey)
                .then(function (response2) {
                    let newRandomPhoto = response2.data.photos[Math.floor(Math.random() * response2.data.photos.length)];
                    
                    if (response2.data.photos.length === 0 && document.getElementById("photoFromArchiveContent") === null) {
                        document.getElementById("noPhotoFromArchiveFound").style.display = "block";
                        
                        return console.log("This is the case when there are no photos returned from the API and the div isn't available.");

                    } else if (response2.data.photos.length === 0) {
                        document.getElementById("noPhotoFromArchiveFound").style.display = "block";
                        document.getElementById("photoFromArchiveContent").style.display = "none";
                        document.getElementById("photoFromArchiveImage").style.display = "none";

                        return console.log("This is the case when there are no photos returned from the API");
                    }
                    else {
                        document.getElementById("noPhotoFromArchiveFound").style.display = "none";
                        document.getElementById("photoFromArchiveContent").style.display = "block";
                        document.getElementById("photoFromArchiveImage").style.display = "block";

                        document.getElementById("photoDate").innerHTML = newRandomPhoto.earth_date;
                        document.getElementById("photoCamera").innerHTML = newRandomPhoto.camera.full_name;
                        document.getElementById("photoURL").src = newRandomPhoto.img_src;

                        //newRandomPhoto = "";
                        document.getElementById("saveRandomPhoto").disabled = false;
                        document.getElementById("saveRandomPhoto").innerHTML = "<i class='fas fa-heart'></i> Favorite";
                    }
                })
                .catch(function (err) {
                    console.log(err);
                });
            }

            if (event.target.id === "getAnotherRandomPhotoError") {
                //Trying to fuss too much with the API calls, lol.
                location.reload();
            }

            if (event.target.dataset.saveFav) {
                let photoID = event.target.dataset.saveFav;

                const newFavPhoto = {
                    //photoRover: document.getElementById("photoRover").innerHTML,
                    photoDate: document.getElementById("photoDate_" + photoID).innerHTML,
                    photoCamera: document.getElementById("photoCamera_" + photoID).innerHTML,
                    photoURL: document.getElementById("photoURL_" + photoID).src,
                    photoID: photoID
                }

                database.ref("favPhotos").push(newFavPhoto);

                document.getElementById(photoID).disabled = true;
                document.getElementById(photoID).innerHTML = "<i class='fas fa-check'></i> Saved"; 
            }
            
            if (event.target.id === "saveRandomPhoto") {
                const newFavPhoto = {
                    //photoRover: document.getElementById("photoRover").innerHTML,
                    photoDate: document.getElementById("photoDate").innerHTML,
                    photoCamera: document.getElementById("photoCamera").innerHTML,
                    photoURL: document.getElementById("photoURL").src,
                    photoID: document.getElementById("photoID").innerHTML
                }
    
                console.log(newFavPhoto);
    
                database.ref("favPhotos").push(newFavPhoto);

                document.getElementById("saveRandomPhoto").disabled = true;
                document.getElementById("saveRandomPhoto").innerHTML = "<i class='fas fa-check'></i> Saved";
            }
        });

        // Container that completed Handlebars template HTML will go into
        const photoSearch = document.getElementById("photoSearch");

        //Submit 
        document
        .getElementById("search-form")
        .addEventListener("submit", function (event) {
            event.preventDefault();

            photoSearch.innerHTML = "";

            const formDate = document.querySelector("input[name='dateSearch']").value;
            const formCamera = document.querySelector("select[name='cameraSearch']").value;
            const formURL = URL + "earth_date=" + formDate + "&camera=" + formCamera + "&api_key=" + apiKey;

            console.log(formURL);

            axios
            .get(formURL)
            .then(function (response) {
                const searchedPhotos = response.data.photos;

                if (response.data.photos.length === 0) {
                    document.getElementById("noPhotoFromSearchFound").style.display = "block";

                    return console.log("This is the case when there are no photos returned from the API for search.");
                }
                else {
                    document.getElementById("noPhotoFromSearchFound").style.display = "none";

                    searchedPhotos.forEach(function (searchPhoto) {
                        //let canHas = "not found";

                        /*var canHas;
                        canHas = database
                        .ref("favPhotos")
                        .orderByChild('photoID')
                        .equalTo(searchPhoto.id)
                        .on("value", (results) => {
                            //let canHas = results.key;

                            return results.data.root.photoID;
                        });

                        console.log(canHas);*/

                        photoSearch.innerHTML += photoSearchTemplateFunc({
                            //photoRover: searchPhoto.rover.name,
                            photoCamera: searchPhoto.camera.full_name,
                            photoURL: searchPhoto.img_src,
                            photoDate: searchPhoto.earth_date,
                            photoID: searchPhoto.id,
                            //photoDBID: canHas
                        });
                    });
                }
            })
            .catch(function (err) {
                console.log(err);
            });
        });

        /*document.querySelectorAll('[data-already-can-has]').forEach(function (element){
            if (element.dataset.alreadyCanHas !== "undefined") {
                element.disabled = true;
                element.innerHTML = "<i class='fas fa-check'></i> Saved";
            }
        });*/
    }
}