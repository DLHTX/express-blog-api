var express = require('express');
var fs = require('fs');
var router = express.Router();
var session = require('express-session');
router.use(session({secret: 'keyboard cat', resave: false, saveUninitialized: true, cookie: {maxAge: 60000}}));

// 导入MySQL模块
var mysql = require('mysql');

var dbConfig =  {  
    mysql: {   
        host: '192.168.2.100',
        user: 'root',
        port: '4406',
        password : '123456',
        database : 'expressdb'
    }
 }

 var userSQL = {  
    findUser:'SELECT * FROM user WHERE name = ?',
    insert:'INSERT INTO user(name,password) VALUES(?,?)', 
    queryAll:'SELECT * FROM user',  
    getUserById:'SELECT * FROM user WHERE name = ? ',
    test:'SELECT * FROM user',
    login:'SELECT (name,password) FROM user WHERE VALUES(?,?) '
}

var blogSQL = {
    //查询博客下的评论条数和点赞条数
    findAllBlogAndCommit:'select blog.* , (select COUNT(blogId) from blog_commit where blog_commit.blogId = blog.blogId) as reviewsCount , (select COUNT(blogId) from blog_fabulous where blog_fabulous.blogId = blog.blogId) as fabulousCount from blog order by blog.blogId',
    findAllBlog:'SELECT `blog`.* ,`blog_class`.className FROM `blog` LEFT JOIN `blog_class` ON `blog`.blogId = `blog_class`.blogId',//多表关联查询 左连接 查询包含每条博客的标签
    addBlog:'INSERT INTO blog(userName,title,body,creat_time) VALUES(?,?,?,?)',
    updateBlog:'UPDATE blog SET title = ?,body = ?,update_time = ? WHERE blogId = ?',
    deleteBlog:'DELETE FROM blog WHERE blogId = ?',
    findBlogByUsername:'SELECT * FROM blog WHERE userName = ?',
    addBlogClass:'UPDATE blog SET className = ? WHERE blogId = ?',
    findBlogClass:'SELECT DISTINCT className FROM `blog`',
    findBlogByClassName:'SELECT * FROM blog WHERE className = ?',
    findBlogCommitByBlogId:'SELECT * FROM blog_commit WHERE blogId = ?'
    //查找所有博客评论条数 :'select blog.* , (select count(id) from blog_commit where blog_commit.blogId = blog.blogId) as reviewsCountfrom blogorder by blog.blogId)'

}

// 使用DBConfig.js的配置信息创建一个MySQL连接池
var pool = mysql.createPool( dbConfig.mysql );
// 响应一个JSON数据

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//注册接口
router.post('/register', function(req, res, next){//name,password
    // 获取前台页面传过来的参数  
    var param = req.query;   
    // 建立连接 增加一个用户信息 
    pool.getConnection(function(err, connection) {
        connection.query(userSQL.findUser,[param.name],function (err,result) {
             // 以json形式，把操作结果返回给前台页面     
            if(result==false){
                connection.query(userSQL.insert,[param.name,param.password], function(err, result) {
                    if(result) {      
                        result = {   
                            code: 200,   
                            msg:'增加成功'
                        };  
                    }     
                // 以json形式，把操作结果返回给前台页面     
                res.send({success:true,data:result});
                // 释放连接   
                });
            }else{
                res.send({success:false,errorMsg:'该用户存在表中'});
            }
        })
    })
})

//登录
router.post('/login', function(req, res, next){//name password
    // 获取前台页面传过来的参数  
    var param = req.query;   
    // 建立连接 增加一个用户信息 
    pool.getConnection(function(err, connection) {
        connection.query(userSQL.findUser,[param.name],function (err,result) {
             // 以json形式，把操作结果返回给前台页面 
            console.log(result)    
            if(result==false){ //数组为空
                res.send({success:false,errorMsg:'该用户未注册'});
            }else{
                if(result[0].password == param.password){
                    req.session.userInfo = result[0].name
                    res.send({success:true,data:'登录成功'})
                }
            }
        })
    })
})

//检查是否登录
router.get('/islogin', function(req, res, next){//name
    // 获取前台页面传过来的参数  
    var param = req.query;   
    // 建立连接 增加一个用户信息 
    console.log(req.session.userInfo)
    if(req.session.userInfo == param.name){
        res.send({success:true,data:req.session.userInfo,msg:'已登录'});
    }else{
        res.send({success:false,data:'未登录'});
    }
})

