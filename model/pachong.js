const request=require("request")  
const cheerio=require("cheerio")  
const  mysql=require('mysql')  
var dbConfig = require('./DBConfig');

// var pool = mysql.createPool( dbConfig.mysql );

let connect=mysql.createConnection(dbConfig.mysql);
 
connect.connect()

function show(item){
  request('http://www.1905.com/vod/list/n_1_t_1/o1p'+item+'.html',function(err,res){  
      if(err){  
          console.log('请求出错');  
      }else{  
          var $ = cheerio.load(res.body, {decodeEntities: false});
          $('.search-list>div').each(function(){
              var newsTitle = $(this).find('p').text();
              var news1Title = $(this).find('h3').text();
              var code = $(this).find('i').text(); 
              var newsTime= "";
              var newsUrl= $(this).find('a').attr('href');
              var addSql = "INSERT INTO blog(title,href,title2) VALUES (?,?,?)"; 
              var addParmas = [newsTitle,newsUrl,news1Title];
            connect.query(addSql,addParmas,function(err,data){  
                if(data){  
                    // item++; 
                    show(item)
                }else{
                    console.log('出错');  
                }
            })
          }); 
      }  
  });
}

show(1)