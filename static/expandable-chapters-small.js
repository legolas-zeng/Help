require(['gitbook', 'jQuery'], function(gitbook, $) {
  var TOGGLE_CLASSNAME = 'expanded',
      CHAPTER = '.chapter',
      ARTICLES = '.articles',
      TRIGGER_TEMPLATE = '<i class="exc-trigger fa"></i>',
      LS_NAMESPACE = 'expChapters';
  var init = function () {
    // adding the trigger element to each ARTICLES parent and binding the event
    $(ARTICLES)
      .parent(CHAPTER)
      .children('a')
      .append(
        $(TRIGGER_TEMPLATE)
          .on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggle($(e.target).closest(CHAPTER));
          })
      );
    expand(lsItem());
    //expand current selected chapter with it's parents
    var activeChapter = $(CHAPTER + '.active');
    expand(activeChapter);
    expand(activeChapter.parents(CHAPTER));


  } 
  var toggle = function ($chapter) {
    if ($chapter.hasClass('expanded')) {
      collapse($chapter);
    } else {
      expand($chapter);
    }
  }
  var collapse = function ($chapter) {
    if ($chapter.length && $chapter.hasClass(TOGGLE_CLASSNAME)) {
      $chapter.removeClass(TOGGLE_CLASSNAME);
      lsItem($chapter);
    }
  }
  var expand = function ($chapter) {
    if ($chapter.length && !$chapter.hasClass(TOGGLE_CLASSNAME)) {
      $chapter.addClass(TOGGLE_CLASSNAME);
      lsItem($chapter);
    }
  }
  var lsItem = function () {
    var map = JSON.parse(localStorage.getItem(LS_NAMESPACE)) || {}
    if (arguments.length) {
      var $chapters = arguments[0];
      $chapters.each(function (index, element) {
        var level = $(this).data('level');
        var value = $(this).hasClass(TOGGLE_CLASSNAME);
        map[level] = value;
      })
      localStorage.setItem(LS_NAMESPACE, JSON.stringify(map));
    } else {
      return $(CHAPTER).map(function(index, element){
        if (map[$(this).data('level')]) {
          return this;
        }
      })
    }
  }
  gitbook.events.bind('page.change', function() {
    init()
  }); 
});
require(['gitbook', 'jQuery'], function(gitbook, $) {
  var TOGGLE_CLASSNAME = 'expanded',
      CHAPTER = '.chapter',
      ARTICLES = '.articles',
      TRIGGER_TEMPLATE = '<i class="exc-trigger fa"></i>',
      LS_NAMESPACE = 'expChapters';
  
  function count(el){

    var text = $.trim(el.find('a').eq(0).text());         
    ga('send', 'event', {
        eventCategory: '点击列表',
        eventAction: text,
    });
  }
  
  function initPageCount(){
    ga('send', 'event', {
      eventCategory: 'pageview',
      eventAction: location.href,
    });
  }

  setTimeout(function(){
    initPageCount();
  },2000)
  


  function scrollFollow(){
    var _debounce = function(func, wait, immediate) {
      var timeout, args, context, timestamp, result;
    
      var later = function() {
        // 据上一次触发时间间隔
        var last = new Date().getTime() - timestamp;
    
        // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
        if (last < wait && last > 0) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
          if (!immediate) {
            result = func.apply(context, args);
            if (!timeout) context = args = null;
          }
        }
      };
      
      return function() {
        context = this;
        args = arguments;
        timestamp = new Date().getTime();
        var callNow = immediate && !timeout;
        // 如果延时不存在，重新设定延时
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
          result = func.apply(context, args);
          context = args = null;
        }
    
        return result;
      };
    };


    var clientHeight = $(window).outerHeight();
    window.onresize = function(){
      clientHeight = $(window).outerHeight();
    }

    var listWrap = $('.book-summary');

    $('.body-inner')[0].onscroll = _debounce(function(){
      
      var tagOffsetTop = $('.active').offset().top;
      if(tagOffsetTop>clientHeight || tagOffsetTop<0){
        var toTop = listWrap.scrollTop()+tagOffsetTop-clientHeight/3;
        listWrap.scrollTop(toTop);
      }

    },500,false)



  }    

  // scrollFollow();




  function createNavList(){

    var navList ='';
    var baseURL = location.pathname;

    function toNum(str){
      return +str.slice(-1)
    }

    function createHTML(arr,closeTag){

      if(arr.length){

        navList+='<ul class="articles">';

        $.each(arr,function(i,ele){

            if(ele.children.length){
              navList+='<li class="chapter add" data-sign="'+ele.id+'"><a href="'+baseURL+'#'+ele.id+'">'+ele.text+'</a>';
            }else{
              navList+='<li class="chapter add" data-sign="'+ele.id+'"><a href="'+baseURL+'#'+ele.id+'">'+ele.text+'</a></li>';
            }
            
            if(ele.children.length){
              createHTML(ele.children,'</li>')
            }
        })

        var closeTag = closeTag? closeTag :"";
        navList +='</ul>'+closeTag;
      }
    }


    function insert(arr,ele){

      if(arr.length){
        var i = arr.length-1;
  
        var dis = ele.index - arr[i].index;

        if(dis>0){
          insert(arr[i].children,ele);
        }else{
          arr.push(ele);
        }   
      }else{
        arr.push(ele);
      }

    }

    var arr = [];
    $('section :header').each(function(i,ele){
      
      if(i){  
        
        var jsonEl = {
          id:ele.id,
          text:$.trim($(ele).text()),
          index:toNum(ele.tagName),
          children:[]
        };

        insert(arr,jsonEl);

      }
      
    })


    createHTML(arr);

    $('.chapter.active').append(navList);

    $('.add').each(function(){
      $(this).click(function(e){
        expand($(this));
        count($(this)); 
      })
    })

    
    var topChapters = $('.summary').children();
    topChapters.each(function(i,ele){

      var link = $(this).find('a').eq(0);
      var hash = link.text().trim().toLowerCase();
      var url = link.attr('href');
      if(i){
        $(this).append('<ul class="articles"><li></li></ul>');
      }
      
      link.attr('href',url+'#'+hash);

      $(this).click(function(e){
        expand($(this));
        $(this).siblings('.chapter').each(function(){
          collapse($(this));
        });
      });

    })

  }

  
  var toggle = function ($chapter) {

    if ($chapter.hasClass('expanded')) {
      collapse($chapter);
    } else {
      expand($chapter);
      var a = $chapter.find('a')
      a[0].click();

    }
  }
  var collapse = function ($chapter) {
    if ($chapter.length && $chapter.hasClass(TOGGLE_CLASSNAME)) {
      $chapter.removeClass(TOGGLE_CLASSNAME);
      lsItem($chapter);
    }
  }
  var expand = function ($chapter) {
    if ($chapter.length && !$chapter.hasClass(TOGGLE_CLASSNAME)) {
      $chapter.addClass(TOGGLE_CLASSNAME);
      lsItem($chapter);
    }
  }
  var lsItem = function () {
    var map = JSON.parse(localStorage.getItem(LS_NAMESPACE)) || {}
    if (arguments.length) {
      var $chapters = arguments[0];
      $chapters.each(function (index, element) {
        var level = $(this).data('level');
        var value = $(this).hasClass(TOGGLE_CLASSNAME);
        map[level] = value;
      })
      localStorage.setItem(LS_NAMESPACE, JSON.stringify(map));
    } else {
      return $(CHAPTER).map(function(index, element){
        if (map[$(this).data('level')]) {
          return this;
        }
      })
    }
  }


  var init = function () {
    
    createNavList();
    
    if(location.pathname=='/'){
      localStorage.expChapters = '{}';
    }else{
      if(localStorage.expChapters){
        var exp = JSON.parse(localStorage.expChapters);
        exp['undefined'] = true;
        localStorage.expChapters = JSON.stringify(exp);
      }
      
    }
    

    // adding the trigger element to each ARTICLES parent and binding the event
    $(ARTICLES)
      .parent(CHAPTER)
      .children('a')
      .append(
        $(TRIGGER_TEMPLATE)
          .on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggle($(e.target).closest(CHAPTER));

          })
      );
    // expand(lsItem());
    //expand current selected chapter with it's parents
    var activeChapter = $(CHAPTER + '.active');
    expand(activeChapter);
    expand(activeChapter.parents(CHAPTER));

  } 

  init();


  // var path = ['quick_view','lan-hu-shi-pin-jiao-cheng','lan-hu-gong-neng-gai-lan','lan-hu-gong-neng-gai-lan']
  
  if(location.hash){

    var hash = decodeURIComponent(location.hash.slice(1));
    var hashChapter =$(".chapter[data-sign='"+hash+"']");

    setTimeout(function(){

      location.hash = hash;
      hashChapter.addClass('active')
    },300)

  }
  

  gitbook.events.bind('page.change', function() {
    init(); 
    // scrollFollow();
    // count($('.chapter.active'));
  }); 
});
