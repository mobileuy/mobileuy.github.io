/**
 *  All internal anchor links will have a 900ms smooth scrolling animation to
 *  their destination and the URL will be updated to reflect the new position
 *  on the page.
 */
$(document).ready(function() {
    $('a[href^="#"]').on('click', function (e) {
        e.preventDefault();

        var target = this.hash;
        var $target = $(target);

        $('html, body').stop().animate({
            'scrollTop': $target.offset().top
        }, 900, 'swing', function () {
            window.location.hash = target;
        });
    });
});