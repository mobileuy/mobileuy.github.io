$(document.body).on('click', '.navbar-toggle.collapsed', function () {
  $(this).removeClass("collapsed");
  var targetNav = $(this).attr("data-target");
  $(targetNav).addClass("in");
  $('html').addClass('nav-bar-opened');

  $(targetNav).on('click', '.c-menu__item', function() {
    collapse(targetNav);
  });
});

$(document.body).on('click', '.navbar-toggle:not(.collapsed)', function () {
  collapse($(this).attr("data-target"));
});

function collapse(targetNav) {
  $(targetNav).removeClass("in");
  $('.navbar-toggle').addClass("collapsed");
  $('html').removeClass('nav-bar-opened');
  $(targetNav).off('click', '.c-menu__item');
}
