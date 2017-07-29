(function($) {

    window.Tokens = window.Tokens || {};

    // Kick everything off:
    Tokens.Controller.route();

    // Update token sizes on delayed resize
    $(window).on('delayed-resize tokens-refresh', function (event) {
        $('.col-square').parent().each(function() {
            var $parent = $(this),
                $squares = $parent.find('.col-square'),
                maxWidth = 0;

            $squares.each(function() {
                var width = Math.ceil($(this).outerWidth());
                if (width > maxWidth) {
                    maxWidth = width;
                }
            });
            $squares.css({'height': maxWidth + 'px'});
        });
    }); 

    // prevent jankiness during resize
    $(window).on('resize', function() {
        if(this.resizeTO) clearTimeout(this.resizeTO);
        this.resizeTO = setTimeout(function() {
            $(this).trigger('delayed-resize');
        }, 200);
    });

    // Bootstrap copy button
    $('body').on('click', '.js-copy', function (event) {
        event.preventDefault();

        var $this = $(this),
            $input = $this.closest('.input-group').find('input');

        if ($input.length == 1) {
            $input.select();
            document.execCommand('copy');
        }
    });

})(jQuery);
