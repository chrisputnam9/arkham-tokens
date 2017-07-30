(function($) {

    window.Tokens = window.Tokens || {};

    Tokens.Controller = {
        drawn: [],
        remaining: [],
        remainingFlat: [],

        configKey: 'default',
        configObj: null,
        config: null,

        page: 'index',
        in_settings: false,
        
        messageView: null,
        drawnView: null,
        remainingView: null,

        urlParams: {},

        // Parse info from URL
        route: function () {
            var self = Tokens.Controller,
                pl     = /\+/g,  // Regex for replacing addition symbol with a space
                search = /([^&=]+)=?([^&]*)/g,
                decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
                query  = window.location.search.substring(1),
                matches, config_matches;

            while (matches = search.exec(query)) {
                self.urlParams[decode(matches[1])] = decode(matches[2]);
            }

            // Config ID
            if ('c' in self.urlParams) {
                config_matches = self.urlParams.c.match(/^([^\/]+)\/([^\/]+)$/);
                Tokens.Config.url = 'https://gist.githubusercontent.com/anonymous/' + config_matches[1] + '/raw/' + config_matches[2] + '/settings';
                Tokens.Config.customUrl = true;
            }


            // Config Key
            if ('k' in self.urlParams) {
                self.configKey = self.urlParams.k;
            }

            // Page
            if ('p' in self.urlParams) {
                self.page = self.urlParams.p;
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
            $('.js-reset-settings').on('click', self.resetSettings);

            $('.js-manual-draw').on('click', '.img-token.enabled', self.drawManual);
            $('.js-manual-return').on('click', '.img-token', self.returnManual);
            $('.token-available').on('click', '.js-count-toggle', self.countToggle);

            // for dev/testing
            if (self.page == 'settings') {
                $('.js-settings').trigger('click');
            }

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

        returnManual: function (event) {
            if (typeof(event) == 'object') {
                event.preventDefault();
            }

            var self = Tokens.Controller,
                index = $(this).data('index'),
                removedArr,token;

            removedArr = self.drawn.splice(index,1);
            token = removedArr[0];
            self.remainingFlat.push(token);
            self.remaining[token.index].count+= 1;

            self.render();
        },

        draw: function (token)
        {
            var self = Tokens.Controller;

            // if numeric, it is the array index
            if (typeof(token) == 'number') {
                token = self.remaining[token];
            }

            self.drawn.push(token);
            var removedFlat = false;
            self.remainingFlat = self.remainingFlat.filter(function (_token, index) {
                if (!removedFlat && _token.index == token.index) {
                    removedFlat = true;
                    return false;
                }
                return true;
            });
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

            self.configObj.save(self.configKey, function (url) {
                $('.js-save-settings, .js-share').removeClass('disabled');

                if (share) {
                    self.alertShare(url);
                } else {
                    self.alertSave(url);
                }
            });
        },

            alertSave: function (url) {
                var self = Tokens.Controller;
                
                self.alert({
                    type: 'success',
                    title: 'Saved Successfully',
                    message: 'Your settings have been saved and can be loaded or shared using the following URL.<br><br><h4>Copy or bookmark this URL for later use.</h4>',
                    url: url
                });
            },

            // For now, the same, but could be different later
            alertShare: function (url) {
                var self = Tokens.Controller;

                self.alert({
                    type: 'success',
                    title: 'QR Code to Share Settings',
                    qr_code: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + url
                });
            },

        resetSettings: function (event) {
            if (typeof(event) == 'object') {
                event.preventDefault();
            }

            var self = Tokens.Controller;

            if (window.confirm('Reset data - are you sure?')) {
                self.configObj.reset();
                window.location = window.location.origin+window.location.pathname;
            }
        },

        settingsToggle: function (event) {
            if (typeof(event) == 'object') {
                event.preventDefault();
            }

            var self = Tokens.Controller,
                $button = $(this),
                $play_area = $('.play-area'),
                $play_links = $play_area.find('a');
            $button.toggleClass('glyphicon-cog');
            $button.toggleClass('glyphicon-ok');
            self.in_settings = !self.in_settings;
            $play_area.find('.ui-secondary').toggleClass('col-sm-1');
            $play_links.parent().toggleClass('col-sm-12');
            $play_links.not('.js-settings').parent().toggleClass('hidden');
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
                self.configObj.updateCookie_data();
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
            $('.js-draw').toggleClass('disabled', self.remainingFlat.length == 0);    
        },

        renderDrawn: function () {
            var self = Tokens.Controller,
                drawnLength = self.drawn.length,
                columns;

            if (drawnLength < 2) {
                columns = 12;
            } else if (drawnLength < 3) {
                columns = 6;
            } else if (drawnLength < 4) {
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
