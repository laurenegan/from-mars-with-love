import axios from "axios";
import Handlebars from "handlebars";
import database from "../../firebaseConfig";

export default function marsLandingController() {
    axios
    .get("templates/myFavs.hbs")
    .then((response1) => {
        const myFavsHtml = response1.data;

        axios
        .get("templates/photoFavResults.hbs")
        .then((response2) => {
            const photoFavResultsHtml = response2.data;

            return render(myFavsHtml, photoFavResultsHtml);

            /*axios
            .get("templates/photoResults.hbs")
            .then((response3) => {
                const photoSearchHtml = response3.data;

                return render(myFavsHtml, photoFromArchiveHtml, photoSearchHtml);
            });*/
        });
    });

    function render(myFavsHtml, photoFavResultsHtml) {
    //function render(myFavsHtml, photoFromArchiveHtml, photoSearchHtml) {
        const myFavsFunc = Handlebars.compile(myFavsHtml);
        const photoResultsFunc = Handlebars.compile(photoFavResultsHtml);
        //const photoSearchTemplateFunc = Handlebars.compile(photoSearchHtml);

        document
        .getElementById("root")
        .innerHTML = myFavsFunc();

        database
        .ref("favPhotos")
        .on("value", (results) => {
            const favPhotos = document.getElementById("favPhotos");

            favPhotos.innerHTML = "";

            results.forEach((result) => {
                const photo = result.val();
                const photoDBID = result.key;

                //console.log(photo);

                favPhotos
                .innerHTML += photoResultsFunc({
                    ...photo,
                    photoDBID: photoDBID
                });
                
            });

            const saveFavButtons = document.querySelectorAll('.btn-save');
            const editButtons = document.querySelectorAll('.btn-edit');

            for (var i = 0; i < saveFavButtons.length; i++) {
                saveFavButtons[i].style.display = "none";
            }

            for (var i = 0; i < editButtons.length; i++) {
                editButtons[i].style.display = "block";
                editButtons[i].addEventListener("click", (event) => {
                    let photoID = event.target.dataset.photoDbId;
                    console.log(photoID);
                });
            }
        });

        $('#editPhotoDetails').on('show.bs.modal', function (e) {
            let photoID = e.relatedTarget.dataset.photoDbId;

            window.localStorage.setItem("photoID", photoID);

            database
            .ref("favPhotos")
            .child(photoID)
            .on("value", (results) => {
                const onePhoto = results.val();

                console.log(results);

                //Ignore the rest if onePhoto is null
                if (!onePhoto) {
                    return;
                }
                document.querySelector("textarea[name='description']").value = onePhoto.description ? onePhoto.description : "";
            });
        })

        document
        .getElementById("editPhotoForm")
        .addEventListener("submit", (event) => {
            event.preventDefault();

            let photoID = window.localStorage.getItem("photoID");

            database
            .ref("favPhotos")
            .child(photoID)
            .on("value", (results) => {
                const onePhoto = results.val();
                
                //Ignore the rest if onePhoto is null
                if (!onePhoto) {
                    return;
                }

                onePhoto.description = document.querySelector("textarea[name='description']").value;

                database
                .ref("favPhotos")
                .child(photoID)
                .set(onePhoto)
                .then(() => {
                    $('#editPhotoDetails').modal('hide');
                });
            });
        });

        document
        .getElementById("deletePhotoButton")
        .addEventListener("click", () => {
            let photoID = window.localStorage.getItem("photoID");

            database
            .ref("favPhotos")
            .child(photoID)
            .remove()
            .then(() => {
                $('#editPhotoDetails').modal('hide');
            });
        });
    }
}