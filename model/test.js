var mysql = require('mysql');
var connection ={
  host     : '192.168.2.100',
  user     : 'root',
  port: '4406',
  password : '123456',
  database : 'expressdb'
};

let connect=mysql.createConnection(connection);
 
connect.connect(function(err){
    if(err){
        console.log(`mysql连接失败: ${err},正在重新连接...`);
    }else{
        console.log("mysql连接成功!");
    }
});
