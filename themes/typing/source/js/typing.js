(function ($) {
  // Caption
  $('.article-entry').each(function (i) {
    $(this).find('img').each(function () {
      if ($(this).parent().hasClass('fancybox')) return

      var alt = this.alt

      if (alt) {
        $(this).after('<span class="caption">' + alt +
                      '</span>')
      }

      $(this).wrap('<a href="' + this.src + '" title="' + alt +
                   '" class="fancybox"></a>')
    })

    $(this).find('.fancybox').each(function () {
      $(this).attr('rel', 'article' + i)
    })
  })

  if ($.fancybox) {
    $('.fancybox').fancybox()
  }
  $(window).resize(function(){
    if($('home-body').officeWidth / $('home-body').officeHeight <= $(document).clientWidth / $(document).clientWidth){
      $('home-body').css("backgroundSize","100% auto");
    }else{
      $('home-body').css("backgroundSize","auto 100%");
    }
  })
})(jQuery)
