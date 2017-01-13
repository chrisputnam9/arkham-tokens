(function($) {

    /* Document Ready */
    $(function() {
        // Prep some views
        Tokens.Config.init(Tokens.Controller.init);
    });

    window.Tokens = {};

    Tokens.Controller = {
        drawn: [],
        remaining: [],
        remainingFlat: [],

        config: null,
        
        drawnView: null,
        remainingView: null,

        // Kick it
        init: function(config) {
            var self = Tokens.Controller;

            // Views
            Tokens.View.init();
            self.drawnView = Tokens.View.get('token-current');
            self.remainingView = Tokens.View.get('token-list');

            self.config = config;
            self.reset();
            $('.js-draw').on('click', self.draw);
            $('.js-reset').on('click', self.reset);
        },

        draw: function () {
            var self = Tokens.Controller,
                max = self.remainingFlat.length,
                random,drawn;

            if (max <= 0) { return; }

            // Random number between 0 and (length-1)
            random = Math.floor(Math.random() * max),
            drawn = self.remainingFlat[random];

            self.drawn.push({'name': drawn.name});
            self.remainingFlat.splice(random, 1);
            self.remaining[drawn.index].count-= 1;

            self.render();
        },

        reset: function () {
            var self = Tokens.Controller;

            if (self.remainingFlat.length > 0 && self.drawn.length == 0) {
                return self.draw();
            }

            self.drawn = [];
            self.remaining = [];
            self.remainingFlat = [];

            // List out all tokens
            var scenario = self.config.get('night_of_the_zealot'),
                c = 0;

            $.each(scenario.easy, function(name, count) {
                var object = {
                    'name': name,
                    'count': count,
                    'index': c
                };
                self.remaining.push(object);
                for (i=0;i<count;i++) {
                    self.remainingFlat.push(object);
                }
                c++;
            });

            self.render();
        },

        render: function () {
            var self = Tokens.Controller;
            self.renderDrawn();
            self.renderRemaining();
        },

        renderDrawn: function () {
            var self = Tokens.Controller,
                drawnLength = self.drawn.length,
                columns;

            switch (drawnLength) {
                case 1:
                    columns = 12;
                    break;
                case 2:
                    columns = 6;
                    break;
                case 3:
                    columns = 4;
                    break;
                default:
                    columns = 3;
                    break;
            }

            self.drawnView.render({'tokens':self.drawn, 'columns': columns});
        },

        renderRemaining: function () {
            var self = Tokens.Controller;
            self.remainingView.render({'tokens':self.remaining});
        }
    }

    Tokens.Config = {
        // Data object
        data: null,

        // Kick it
        init: function (callback) {
            var self = this;

            // Grab the config
            $.get('./config.json', function (data) {
                self.data = data;
                callback(self);
            }).fail(function (request, error) {
                console.error('Error: ' + error);
            });
        },

        get: function (key) {
            var self = this;
            if (key in self.data) {
                return self.data[key];
            } else {
                return false;
            }
        }
    };

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
