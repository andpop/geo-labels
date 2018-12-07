ymaps.ready(init);

function init () {
    let reviewForm = document.getElementById('review_form'),
        addressElement = document.getElementById('address'),
        closeFormBtn = document.getElementById('close_form'),
        reviewList = document.getElementById('review_list'),
        emptyMessage = document.getElementById('empty_message'),
        reviewerName = document.getElementById('reviewer_name'),
        reviewPlace = document.getElementById('place'),
        reviewText = document.getElementById('review_text'),
        saveBtn = document.getElementById('saveBtn');

    let currentReview = {}, // Объект для хранения информации о текущем отзыве
        allReviews = [];      // Массив для хранения всех отзывов

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
        // let header = `<div class="balloon__place">${place}</div>
        //               <div class="balloon__address">${address}</div>`;
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
        // let address = currentReview.address;

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
        localStorage.geo_reviews = JSON.stringify(allReviews);
    }
    
    function loadReviewsFromStorage() {
        return localStorage.geo_reviews ? JSON.parse(localStorage.geo_reviews) : {};
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
    let myMap = new ymaps.Map('map', {
        center   : [54.17523457, 45.18074950], // Саранск
        zoom     : 16,
        behaviors: ['drag']
    });
    myMap.controls.add('zoomControl');

    let clusterer = getClustererWithCarousel();
    myMap.geoObjects.add(clusterer);

    allReviews = loadReviewsFromStorage();
    allReviews.forEach((review, i, reviews) => addPlacemark(review));

    // ====================   Настройка обработчиков событий для элементов карты ================================
    // По щелчку на карте определяется адрес точки и открывается форма с отзывами по этому адресу
    myMap.events.add('click', e => {
        let coords = e.get('coords'), // Географические координаты точки
            position = e.get('position'); // Компьютерные координаты точки на экране

        clearForm();
        ymaps.geocode(coords)
            .then(res => {
                currentReview.coords = coords;
                currentReview.address = res.geoObjects.get(0).getAddressLine();
                showForm(position, currentReview.address);
            })
            .catch(err => console.error(err));
    });

    // ====================   Настройка обработчиков событий для DOM-элементов  ================================
    saveBtn.addEventListener('click', addReview);
    closeFormBtn.addEventListener('click', closeForm);
    //Обработка клика на адрес (класс address) в балуне-карусели для кластера
    map.addEventListener('click', e => {
        let target = e.target;

        if (target.className === 'balloon__address') {
            myMap.balloon.close();
            const x = e.clientX;
            const y = e.clientY;

            showForm([x, y], target.textContent);
        }
    });

}
