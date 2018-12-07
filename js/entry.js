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

    let activeReview = {};
    let reviews = [];

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
        for (let review of reviews) {
            if (review.address === address) {
                emptyMessage.style.display = 'none';
                activeReview.address = review.address;
                activeReview.coords = review.coords;

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

    function saveReview() {
        activeReview.reviewer = reviewerName.value;
        activeReview.place = reviewPlace.value;
        activeReview.text = reviewText.value;
        activeReview.date = new Date().toLocaleString();

        if (!activeReview.reviewer || !activeReview.place || !activeReview.text) {
            return;
        }

        reviews.push(Object.assign({}, activeReview));

        let header = '<div class="where">' + activeReview.place + '</div><div class="address">' + activeReview.address + '</div>';
        let placemark = new ymaps.Placemark(activeReview.coords, {
            balloonContentHeader: header,
            balloonContentBody: activeReview.text,
            balloonContentFooter: activeReview.date,
            hintContent: '<b>' + activeReview.reviewer + '</b> ' + activeReview.place
        }, {
            preset: 'islands#redIcon',
            iconColor: '#df6543',
            openBalloonOnClick: false
        });
        let address = activeReview.address;

        placemark.events.add('click', (e) => {
            showForm(e.get('position'), address);
        });

        clusterer.add(placemark);

        fillReviewList(activeReview.address);
        clearInputs();
    }

    saveBtn.addEventListener('click', saveReview);
    closeFormBtn.addEventListener('click', closeForm);
    //Обработка клика на адрес (класс address) в балуне-карусели для кластера
    map.addEventListener('click', e => {
        let target = e.target;

        if (target.className != 'address') {
            return;
        }
        myMap.balloon.close();
        const x = e.clientX;
        const y = e.clientY;

        showForm([x, y], target.textContent);
    });


    // -----------------------------------------------------------------------------------------
    let myMap = new ymaps.Map('map', {
        center   : [54.17523457, 45.18074950], // Саранск
        zoom     : 16,
        behaviors: ['drag']
    });
    myMap.controls.add('zoomControl');

    // Создаем собственный макет с информацией о выбранном геообъекте.
    let customItemContentLayout = ymaps.templateLayoutFactory.createClass(
        // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
        '<div class=balloon_header>{{ properties.balloonContentHeader|raw }}</div>' +
        '<div class=balloon_body>{{ properties.balloonContentBody|raw }}</div>' +
        '<div class=balloon_footer>{{ properties.balloonContentFooter|raw }}</div>'
    );
    let clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedDarkOrangeClusterIcons',
        openBalloonOnClick: true,
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: true,
        clusterHideIconOnBalloonOpen: false,
        // Устанавливаем стандартный макет балуна кластера "Карусель".
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
    myMap.geoObjects.add(clusterer);

    myMap.events.add('click', e => {
        let coords = e.get('coords');
        let position = e.get('position');

        clearForm();

        ymaps.geocode(coords)
            .then(res => {
                activeReview.coords = coords;
                activeReview.address = res.geoObjects.get(0).getAddressLine();
                showForm(position, activeReview.address);
            })
            .catch(err => console.log(err));
    });

}
