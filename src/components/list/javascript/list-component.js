const listComponent = {
  bindings: {
    items: '<',
  },

  templateUrl: 'list/res/layout/list.html',

  controller($element, $scope, $timeout) {
    'ngInject';
    this.activeIndex = 0;

    const maxIndex = this.items.length - 1;
    let debouncer = false;

    const setActiveItem = () => {
      if(!debouncer) {
        debouncer = $timeout(() => {
          const target = Math.floor($element[0].scrollTop / 65);
          this.activeIndex = target < maxIndex ? target : maxIndex;
          debouncer = false;
        }, 50);
      }
    };

    $element.bind('scroll', () => setActiveItem());
    $scope.$on('destroy', () => $element.unbind('scroll'));
  }
};

export { listComponent };
