import Presenter from './presenter';

ymaps.ready(init);

function init () {
    let presenter = new Presenter();
    presenter.addAllPlacemarks();

}