//注销
router.post('/logout', function(req, res, next){
    // 获取前台页面传过来的参数  
    var param = req.query;   
    req.session.destroy();
    res.send({success:true,data:'注销成功'});
})

//添加博客
router.post('/addBlog', function(req, res, next){//name,title,body
    var param = req.query;
    var date = new Date()
    pool.getConnection(function(err, connection) {
        connection.query(blogSQL.addBlog,[param.name,param.title,param.body,date],function (err,result) {
            if(err){
                res.send({success:true,data:err,msg:'添加失败'});
            }
            res.send({success:true,data:'添加成功'});
        })
    })
})

//删除博客
router.post('/deleteBlog', function(req, res, next){ //blogId
    var param = req.query;
    pool.getConnection(function(err, connection) {
        connection.query(blogSQL.deleteBlog,[param.blogId],function (err,result) {
            if(err){
                res.send({success:true,data:err,msg:'添加失败'});
            }
            res.send({success:true,data:'删除成功'});
        })
    })
})

//更改博客
router.post('/updataBlog', function(req, res, next){ //title,body,blogId
    var param = req.query;
    pool.getConnection(function(err, connection) {
        connection.query(blogSQL.updateBlog,[param.title,param.body,param.blogId,new Date()],function (err,result) {
            if(err){
                res.send({success:true,data:err,msg:'添加失败'});
            }
            res.send({success:true,data:'更改成功'});
        })
    })
})

//查某人收藏的博客
router.post('/findBlogByUsername', function(req, res, next){ //username
    var param = req.query;
    pool.getConnection(function(err, connection) {
        connection.query(blogSQL.findBlogByUsername,[param.userName],function (err,result) { 
            if(result==false){
                res.send({success:true,data:'此人很懒没有博客'});
            }else{
                res.send({success:true,data:result});
            }
        })
    })
})

//添加博客的分类名
router.post('/addBlogClass', function(req, res, next){ //username
    var param = req.query;
    pool.getConnection(function(err, connection) {
        connection.query(blogSQL.addBlogClass,[param.className,param.blogId],function (err,result) {
            if(err){
                res.send({success:true,data:err,msg:'添加失败'});
            }else{
                res.send({success:true,data:'添加成功'});
            }
            
        })
    })
})

//查找所有博客(包括评论条数和点赞数)
router.get('/findAllBlogAndCommit', function(req, res, next){ //username
    var param = req.query;
    pool.getConnection(function(err, connection) {
        connection.query(blogSQL.findAllBlogAndCommit,function (err,result) {
            if(err){
                res.send({success:false,data:err,msg:'添加失败'});
            }else{
                res.send({success:true,data:result});
            }
        })
    })
})
//查找所有博客分类
router.get('/findBlogClass', function(req, res, next){ //username
    var param = req.query;
    pool.getConnection(function(err, connection) {
        connection.query(blogSQL.findBlogClass,function (err,result) {
            if(err){
                res.send({success:false,data:err,msg:'查找失败'});
            }else{
                res.send({success:true,data:result});
            }
        })
    })
})
//查找博客分类下的所有博客
router.post('/findBlogByClassName', function(req, res, next){ //username
    var param = req.body;//放到body里面
    console.log(param, req.body)
    pool.getConnection(function(err, connection) {
        connection.query(blogSQL.findBlogByClassName,[param.className],function (err,result) {
            if(err){
                res.send({success:false,data:err,msg:'查找失败'});
            }else{
                res.send({success:true,data:result});
            }
        })
    })
})
//增加阅读量 含有过滤ip
router.post('/addReadCount', function(req, res, next){ //username
    var param = req.query || req.body;//放到body里面
    console.log(param, req.body)
    let getClientIp = function (req) {
        return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress || '';
    };
    
    console.log(getClientIp(req));
    let ip = getClientIp(req).match(/\d+.\d+.\d+.\d+/);
    console.log(ip);
    ip = ip ? ip.join('.') : null;
    console.log(ip);


    pool.getConnection(function(err, connection) {
        connection.query("SElECT ip FROM blog_readIp WHERE blogId = ?",[param.blogId],function (err,result) {
            if(err){
                res.send({success:false,data:err,msg:'查找失败'});
            }else{
                if(result==false){
                    connection.query("INSERT INTO blog_readIp(ip,blogId) VALUES (?,?)",[ip,param.blogId],function (err,result1) {
                        if(err){
                            res.send({success:false,data:err,msg:'插入失败1'});
                        }else{
                            connection.query("UPDATE blog SET readcount = readcount+1 WHERE blogId = ?",[param.blogId],function (err,result2) {
                                if(err){
                                    res.send({success:false,data:err,msg:'插入失败2'});
                                }else{
                                    res.send({success:true,data:result2});
                                }
                            })
                        }
                    })
                }else{
                    res.send({success:false,data:err,msg:'插入失败3'});
                }
            }
        })
    })
})

