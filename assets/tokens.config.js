(function($) {

    window.Tokens = window.Tokens || {};

    Tokens.Config = {
        // Data object
        data: null,

        // URL
        url: './config.json',
        customUrl: false,
        
        // Map json string => gist ID
        saveMap: {},

        // Cookie support
        cookies: false,

        // Kick it
        init: function (_callback) {
            var self = this,
                callback;

            try {
                document.cookie = 'cookietest=1';
                self.cookies = document.cookie.indexOf('cookietest=') != -1;
                document.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
            } catch (e) {}

            callback = function () {
                self.updateCookie_data();

                /*
                // Pros and cons...
                if (self.customUrl && self.cookies) {
                    window.location = window.location.origin;
                }
                */

                _callback(self);
            }

            // Load saveMap from cookies if any
            var saveMap = Cookies.getJSON('tokens.config.saveMap');
            if (typeof(saveMap) == 'object') {
                self.saveMap = saveMap;
            }
            self.updateCookie_saveMap();

            // Load from cookies if no save specified
            if (!self.customUrl) {
                self.data = Cookies.getJSON('tokens.config.data');
                if (self.data) {
                    callback();
                    return;
                }
            }

            // Load from URL if custom or no valid cookies
            self.loadFrom(self.url, callback);
        },

        reset: function () {
            Cookies.remove('tokens.config.data');
            Cookies.remove('tokens.config.saveMap');
        },

        updateCookie_data: function () {
            var self = this;
            Cookies.set('tokens.config.data', self.data,{expires: 365});
        },

        updateCookie_saveMap: function () {
            var self = this;
            Cookies.set('tokens.config.saveMap', self.saveMap,{expires: 365});
        },

        get: function (key) {
            var self = this;

            if (typeof(key) == 'undefined') {
                return self.data['default'];
            } else if (key in self.data) {
                return self.data[key];
            } else {
                return false;
            }
        },

        getString: function (key) {
            var self = this;
            return JSON.stringify({default:self.get(key)}).replace(/"/g, '\\"');
        },

        loadFrom: function (url, callback) {
            var self = this,
                data_string;

            // Grab the config
            $.getJSON(url, function (data) {
                self.data = data;

                // Update saveMap
                data_string = self.getString();
                /*
                 Problematic with cookies:
                self.saveMap[data_string] = document.location.toString();
                self.updateCookie_saveMap();
                */

                callback();
            }).fail(function (request, error) {
                console.error('Error: ' + error);
            });
        },

        save: function (key, callback) {
            var self = this,
                data_string = self.getString(key);

            // Check save map
            if (data_string in self.saveMap) {
                callback(self.saveMap[data_string]);
            } else {
                $.ajax({
                    url: 'https://api.github.com/gists',
                    method: 'POST',
                    data: '{"description":"chaos-token-settings","public":true,"files":{"settings":{"content":"'+data_string+'"}}}',
                    success: function (data) {
                        var load_url = document.location.origin + document.location.pathname + '?c=',
                            raw_url = data.files.settings.raw_url,
                            matches = raw_url.match(/anonymous\/([^\/]+)\/raw\/([^\/]+)\//);

                        load_url+= matches[1] + '/' + matches[2];

                        // Update Save Map
                        self.saveMap[data_string] = load_url;
                        self.updateCookie_saveMap();

                        callback(load_url);
                    },
                    error: function (jqXHR, status, error) {
                        console.error(error + ': ' + jqXHR.responseText);
                    }
                });
            }
        }
    };

})(jQuery);
