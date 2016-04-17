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
      const target = Math.floor($element[0].scrollTop / 65);
      this.activeIndex = target < maxIndex ? target : maxIndex;
      debouncer = false;
    };

    $element.bind('scroll', () => {
      if(debouncer) { $timeout.cancel(debouncer); }
      debouncer = $timeout(() => setActiveItem(), 5);
    });

    $scope.$on('destroy', () => $element.unbind('scroll'));
  }
};

export { listComponent };
