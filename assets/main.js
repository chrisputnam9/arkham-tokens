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

        configObj: null,
        config: null,
        in_settings: false,
        
        drawnView: null,
        remainingView: null,

        // Kick it
        init: function(configObj) {
            var self = Tokens.Controller;

            // Views
            Tokens.View.init();
            self.drawnView = Tokens.View.get('token-current');
            self.remainingView = Tokens.View.get('token-list');

            self.configObj = configObj;
            self.config = self.configObj.get('night_of_the_zealot').easy,
            self.reset();
            $('.js-draw').on('click', self.draw);
            $('.js-reset').on('click', self.reset);
            $('.js-settings').on('click', self.settingsToggle);

            $('.token-available').on('click', '.js-count-toggle', self.countToggle);
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

            self._reset();

            self.render();
        },

        settingsToggle: function () {
            var self = Tokens.Controller,
                $button = $(this);
            $button.toggleClass('glyphicon-cog');
            $button.toggleClass('glyphicon-ok');
            self.in_settings = !self.in_settings;
            $('.play-area a').not('.js-settings').parent().toggle();
            $('.token-list.token-current').parent().toggle();
            self._reset();
            self.render();
        },

        countToggle: function () {
            var self = Tokens.Controller,
                $toggle = $(this),
                token = $toggle.data('token'),
                delta = parseInt($toggle.data('delta'));
            if (token in self.config) {
                self.config[token]+=delta;
                if (self.config[token] < 0) {
                    self.config[token] = 0;
                }
            }
            self._reset();
            self.render();
        },

        _reset: function () {
            var self = Tokens.Controller;

            self.drawn = [];
            self.remaining = [];
            self.remainingFlat = [];

            // List out all tokens
            var c = 0;

            $.each(self.config, function(name, count) {
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

            if (drawnLength < 2) {
                columns = 12;
            } else if (drawnLength < 5) {
                columns = 6;
            } else if (drawnLength < 10) {
                columns = 4;
            } else {
                columns = 3;
            }

            self.drawnView.render({'tokens':self.drawn, 'columns': columns});
        },

        renderRemaining: function () {
            var self = Tokens.Controller;
            self.remainingView.render({'tokens':self.remaining, 'in_settings':self.in_settings});
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
