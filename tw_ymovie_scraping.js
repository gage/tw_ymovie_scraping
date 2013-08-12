var request = require('request'), jsdom = require('jsdom');
var sleep = require('sleep');
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;

function saveYmovie(movie,cb){
    MongoClient.connect('mongodb://127.0.0.1:27017/ymovie', function(err, db){
        if(err) throw err;
        var collection = db.collection('movie');
        collection.insert(movie,function(){
            console.log(movie);
            db.close();
            if(cb){
                cb();
            }
        });
    });
}

function getMovie(id, cb){
    var ids = String(id);
    if(id<10){
        var ids = '000' + ids;
    }else if(id<100){
        var ids = '00' + ids;
    }else if(id<1000){
        var ids = '0' + ids;
    }

    var frist_two = ids.substr(0,2)
    var last_two = ids.substr(2)

    var url = "http://tw.movie.yahoo.com/movieinfo_main.html/id="+ id;
    console.log(url);
    jsdom.env({
      url: url,
      scripts: ["http://code.jquery.com/jquery.js"],
      done: function (errors, window) {
        var $ = window.$;
        var info = $("#ymvmvf");
        var movie = {};
        // get movie poster
        var img = info.find('.img img').attr('src');
        movie.img = img;
        movie.img_l = 'http://tw.ent3.yimg.com/mpost/'+frist_two+'/'+last_two+'/'+id+'.jpg'

        var maindata = info.find('.text.bulletin');
        // get title, title_original
        var title = maindata.find('h4').text();
        var title_original = maindata.find('h5').text();
        movie.title = title;
        movie.title_original = title_original;
        // get details
        var tit = maindata.find('.tit');
        var dta = maindata.find('.dta');

        for(var i=0, len=tit.length; i<len; i++){
            var tit_v = $(tit[i]).text();
            var dta_v = $(dta[i]).text();
            switch(tit_v){
                case "上映日期：":
                    movie.release_date = dta_v;
                    break;
                case "類　　型：":
                    movie.m_type = dta_v;
                    break;
                case "片　　長：":
                    movie.duration = dta_v;
                    break;
                case "導　　演：":
                    movie.direct = dta_v;
                    break;
                case "演　　員：":
                    movie.actor = dta_v;
                    break;
                case "發行公司：":
                    movie.release_company = dta_v;
                    break;
                case "官方網站：":
                    movie.official_site = dta_v;
                    break;
            }
        }
        
        // 
        $('#yuievtautoid-1').click()
        var story = $($('#ymvs').find('.text p').get(0)).html();
        movie.story = story;
        movie.rate = parseFloat($('#ymvis em').text()); 
        // console.log($('#ymvis em').size());
        saveYmovie(movie, cb);
        // console.log(movie);

      }
    });
}

id = 4032;

function doit(){
    id++;
    if(id<=4867){
        getMovie(id, doit);
    }
}

doit();


