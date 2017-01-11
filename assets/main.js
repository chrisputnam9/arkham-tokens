(function($) {

    /*
    Views = {};
    View = function($el) {
        this.$el = $el;
    };
    */

    /* Document Ready */
    $(function() {
        var $views = $('.js-view'),
            views = {};

        $views.each(function() {
            var $view = $(this),
                name = $view.data('view'),
                html = $view.find('>script').html(),
                template = Handlebars.compile(html);
            
            // Make this a prototyped object
            views[name] = {
                $el: $view,
                template: template
            };

            $view.html(template({name: 'eldersign'}));

        });

    });

})(jQuery);
