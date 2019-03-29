var UserSQL = {  
    insert:'INSERT INTO test(uid,name) VALUES(uid,name)', 
    queryAll:'SELECT * FROM test',  
    getUserById:'SELECT * FROM test WHERE uid = ? ',
    test:'SELECT * FROM test',
  };
module.exports = UserSQL;