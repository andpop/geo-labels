ymaps.ready(init);

class GeoReviewForm {
    constructor() {
        this.reviewForm = document.getElementById('review_form');
        this.addressElement = document.getElementById('address');
        this.closeFormBtn = document.getElementById('close_form');
        this.reviewList = document.getElementById('review_list');
        this.emptyMessage = document.getElementById('empty_message');
        this.reviewerName = document.getElementById('reviewer_name');
        this.reviewPlace = document.getElementById('place');
        this.reviewText = document.getElementById('review_text');
        this.saveBtn = document.getElementById('saveBtn');
    }

    clearInputs() {
        this.reviewerName.value = '';
        this.reviewPlace.value = '';
        this.reviewText.value = '';
    }

    clearForm() {
        this.addressElement.textContent = '';
        this.clearInputs();
        this.clearList();
    }

    clearList() {
        this.reviewList.innerHTML = '';
        this.emptyMessage.style.display = 'block';
    }

    closeForm() {
        this.clearForm();
        this.clearList();
        this.reviewForm.style.display = 'none';
    }

    // fillReviewList(address, content) {
    //     this.reviewList.innerHTML = content;
    //     // TODO: content нужно формировать в presentor
    //
    //     // for (let review of allReviews) {
    //     //     if (review.address === address) {
    //     //         emptyMessage.style.display = 'none';
    //     //         currentReview.address = review.address;
    //     //         currentReview.coords = review.coords;
    //     //
    //     //         let reviewItem = `<li>
    //     //         <span class="username">${review.reviewer} </span>
    //     //         <span class="place"> ${review.place}</span> <span class="date">${review.date}</span>
    //     //         <div class="review-text">${review.text}</div>
    //     //         </li>`;
    //     //         reviewList.innerHTML += reviewItem;
    //     //     }
    //     // }
    // }


    // TODO: reviewList нужно вычислять во presentor
    showForm(position, address, reviewList) {
        this.addressElement.textContent = address;
        this.reviewList.innerHTML = reviewList;
        // fillReviewList(address);
        this.reviewerName.focus();

        let {x, y} = position;
        // TODO: x, y нужно вычислять во view

        // x = x < 0 ? 0 : x;
        // if (x + reviewForm.offsetWidth > document.documentElement.clientWidth) {
        //     x = document.documentElement.clientWidth - reviewForm.offsetWidth - 10;
        // }
        // y = y < 0 ? 0 : y;
        // if (y + reviewForm.offsetHeight > document.documentElement.clientHeight) {
        //     y = document.documentElement.clientHeight - reviewForm.offsetHeight - 10;
        // }
        this.reviewForm.style.left = x +'px';
        this.reviewForm.style.top = y + 'px';
        this.reviewForm.style.display = 'block';
        this.reviewForm.style.zIndex = '10';
    }

}

class View {
    constructor() {
        // this.reviewForm = document.getElementById('review_form');
    }
}

class Model {
    constructor() {
        this.localStoragiItem = 'geo_reviews';
        this.currentReview = {};
        this.allReviews = this.loadReviewsFromStorage();
    }

    saveReviewsToStorage() {
        localStorage[this.localStoragiItem] = JSON.stringify(allReviews);
    }

    loadReviewsFromStorage() {
        return localStorage[this.localStoragiItem] ? JSON.parse(localStorage[this.localStoragiItem]) : [];
    }

}

class Presenter {
    constructor() {
        this.model = new Model();
        this.view = new View();
        this.myMap = this.createMap();
        this.clusterer = this.createClusterer();
        this.myMap.geoObjects.add(this.clusterer);

        this.myMap.events.add('click', e => {
            let coords = e.get('coords'), // Географические координаты точки
                position = e.get('position'); // Компьютерные координаты точки на экране

            // clearForm();
            ymaps.geocode(coords)
                .then(res => {
                    this.model.currentReview.coords = coords;
                    this.model.currentReview.address = res.geoObjects.get(0).getAddressLine();
                    console.log(this.model.currentReview.address);
                    // showForm(position, currentReview.address);
                })
                .catch(err => console.error(err));
        });
    }

