export default class GeoReviewForm {
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

        this.closeFormBtn.addEventListener('click', () => this.closeForm());
    }

    clearInputs() {
        this.reviewerName.value = '';
        this.reviewPlace.value = '';
        this.reviewText.value = '';
    }

    clearForm() {
        this.addressElement.textContent = '';
        this.clearInputs();
        this.clearReviewList();
    }

    clearReviewList() {
        this.reviewList.innerHTML = '';
        this.emptyMessage.style.display = 'block';
    }

    updateReviewList(content) {
        if (content) {
            this.emptyMessage.style.display = 'none';
            this.reviewList.innerHTML = content;
        } else {
            this.clearReviewList();
        }
    }

    closeForm() {
        this.clearForm();
        this.clearReviewList();
        this.reviewForm.style.display = 'none';
    }

    showForm(position, address, reviewList) {
        let {x, y} = position;

        this.reviewForm.style.left = x +'px';
        this.reviewForm.style.top = y + 'px';
        this.reviewForm.style.display = 'block';
        this.reviewForm.style.zIndex = '10';
        this.addressElement.textContent = address;
        this.updateReviewList(reviewList);
        this.reviewerName.focus();
    }

}
