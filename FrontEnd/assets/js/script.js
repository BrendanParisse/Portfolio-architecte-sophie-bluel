document.addEventListener("DOMContentLoaded", function () {

    /* ---------------------- INITIALISATION ----------------- */

    async function init() {
        let getAllinfo = await getinfoworks();
        this.getAllinfo = getAllinfo;

        displayAllinfogallery(getAllinfo);

        let getAllcategories = await getinfocategories();
        displayAllinfocategories(getAllcategories);

        SearchWithFilter();

        SelectCategorie(getAllcategories);

        updatePage();
    }

    init();

    // Récupère les informations sur les travaux
    function getinfoworks() {
        return fetch("http://localhost:5678/api/works")
            .then(response => {
                return response.json();
            })
            .catch(error => {
                console.log(error);
            })
    }

    // Récupère les informations sur les catégories
    function getinfocategories() {
        return fetch("http://localhost:5678/api/categories")
            .then(response => {
                return response.json();
            })
            .catch(error => {
                console.log(error);
            })
    }

    // Affiche toutes les informations de la galerie
    function displayAllinfogallery(getAllinfo) {
        console.log(getAllinfo)
        let gallery = document.querySelector(".gallery");
        this.gallery = gallery;

        for (const info of getAllinfo) {
            gallery.insertAdjacentHTML(
                "beforeend",
                `
                <figure>
				    <img id="${info.id}" src="${info.imageUrl}" alt="${info.title}">
				    <figcaption>${info.title}</figcaption>
			    </figure>
                `
            )
        }
    }

    // Affiche toutes les informations sur les catégories
    function displayAllinfocategories(getAllcategories) {
        let filtresul = document.querySelector('#filtres');
        for (const categorie of getAllcategories) {
            filtresul.insertAdjacentHTML(
                "beforeend",
                `
                <li>${categorie.name}</li>
                `
            )
        }
    }

    // Affiche la gallery selon le filtre selectionné
    function SearchWithFilter() {
        let Allfilter = document.querySelectorAll("#filtres li");

        Allfilter.forEach(function (li) {
            li.addEventListener("click", function (event) {
                Allfilter.forEach(li => li.classList.remove('active'));
                li.classList.add('active');

                let valueli = event.target.innerText;
                gallery.innerHTML = "";
                console.log(valueli)

                if (valueli === "Tous") {
                    displayAllinfogallery(getAllinfo);
                } else {
                    let getfiltreinfo = getAllinfo.filter(info => info.category.name === valueli);
                    displayAllinfogallery(getfiltreinfo);
                }
            })
        })
    }

    /* ---------------------- CONNECTE ----------------- */

    const token = localStorage.getItem('token');
    const btnlogin = document.querySelector('#Btnlogin')
    btnlogin.href = '../FrontEnd/Login.html'

    const boxEdition = document.querySelector('#box_edition')
    const editionCadre = document.querySelector('#edition_cadre')
    const editionProjets = document.querySelector('#edition_projets')
    const filtre = document.querySelector('#filtres')

    // Change l'apparence de la page si l'utilisateur est connecté ou non 
    function updatePage() {
        if (token) {
            console.log('connecté')
            btnlogin.innerHTML = 'logout'
            filtre.style.display = 'none'


            btnlogin.addEventListener('click', () => {
                localStorage.clear('token')
                console.log('deconnecté')
                btnlogin.href = '../FrontEnd/index.html'
            })
        }
        else {
            console.log('non connecté')
            boxEdition.style.display = 'none'
            editionCadre.style.display = 'none'
            editionProjets.style.display = 'none'
            filtre.style.display = 'flex'
        }

    }


    /* ----------------------------------- CREATION MODALE ------------------------ */

    const modal = document.getElementById("BoxModal");
    const btn = document.querySelector('#edition_projets')
    const span = document.querySelector(".close");

    // Affiche et met à jour la gallery de la modale
    function updateModalGallery() {
        const galleryModale = document.querySelector(".modal-img");
        galleryModale.innerHTML = "";
        const btn_delete = document.querySelector('.btn_delete');
        const galleryFigureImg = document.querySelectorAll('.gallery figure img');

        // Pour chaque image de la galerie, crée du HTML correspondant à un travail de l'architecte
        galleryFigureImg.forEach(img => {
            const figureHTML = `
            <figure>
              <img src="${img.src}" alt="${img.alt}" id="${img.id}">
              <p>editer</p>
              <div id="${img.id}">
                <i class="fa-solid fa-trash-can"></i>
              </div>
            </figure>
          `;

            galleryModale.insertAdjacentHTML('beforeend', figureHTML);
        });

        // Ajout des écouteurs d'événements pour la suppression individuelle d'une image
        const deleteIcons = galleryModale.querySelectorAll('figure div');
        deleteIcons.forEach(div => {
            div.addEventListener('click', (event) => {
                const imgId = div.id;
                deleteInfo(event, imgId);
            });
        });

        // Ajout de l'écouteur d'événement pour la suppression de toutes les images
        btn_delete.addEventListener('click', (event) => {
            event.preventDefault();
            AlldeleteInfo();
        });
    }

    // Evénement lors du clic sur le bouton d'édition
    btn.onclick = function () {
        modal.style.display = "flex";
        updateModalGallery();
    }

    /* ----------------------------------- SUPPRESSION ELEMENT MODALE ------------------------ */

    // Supprime une image individuellement
    async function deleteInfo(event, id) {
        event.preventDefault();

        const token = localStorage.getItem('token');
        let option = {
            method: "DELETE",
            headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        };

        try {
            // Suppression de l'image de la galerie modale et appel à l'API pour supprimer l'image du serveur
            let figuresToDelete = document.querySelectorAll(`figure img[id="${id}"]`);
            figuresToDelete.forEach(figureToDelete => {
                let parentFigure = figureToDelete.parentElement;
                parentFigure.remove();
            });
            await fetch(`http://localhost:5678/api/works/${id}`, option);
        } catch (error) {
            console.log(error);
            console.log(error.response);
        }
    }

    // Supprime toutes les images
    async function AlldeleteInfo() {
        const token = localStorage.getItem('token');
        const option = {
            method: "DELETE",
            headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        };

        try {
            // Parcours de chaque figure de la galerie, appel à l'API pour supprimer l'image du serveur et suppression de la figure de la galerie
            const gallery = document.querySelector("#portfolio");
            const figuresToDelete = gallery.querySelectorAll("figure");

            figuresToDelete.forEach(async (figure) => {
                const id = figure.querySelector("img").id;
                await fetch(`http://localhost:5678/api/works/${id}`, option);
                figure.remove();
            });
        } catch (error) {
            console.log(error);
            console.log(error.response);
        }
    }

    /* ----------------------------------- FERMETURE MODALE ------------------------ */

    // Evénement lors du clic sur le bouton de fermeture de la modale
    span.onclick = function () {
        modal.style.display = "none";
        resetForm();
    }

    // Evénement lors du clic en dehors de la modale pour la fermer
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            resetForm();
        }
    }

    /* -------------------------------- MODALE PAGE AJOUT IMG -------------------------------*/

    const btn_ajout = document.querySelector('.btn_ajout')
    const modale_initiale = document.querySelector('.initial_content')
    const modale_ajout = document.querySelector('.second_content')
    const btn_back = document.querySelector('.back')

    // Evénement lors du clic sur le bouton d'ajout d'image / Mise à jour du contenu de la modale pour afficher le contenu de la modale ajout
    btn_ajout.addEventListener('click', () => {
        modale_initiale.style.display = "none"
        modale_ajout.style.display = "block"
    })

    // Evénement lors du clic sur le bouton de retour dans la modale d'ajout d'image pour afficher le contenu initiale de la modale
    btn_back.addEventListener('click', () => {
        modale_initiale.style.display = "block"
        modale_ajout.style.display = "none"
        resetForm();
    })


    /* -------------------------------- UPLOAD IMG   -------------------------------*/


    let add_img = document.querySelector('#form_file')
    const box = document.querySelector('.box_ajout')

    // Evénement lors de la sélection d'une image à ajouter
    add_img.addEventListener('change', (e) => {
        getImgData(e)
    })

    // Récupére les données de l'image sélectionnée
    function getImgData(e) {
        const files = e.target.files;
        if (files && files[0]) {
            const file = files[0];

            if (file.size > 4 * 1024 * 1024) {
                alert("La taille de l'image dépasse 4 Mo");
                add_img.value = "";
                return;
            }

            const fileReader = new FileReader();
            fileReader.onload = function (e) {
                const imageData = e.target.result;
                box.innerHTML = "";
                box.innerHTML = '<img src="' + imageData + '" />';
            };
            fileReader.readAsDataURL(file);
        }
    }


    /* -------------------------------- SELECT CATEGORIE   -------------------------------*/

    const select = document.querySelector('#Catégorie')

    // Affiche les options de catégorie dans le sélecteur / liste déroulante
    function SelectCategorie(categorieSelection) {
        for (const categorie of categorieSelection) {
            select.insertAdjacentHTML(
                "beforeend",
                `
                <option value="${categorie.id}">${categorie.name}</option>
                `
            )
        }
    }

    /* -------------------------------- BTN VALIDER / CHANGEMENT COULEUR BTN  -------------------------------*/

    const Titre = document.querySelector('#Titre')
    const btn_valider = document.querySelector('#btn_valider')

    // Change le style du bouton si les champs du formulaire sont bien remplis ou non
    function ValidBtn() {
        if (add_img.files[0] && select.value !== "" && Titre.value !== "") {
            btn_valider.style.background = "#1D6154"
            btn_valider.style.cursor = 'pointer'
        }
        else {
            btn_valider.style.background = "#A7A7A7"
        }

    }

    select.addEventListener('change', () => {
        ValidBtn()
    })

    add_img.addEventListener('change', () => {
        ValidBtn()
    })

    Titre.addEventListener('change', () => {
        ValidBtn()
        console.log(Titre.value)
    })

    const formS = document.querySelector('.second_content form')

    // Soumission du formulaire
    formS.addEventListener('submit', async (event) => {
        event.preventDefault();

        const ConditionBtn = add_img.files[0] && select.value !== "" && Titre.value !== "";

        if (ConditionBtn) {
            await AjoutAPI(event);
        } else {
            alert('Remplissez tous les champs');
        }
    });

    // Envoie les données du formulaire à l'API
    async function AjoutAPI() {
        const formData = new FormData();
        const categoryValue = select.value;
        let imgUrl = add_img.files[0];
        console.log(imgUrl)
        const TitreValue = Titre.value;

        formData.append('image', imgUrl);
        formData.append('title', TitreValue);
        formData.append('category', categoryValue);

        let optionS = {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: formData
        };

        try {
            const response = await fetch(`http://localhost:5678/api/works`, optionS);
            const newImage = await response.json();

            displayImage(newImage);
            displayImgM(newImage);
            updateModalGallery();
            resetForm();
            console.log('Le formulaire a été envoyé avec succès');
            console.log(response)
        } catch (error) {
            console.log(error);
            console.log(error.response);
        }
        imgUrl = '';
    }

    // Réinitialise le formulaire d'ajout d'image
    function resetForm() {
        document.querySelector('#Titre').value = '';

        const select = document.querySelector('#Catégorie');
        select.selectedIndex = 0;

        const box = document.querySelector('.box_ajout');
        box.innerHTML =
            '<i class="fa-regular fa-image icone_img"></i>' +
            '<label for="form_file" id="ajout_file">+Ajouter photo</label>' +
            '<input id="form_file" name="imageUrl" type="file">' +
            '<p class="Taille_Img">jpg, png : 4mo max</p>';

        document.querySelector('#form_file').value = null
        add_img = document.querySelector('#form_file');
        add_img.addEventListener('change', (e) => {
            getImgData(e)
            console.log(e)
        })

        ValidBtn();
    }


    function displayImage(image) {
        let gallery = document.querySelector(".gallery");

        gallery.insertAdjacentHTML(
            "beforeend",
            `
          <figure data-id="${image.id}">
            <img src="${image.imageUrl}" alt="${image.title}" id="${image.id}">
            <figcaption>${image.title}</figcaption>
          </figure>
          `
        );
    }

    function displayImgM(image) {
        let galleryModale = document.querySelector(".modal-img");

        galleryModale.insertAdjacentHTML(
            "beforeend",
            `
        <figure>
        <img src="${image.imageUrl}" alt="${image.id}" id="${image.id}">
        <p>editer</p>
          <div>
            <i id="${image.id}" class="fa-solid fa-trash-can"></i>
          </div>
        </figure>
        `
        );
    }

})
