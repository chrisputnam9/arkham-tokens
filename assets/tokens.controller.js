(function($) {

    window.Tokens = window.Tokens || {};

    Tokens.Controller = {
        drawn: [],
        remaining: [],
        remainingFlat: [],

        configKey: 'default',
        configObj: null,
        config: null,
        in_settings: false,
        
        messageView: null,
        drawnView: null,
        remainingView: null,

        // Parse info from URL
        route: function () {
            var self = Tokens.Controller,
                hash = document.location.hash;

            if (matches = hash.match(/^#\/([^\/]+)\/([^\/]+)$/)) {
                Tokens.Config.url = 'https://gist.githubusercontent.com/anonymous/' + matches[1] + '/raw/' + matches[2] + '/settings';
            } else if (matches = hash.match(/^#\/([^\/]+)$/)) {
                self.configKey = matches[1];
            }

            Tokens.Config.init(self.init);
        },

        // Kick it all off
        init: function(configObj) {
            var self = Tokens.Controller;

            // Views
            Tokens.View.init();
            self.messageView = Tokens.View.get('messages');
            self.drawnView = Tokens.View.get('token-current');
            self.remainingView = Tokens.View.get('token-list');

            self.configObj = configObj;
            self.config = self.configObj.get(self.configKey),
            self.reset();
            $('.js-draw').on('click', self.drawRandom);
            $('.js-reset').on('click', self.reset);
            $('.js-settings').on('click', self.settingsToggle);
            $('.js-save-settings, .js-share').on('click', self.saveSettings);
            $('.js-manual-draw').on('click', '.img-token.enabled', self.drawManual);
            $('.token-available').on('click', '.js-count-toggle', self.countToggle);

            // for dev/testing
            $('.js-settings').trigger('click');

        },

        alert: function (type, title, message) {
            var self = Tokens.Controller,
                messages = [{}];

            if ($.isArray(type)) {
                messages = type;
            } else if (typeof(type) == 'object') {
                messages[0] = type;
            } else {
                if (typeof(message) == 'undefined') {
                    message = title;
                    title = false;
                }

                messages[0].type=type;
                messages[0].title=title;
                messages[0].message=message;
            }

            self.messageView.render({messages: messages});

        },

        drawRandom: function (event) {
            if (typeof(event) == 'object') {
                event.preventDefault();
            }

            var self = Tokens.Controller,
                max = self.remainingFlat.length,
                random,token;

            if (max <= 0) { return; }

            // Random number between 0 and (length-1)
            random = Math.floor(Math.random() * max),

            token = self.remainingFlat[random];

            self.draw(token);
        },

        drawManual: function (event) {
            if (typeof(event) == 'object') {
                event.preventDefault();
            }

            Tokens.Controller.draw($(this).data('index'));
        },

        draw(token)
        {
            var self = Tokens.Controller;

            if (typeof(token) == 'number') {
                token = self.remaining[token];
            }

            self.drawn.push({'name': token.name});
            self.remainingFlat.splice(token.index, 1);
            self.remaining[token.index].count-= 1;

            self.render();
        },

        reset: function (event) {
            if (typeof(event) == 'object') {
                event.preventDefault();
            }

            var self = Tokens.Controller;

            if (self.remainingFlat.length > 0 && self.drawn.length == 0) {
                return self.drawRandom();
            }

            self._reset();

            self.render();
        },

        saveSettings: function (event) {
            if (typeof(event) == 'object') {
                event.preventDefault();
            }

            var self = Tokens.Controller,
                $this = $(this),
                share = $this.is('.js-share');

            self.alert('info', 'Saving...');
            $('.js-save-settings, .js-share').addClass('disabled');

            self.configObj.save(self.config, (share ? self.alertShare : self.alertSave));
        },

            alertSave: function (url) {
                var self = Tokens.Controller;

                $('.js-save-settings, .js-share').removeClass('disabled');
                
                self.alert('success', 'Saved Successfully', 'Your settings are saved and can be loaded or shared using the following URL.  Make sure to save or bookmark this URL for later use: <br><br> <input type="text" class="form-control" value="' + url + '" />');
            },

            // For now, the same, but could be different later
            alertShare: function (url) {
                var self = Tokens.Controller;
                self.alertSave(url);
            },

        settingsToggle: function (event) {
            if (typeof(event) == 'object') {
                event.preventDefault();
            }

            var self = Tokens.Controller,
                $button = $(this);
            $button.toggleClass('glyphicon-cog');
            $button.toggleClass('glyphicon-ok');
            self.in_settings = !self.in_settings;
            $('.play-area a').not('.js-settings').parent().toggleClass('hidden');
            $('.token-list.token-current').parent().toggleClass('hidden');
            self._reset();
            self.render();
        },

        countToggle: function (event) {
            if (typeof(event) == 'object') {
                event.preventDefault();
            }

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
            $(window).trigger('tokens-refresh');
        },

        renderRemaining: function () {
            var self = Tokens.Controller;
            self.remainingView.render({'tokens':self.remaining, 'in_settings':self.in_settings});
            $(window).trigger('tokens-refresh');
        }
    }

})(jQuery);