    createMap() {
        let myMap = new ymaps.Map('map', {
            center   : [54.17523457, 45.18074950], // Саранск
            zoom     : 16,
            behaviors: ['drag']
        });
        myMap.controls.add('zoomControl');

        return myMap;
    }

    getClustererWithCarousel() {
        // Определение собственного макета для элемента карусели
        let customItemContentLayout = ymaps.templateLayoutFactory.createClass(
            // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
            '<div class=balloon__header>{{ properties.balloonContentHeader|raw }}</div>' +
            '<div class=balloon__body>{{ properties.balloonContentBody|raw }}</div>' +
            '<div class=balloon__footer>{{ properties.balloonContentFooter|raw }}</div>'
        );

        return new ymaps.Clusterer({
            preset: 'islands#invertedDarkOrangeClusterIcons',
            openBalloonOnClick: true,
            clusterDisableClickZoom: true,
            clusterOpenBalloonOnClick: true,
            clusterHideIconOnBalloonOpen: false,
            // Устанавливаем для балуна кластера стандартный макет типа "Карусель".
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            // Устанавливаем собственный макет.
            clusterBalloonItemContentLayout: customItemContentLayout,
            // Устанавливаем режим открытия балуна.
            // В данном примере балун никогда не будет открываться в режиме панели.
            clusterBalloonPanelMaxMapArea: 0,
            // Устанавливаем размеры макета контента балуна (в пикселях).
            clusterBalloonContentLayoutWidth: 200,
            clusterBalloonContentLayoutHeight: 130,
            // Устанавливаем максимальное количество элементов в нижней панели на одной странице
            clusterBalloonPagerSize: 5
        });
    }

    createClusterer() {
        return this.getClustererWithCarousel();
    }

    addPlacemark(activeReview) {
        let {coords, address, reviewer, place, date, text} = activeReview;
        let placemark = new ymaps.Placemark(coords, {
            balloonContentHeader: `<div class="balloon__place">${place}</div><div class="balloon__address">${address}</div>`,
            balloonContentBody: text,
            balloonContentFooter: date,
            hintContent: `<b>${reviewer}</b> ${place}`
        }, {
            preset: 'islands#redIcon',
            iconColor: '#df6543',
            openBalloonOnClick: false
        });

        // Обработчик щелчка на новом placemark
        placemark.events.add('click', (e) => {
            console.log('showForm(e.get(\'position\'), address);')
            // showForm(e.get('position'), address);
        });

        // Делаем placemark доступным для кластеризации
        this.clusterer.add(placemark);
    }

    addAllPlacemarks() {
        this.model.allReviews
            .forEach((review, i, reviews) => this.addPlacemark(review));
    }
}