//增加点赞数 含有过滤用户 参数blogId userName
router.post('/addFabulous', function(req, res, next){ //username
    var param = req.body;//放到body里面
    pool.getConnection(function(err, connection) {
        connection.query('select blogId from blog_fabulous where commitName = ?',[param.userName],function (err,result) {
            console.log(result,result == false)
                var exit 
                result.forEach(item=>{
                    console.log(item.blogId)
                    if(item.blogId==param.blogId){
                        exit = true
                        
                    }else{
                        exit = false
                    }
                })
                if(!exit){
                    connection.query('INSERT INTO blog_fabulous(commitName,blogId) VALUES(?,?)',[param.userName,param.blogId],function (err,result) {
                        if(err) {
                            res.send({success:false,data:err,msg:'点赞失败2'})
                        }
                        else {
                            res.send({success:true,data:'点赞成功!'});
                        }
                    })
                }else{
                    res.send({success:false,data:err,msg:'已经点赞过了,不要重复点赞'});
                }
        })
    })
    
})

//查找该博客下所有评论
router.get('/findBlogCommitByBlogId', function(req, res, next){ //username
    var param = req.query;
    console.log(param, req.body)
    pool.getConnection(function(err, connection) {
        connection.query(blogSQL.findBlogCommitByBlogId,[param.blogId],function (err,result) {
            if(err){
                res.send({success:false,data:err,msg:'查找失败'});
            }else{
                res.send({success:true,data:result});
            }
        })
    })
})

//上传图片接口
router.post('/uploadImg', function(req, res, next){ //username
    var param = req.body;
    var imgData = req.body.imgData;
    var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data, 'base64');
    var timeStemp = new Date().getTime()
        fs.writeFile("./userAvator/" + timeStemp +".png", dataBuffer, function(err) {
            if(err){
            res.send(err);
        }else{
            pool.getConnection(function(err, connection) {
                connection.query('SELECT * FROM userImgApi WHERE userPhone = ?',[param.userPhone],function (err,result) {
                    if(err){
                        res.send({success:false,data:err,msg:'失败'});
                    }else if(result==false){ //为空的情况
                        connection.query('INSERT INTO userImgApi(userPhone,imgData) VALUES(?,?)',[param.userPhone,timeStemp],function (err,result) {
                            if(err){
                                res.send({success:false,data:err,msg:'失败'});
                            }else{
                                res.send({success:false,data:timeStemp,msg:'上传成功'});
                            }
                        })
                    }else{//不为空的情况
                        connection.query('UPDATE userImgApi SET imgData = ? WHERE userPhone = ?',[timeStemp,param.userPhone],function (err,result) {
                            if(err){
                                res.send({success:false,data:err,msg:'失败'});
                            }else{
                                res.send({success:false,data:timeStemp,msg:'上传成功'});
                            }
                        })
                    }
                })
            })
           
        }
    });
    
})

//获取用户头像
router.get('/getImg', function(req, res, next){ //username
    var param = req.query;
    var timeStemp = new Date().getTime()
    pool.getConnection(function(err, connection) {
        connection.query('SELECT imgData FROM userImgApi WHERE userPhone = ?',[param.userPhone],function (err,result) {
            if(err){
                res.send({success:false,data:err,msg:'失败'});
            }else if(result==false){
                res.send({success:true,msg:'该用户无头像'});
            }else{
                fs.readFile('./userAvator/'+ result[0].imgData +'.png',"base64",function (err, data) {
                    if (err) {
                        return console.error(err);
                    }
                    res.send({success:true,data:data});
                })
            }
        })
    })

    

})

module.exports = router;
