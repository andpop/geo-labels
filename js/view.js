import GeoReviewForm from './georeviewform';

export default class View {
    constructor() {
        this.formElement = document.getElementById('review_form');
        this.geoReviewForm = new GeoReviewForm();
    }

    // Вычисление смещения формы на экране в зависимости от точки на карте, по которой мы щелкнули
    getFormOffsets(clickPosition) {
        let {x, y} = clickPosition;

        x = x < 0 ? 0 : x;
        if (x + this.formElement.offsetWidth > document.documentElement.clientWidth) {
            x = document.documentElement.clientWidth - this.formElement.offsetWidth - 10;
        }
        y = y < 0 ? 0 : y;
        if (y + this.formElement.offsetHeight > document.documentElement.clientHeight) {
            y = document.documentElement.clientHeight - this.formElement.offsetHeight - 10;
        }

        return {x, y};
    }

    // Формирование в HTML-формате списка уже сделанных отзывов по текущему местоположению
    getReviewList(address, allReviews) {
        let reviewList = '';

        for (let review of allReviews) {
            if (review.address === address) {
                reviewList +=  `<li>
                <span class="username">${review.reviewer} </span>
                <span class="place"> ${review.place}</span> <span class="date">${review.date}</span>
                <div class="review-text">${review.text}</div>
                </li>`;
            }
        }

        return reviewList;
    }

}