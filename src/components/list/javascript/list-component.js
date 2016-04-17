const listComponent = {
  bindings: {
    items: '<',
  },

  templateUrl: 'list/res/layout/list.html',

  controller($element, $scope, $timeout) {
    'ngInject';
    this.activeIndex = 0;
    this.debouncer = false;

    $element.bind('scroll', () => {
      if(this.debouncer) {
        $timeout.cancel(this.debouncer);
      }

      this.debouncer = $timeout(() => $scope.$apply(() => {
        const target = Math.floor($element[0].scrollTop / 65);
        const maxIndex = this.items.length - 1;
        this.activeIndex = target < maxIndex ? target : maxIndex;
        this.debouncer = false;
      }), 10);
    });

    $scope.$on('destroy', () => $element.unbind('scroll'));
  }
};

export { listComponent };
