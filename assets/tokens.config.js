(function($) {

    window.Tokens = window.Tokens || {};

    Tokens.Config = {
        // Data object
        data: null,

        // URL
        url: './config.json',
        
        // Map json string => gist ID
        saveMap: {},

        // Kick it
        init: function (callback) {
            var self = this;

            self.loadFrom(self.url, callback);
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
                self.saveMap[data_string] = document.location.toString();

                callback(self);
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
