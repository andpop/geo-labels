console.log("In entry.js");

ymaps.ready(init);

function init () {
    let reviewForm = document.getElementById('review_form'),
        reviewTitle = document.getElementById('review_title'),
        address = document.getElementById('address'),
        closeFormBtn = document.getElementById('close_form'),
        reviewContent = document.getElementById('review_content'),
        emptyMessage = document.getElementById('empty_message'),
        reviewerName = document.getElementById('reviewer_name'),
        reviewPlace = document.getElementById('place'),
        reviewText = document.getElementById('review_text'),
        saveBtn = document.getElementById('saveBtn');

    let activeReview = {};
    let reviews = [];

    function clearForm() {
        reviewerName.value = '';
        place.value = '';
        reviewText.value = '';
    }

    function clearList() {
        emptyMessage.style.display = 'block';
        while (reviewContent.children.length > 1) {
            reviewContent.removeChild(reviewContent.lastChild);
        }
    }

    function closeForm() {
        reviewForm.style.display = 'none';
        clearForm();
        clearList();
    }

    function showForm(position) {
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
        address.textContent = activeReview.address;
        reviewerName.focus();
    }


    closeFormBtn.addEventListener('click', closeForm);

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
        console.log(coords);

        address.textContent = '';
        clearForm();
        clearList();

        ymaps.geocode(coords).then(res => {
            console.log(res.geoObjects.get(0).getAddressLine());
            activeReview.coords = coords;
            activeReview.address = res.geoObjects.get(0).getAddressLine();
            showForm(position);
        })
            .catch(err => console.log(err));
    });

    function saveReview() {
        let reviewer = reviewerName.value,
            place = reviewPlace.value,
            text = reviewText.value;

        if (!reviewer || !place || !text) {
            return;
        }
        activeReview.reviewer = reviewer;
        activeReview.place = place;
        activeReview.text = text;
        activeReview.date = new Date().toLocaleString();
        reviews.push(Object.assign({}, activeReview));

        emptyMessage.style.display = 'none';
        let reviewHTML = `<div>
            <span class="username">${activeReview.reviewer} </span>
            <span class="place"> ${activeReview.place}</span> <span class="date">${activeReview.date}</span>
            <div class="reviewtext">${activeReview.text}</div>
            </div>`;

        // reviewContent.innerHTML += reviewTmpl({ review: activeReview });
        reviewContent.innerHTML += reviewHTML;
        clearForm();
        let header = '<div class="where">' + place + '</div><div class="address">' + activeReview.address + '</div>';
        let placemark = new ymaps.Placemark(activeReview.coords, {
            balloonContentHeader: header,
            balloonContentBody: text,
            balloonContentFooter: activeReview.date,
            hintContent: '<b>' + reviewer + '</b> ' + place
        }, {
            preset: 'islands#redIcon',
            iconColor: '#df6543',
            openBalloonOnClick: false
        });
        let address = activeReview.address;

        placemark.events.add('click', (e) => {
            // showAllReviews (address, e.get('position'))
        });
        clusterer.add(placemark);
    }

    saveBtn.addEventListener('click', saveReview);
}
