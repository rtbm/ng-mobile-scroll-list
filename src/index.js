import { listComponent } from './components/list/javascript/list-component';
import { homeComponent } from './components/home/javascript/home-component';

angular.module('ngApp', ['ngApp.layouts'])
  .component('list', listComponent)
  .component('home', homeComponent);
