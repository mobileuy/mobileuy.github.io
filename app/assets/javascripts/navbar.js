$(document.body).on('click', '.navbar-toggle.collapsed', function () {
  $(this).removeClass("collapsed");
  var targetNav = $(this).attr("data-target");
  $(targetNav).addClass("in");
});

$(document.body).on('click', '.navbar-toggle:not(.collapsed)', function () {
  var targetNav = $(this).attr("data-target");
  $(targetNav).removeClass("in");
  $(this).addClass("collapsed");
});
