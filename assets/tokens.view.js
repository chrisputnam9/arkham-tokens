(function($) {

    window.Tokens = window.Tokens || {};

    Tokens.View = {
        // View map
        map: {},

        // Kick it
        init: function () {
            var self = this;
            $('.js-view').each(function() {
                var $view = $(this),
            object = new self.object($view);
                self.map[object.name] = object;
            });
        },

        object: function ($el){
            var self = this;
            self.$el = $el;
            self.html = self.$el.find('>script').html();
            self.template = Handlebars.compile(self.html);
            self.name = self.$el.data('view');

            // Empty the element
            self.$el.html('');

            self.render = function (data) {
                self.$el.html(self.template(data));
            }
        },

        get: function (key) {
            var self = this;
            if (key in self.map) {
                return self.map[key];
            } else {
                return false;
            }
        }

    };

})(jQuery);
