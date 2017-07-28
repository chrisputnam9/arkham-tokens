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

        loadFrom: function (url, callback) {
            var self = this;

            // Grab the config
            $.getJSON(url, function (data) {
                self.data = data;
                callback(self);
            }).fail(function (request, error) {
                console.error('Error: ' + error);
            });
        },

        save: function (data, callback) {
            var self = this,
                content_json = {
                    default: data
                },
                content_string = JSON.stringify(content_json).replace(/"/g, '\\"');

            $.ajax({
                url: 'https://api.github.com/gists',
                method: 'POST',
                data: '{"description":"chaos-token-settings","public":true,"files":{"settings":{"content":"'+content_string+'"}}}',
                success: function (data) {
                    var load_url = document.location.origin + document.location.pathname + '#/',
                        raw_url = data.files.settings.raw_url,
                        matches = raw_url.match(/anonymous\/([^\/]+)\/raw\/([^\/]+)\//);

                    load_url+= matches[1] + '/' + matches[2];

                    callback(load_url);
                },
                error: function (jqXHR, status, error) {
                    console.error(error + ': ' + jqXHR.responseText);
                }
            });
        }
    };

})(jQuery);
