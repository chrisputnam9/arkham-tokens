(function($) {

    /* Document Ready */
    $(function() {
        // Prep some views
        Tokens.View.init();

        var token_list = Tokens.View.get('token-list');

        // Grab the config
        $.get('./config.json', function (data) {

            // List out all tokens
            var tokens = [];
            $.each(data.night_of_the_zealot.easy, function(name, count) {
                tokens.push({
                    'name': name,
                    'count': count,
                });
            });
            token_list.render({'tokens':tokens});


        }).fail(function (request, error) {
            console.error('Error: ' + error);
        });

        var token_current = Tokens.View.get('token-current');
        token_current.render({name: 'eldersign'});

    });

    window.Tokens = {};

    Tokens.View = {
        // View map
        map: {},

        // Kick it
        init: function() {
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
