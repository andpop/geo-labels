export default class Model {
    constructor() {
        this.localStoragiItem = 'geo_reviews';
        this.currentReview = {}; // {coords, address, reviewer, place, date, text}
        this.allReviews = this.loadReviewsFromStorage();
    }

    saveReviewsToStorage() {
        localStorage[this.localStoragiItem] = JSON.stringify(this.allReviews);
    }

    loadReviewsFromStorage() {
        return (localStorage[this.localStoragiItem] ? JSON.parse(localStorage[this.localStoragiItem]) : []);
    }

    isEmptyFieldInCurrentReview() {
        return !(this.currentReview.reviewer && this.currentReview.place || this.currentReview.text);
    }

    addCurrentReviewInAllReviews() {
        this.allReviews.push(Object.assign({}, this.currentReview));
    }

    // Определение географических координат по адресу (из сохраненных записей в allReviews)
    getCoordsByAddress(address) {
        let coords = [];

        for (let review of this.allReviews) {
            if (review.address === address) {
                coords = [...review.coords];
                break;
            }
        }

        return coords;
    }

    // Заполнение адреса и географических координат в объекте currentReview
    fillCurrentReview(address) {
        this.currentReview.address = address;
        this.currentReview.coords = this.getCoordsByAddress(address);
    }
}