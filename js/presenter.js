import View from './view';
import Model from './model';

export default class Presenter {
    constructor() {
        this.model = new Model();
        this.view = new View();
        this.mapElement = document.getElementById('map');
        this.myMap = this.createMap();
        this.clusterer = this.createClusterer();
        this.myMap.geoObjects.add(this.clusterer);

        // По щелчку на объекте карты должна открыться новая форма по соответствующему адресу
        this.myMap.events.add('click', e => {
            let coords = e.get('coords'), // Географические координаты точки
                position = e.get('position'); // Компьютерные координаты точки на экране

            this.view.geoReviewForm.clearForm();
            ymaps.geocode(coords)
                .then(res => {
                    this.model.currentReview.coords = coords;
                    this.model.currentReview.address = res.geoObjects.get(0).getAddressLine();
                    this.view.geoReviewForm.showForm(
                        this.view.getFormOffsets(position),
                        this.model.currentReview.address,
                        ''
                    );
                })
                .catch(err => console.error(err));
        });

        this.addEventHandlers();
    }

    addEventHandlers() {
        this.view.geoReviewForm.saveBtn.addEventListener('click', () => this.addReview());
        this.mapElement.addEventListener('click', e => {
            let target = e.target;

            if (target.className === 'balloon__address') {
                const position = {
                    x: e.clientX,
                    y: e.clientY
                }
                let address = target.textContent;

                this.model.fillCurrentReview(address);
                this.myMap.balloon.close();
                this.view.geoReviewForm.showForm(
                    this.view.getFormOffsets(position),
                    address,
                    this.view.getReviewList(address, this.model.allReviews)
                );
            }
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

        // Обработчик щелчка на новом placemark (address берется по замыканию)
        placemark.events.add('click', (e) => {
            this.model.fillCurrentReview(address);
            this.view.geoReviewForm.showForm(
                this.view.getFormOffsets(e.get('position')),
                address,
                this.view.getReviewList(address, this.model.allReviews)
            );
        });

        // Делаем placemark доступным для кластеризации
        this.clusterer.add(placemark);
    }

    addAllPlacemarks() {
        this.model.allReviews
            .forEach((review, i, reviews) => this.addPlacemark(review));
    }

    fillCurrentReviewFromInputs() {
        this.model.currentReview.reviewer = this.view.geoReviewForm.reviewerName.value;
        this.model.currentReview.place = this.view.geoReviewForm.reviewPlace.value;
        this.model.currentReview.text = this.view.geoReviewForm.reviewText.value;
        this.model.currentReview.date = new Date().toLocaleString();
    }

    addReview() {
        // Заполняем currentReview значениями из полей ввода формы
        this.fillCurrentReviewFromInputs();
        // Если не заполнено хотя бы одно поле, то ничего не делаем
        if (this.model.isEmptyFieldInCurrentReview()) {
            return;
        }

        // Добавляем новый отзыв в массив allReviews всех отзывов
        this.model.addCurrentReviewInAllReviews();
        this.model.saveReviewsToStorage();
        // Добавляем placemark на карту
        this.addPlacemark(this.model.currentReview);
        // Формируем и отображаем в форме список всех отзывов по данному адресу
        let address = this.model.currentReview.address;

        this.view.geoReviewForm.updateReviewList(
            this.view.getReviewList(address, this.model.allReviews)
        );
        // Очищаем поля ввода
        this.view.geoReviewForm.clearInputs();
    }

}