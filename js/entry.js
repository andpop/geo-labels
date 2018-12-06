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
                <div class="reviewtext">${review.text}</div>
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

    // -----------------------------------------------------------------------------------------
    let myMap = new ymaps.Map('map', {
        center   : [54.17523457, 45.18074950], // Саранск
        zoom     : 16,
        behaviors: ['drag']
    });
    myMap.controls.add('zoomControl');
    let clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons',
        clusterDisableClickZoom: true,
        openBalloonOnClick: false
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
