# mysql数据库的连接和利用爬虫将爬去页面写入数据库
## 第一步,安装mysql数据库（操作系统环境：WiN10）
* 利用搜索引擎了解安装mysql的过程
* 安装完毕设置密码,启动mysql数据库
* 利用Navicat for Mysql管理本地数据库
* 新建名为database的数据库名,并新建表,设置字段

  ![Fb0Vs0.png](https://s2.ax1x.com/2019/01/07/Fb0Vs0.png)

## 第二步,连接本地mysql数据库
* npm 安装node-mysql模块

    ```nodejs
    npm install node-mysql -S
    ```
* 在根目录新建名为model的文件夹,新建DBconfig.js usersql.js

  ![Fb0WFg.png](https://s2.ax1x.com/2019/01/07/Fb0WFg.png)
* 配置文件
  ```javascript
  module.exports =
   {  
      mysql: {   
          host: 'localhost',
          user: 'root',
          port: '3306',
          password : 'password',
          database : 'expressdb'
      }
   };
  ```
* usersql中mysql语法
 ```javascript
  var UserSQL = {  
    insert:'INSERT INTO test(uid,name) VALUES(uid,name)', 
    queryAll:'SELECT * FROM test',  
    getUserById:'SELECT * FROM test WHERE uid = ? ',
    test:'SELECT * FROM test',
  };
  module.exports = UserSQL;
```

## 测试接口
* 路由中加入测试接口
 ```javascript
   router.get('/addUser', function(req, res, next){
    // 从连接池获取连接 
    pool.getConnection(function(err, connection) { 
    // 获取前台页面传过来的参数  
    var param = req.query || req.params;   
    // 建立连接 增加一个用户信息 
    connection.query(userSQL.insert, [param.uid,param.name], function(err, result) {
      if(result) {      
          result = {   
              code: 200,   
              msg:'增加成功'
          };  
      }     
      // 以json形式，把操作结果返回给前台页面     
      res.send({status:0,data:result});
      // 释放连接  
      connection.release();  
      });
    });
  });
 
  ```
  
  * 使用postman测试
  
 ![FbBEfH.png](https://s2.ax1x.com/2019/01/07/FbBEfH.png)
  * 数据库查看 
  
  ![FbBm6I.png](https://s2.ax1x.com/2019/01/07/FbBm6I.png)
  
## 爬虫
  ```javascript
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
  ```
 * 执行node ./pachong.js
 * 查看数据库 已经有了爬取得数据
 
 [![FbBan0.md.png](https://s2.ax1x.com/2019/01/07/FbBan0.md.png)](https://imgchr.com/i/FbBan0)