function init () {
    let presenter = new Presenter();
    presenter.addAllPlacemarks();


    // ==============  Определение функций ================================================
    function clearInputs() {
        reviewerName.value = '';
        reviewPlace.value = '';
        reviewText.value = '';
    }

    function clearForm() {
        address.textContent = '';
        clearInputs();
        clearList();
    }

    function clearList() {
        reviewList.innerHTML = '';
        emptyMessage.style.display = 'block';
    }

    function closeForm() {
        clearForm();
        clearList();
        reviewForm.style.display = 'none';
    }

    function fillReviewList(address) {
        reviewList.innerHTML = '';
        for (let review of allReviews) {
            if (review.address === address) {
                emptyMessage.style.display = 'none';
                currentReview.address = review.address;
                currentReview.coords = review.coords;

                let reviewItem = `<li>
                <span class="username">${review.reviewer} </span>
                <span class="place"> ${review.place}</span> <span class="date">${review.date}</span>
                <div class="review-text">${review.text}</div>
                </li>`;
                reviewList.innerHTML += reviewItem;
            }
        }
    }

    function showForm(position, address) {
        addressElement.textContent = address;
        fillReviewList(address);
        reviewerName.focus();

        let {x, y} = position;

        x = x < 0 ? 0 : x;
        if (x + reviewForm.offsetWidth > document.documentElement.clientWidth) {
            x = document.documentElement.clientWidth - reviewForm.offsetWidth - 10;
        }
        y = y < 0 ? 0 : y;
        if (y + reviewForm.offsetHeight > document.documentElement.clientHeight) {
            y = document.documentElement.clientHeight - reviewForm.offsetHeight - 10;
        }
        reviewForm.style.left = x +'px';
        reviewForm.style.top = y + 'px';
        reviewForm.style.display = 'block';
        reviewForm.style.zIndex = '10';
    }

    function addPlacemark(activeReview) {
        let {coords, address, reviewer, place, date, text} = activeReview;
        let placemark = new ymaps.Placemark(coords, {
            balloonContentHeader: `<div class="balloon__place">${place}</div><div class="balloon__address">${address}</div>`,
            balloonContentBody: text,
            balloonContentFooter: date,
            hintContent: `<b>${reviewer}</b> ${place}`
        }, {
            preset: 'islands#redIcon',
            iconColor: '#df6543',
            openBalloonOnClick: false
        });

        // Обработчик щелчка на новом placemark
        placemark.events.add('click', (e) => {
            showForm(e.get('position'), address);
        });

        // Делаем placemark доступным для кластеризации
        clusterer.add(placemark);
    }

    function fillCurrentReview() {
        currentReview.reviewer = reviewerName.value;
        currentReview.place = reviewPlace.value;
        currentReview.text = reviewText.value;
        currentReview.date = new Date().toLocaleString();
    }

    function saveReviewsToStorage() {
        localStorage[localStorageItem] = JSON.stringify(allReviews);
    }

    function loadReviewsFromStorage() {
        // return localStorage.geo_reviews ? JSON.parse(localStorage.geo_reviews) : {};
        return localStorage[localStorageItem] ? JSON.parse(localStorage[localStorageItem]) : {};
    }

    function addReview() {
        // Заполняем currentReview значениями из полей ввода формы
        fillCurrentReview();

        // Если не заполнено хотя бы одно поле, то ничего не делаем
        if (!currentReview.reviewer || !currentReview.place || !currentReview.text) {
            return;
        }

        // Добавляем новый отзыв в массив allReviews всех отзывов
        allReviews.push(Object.assign({}, currentReview));
        saveReviewsToStorage();
        // Добавляем placemark на карту
        addPlacemark(currentReview);
        // Формируем и отображаем в форме список всех отзывов по данному адресу
        fillReviewList(currentReview.address);
        // Очищаем поля ввода
        clearInputs();
    }

    function getClustererWithCarousel() {
        // Определение собственного макета для элемента карусели
        let customItemContentLayout = ymaps.templateLayoutFactory.createClass(
            // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
            '<div class=balloon__header>{{ properties.balloonContentHeader|raw }}</div>' +
            '<div class=balloon__body>{{ properties.balloonContentBody|raw }}</div>' +
            '<div class=balloon__footer>{{ properties.balloonContentFooter|raw }}</div>'
        );

        return new ymaps.Clusterer({
            preset: 'islands#invertedDarkOrangeClusterIcons',
            openBalloonOnClick: true,
            clusterDisableClickZoom: true,
            clusterOpenBalloonOnClick: true,
            clusterHideIconOnBalloonOpen: false,
            // Устанавливаем для балуна кластера стандартный макет типа "Карусель".
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            // Устанавливаем собственный макет.
            clusterBalloonItemContentLayout: customItemContentLayout,
            // Устанавливаем режим открытия балуна.
            // В данном примере балун никогда не будет открываться в режиме панели.
            clusterBalloonPanelMaxMapArea: 0,
            // Устанавливаем размеры макета контента балуна (в пикселях).
            clusterBalloonContentLayoutWidth: 200,
            clusterBalloonContentLayoutHeight: 130,
            // Устанавливаем максимальное количество элементов в нижней панели на одной странице
            clusterBalloonPagerSize: 5
        });
    }

    // =========================================================================
    // let myMap = new ymaps.Map('map', {
    //     center   : [54.17523457, 45.18074950], // Саранск
    //     zoom     : 16,
    //     behaviors: ['drag']
    // });
    // myMap.controls.add('zoomControl');
    //
    // let clusterer = getClustererWithCarousel();
    // myMap.geoObjects.add(clusterer);

    // allReviews = loadReviewsFromStorage();
    // allReviews.forEach((review, i, reviews) => addPlacemark(review));


}
